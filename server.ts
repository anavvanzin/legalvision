import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getUserAdjudicationsByUid,
  insertUserAdjudication,
  deleteUserAdjudicationById,
  getUserSavedLiteratureByUid,
  insertUserSavedLiterature,
} from './src/db/users.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelayMs = 600
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      const delay =
        !Number.isNaN(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `HTTP ${response.status} (${response.statusText}) from ${url}: ${errorBody.slice(0, 300)}`
    );
  }
  throw new Error(`Exhausted retries for ${url}`);
}

function reconstructAbstract(invertedIndex?: Record<string, number[]> | null): string {
  if (!invertedIndex || typeof invertedIndex !== 'object') {
    return '';
  }
  const pairs: Array<[string, number]> = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        pairs.push([word, pos]);
      }
    }
  }
  pairs.sort((a, b) => a[1] - b[1]);
  return pairs.map((p) => p[0]).join(' ');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // 1. Google Search Grounding Route for FRCP Rules 4, 12, 14 and AO Forms (gemini-3.8-flash)
  app.post('/api/grounding/frcp', async (req, res) => {
    try {
      const queryText = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
      const formCode = typeof req.body?.formCode === 'string' ? req.body.formCode.trim() : 'AO 399 / AO 440 / AO 441';

      if (!queryText) {
        res.status(400).json({ error: 'Forneça uma consulta jurídica ou processual não vazia.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Atue como especialista em Direito Processual Civil Federal dos Estados Unidos (Federal Rules of Civil Procedure — FRCP) e teoria da argumentação jurídica (esquemas de Classificação Verbal e Regra Estabelecida de Walton & Gordon).
Contexto do formulário sob análise: ${formCode}.
Consulta do pesquisador: ${queryText}

Responda em português técnico e claro, estruturando:
1. Regra Normativa Positivada (dispositivos exatos da Fed. R. Civ. P. 4, 12 ou 14 e prazos de 21, 60 ou 90 dias).
2. Condições de Aplicação e Exceções Derrotadoras (ex.: réu doméstico vs. exterior, agência/oficial dos EUA, justa causa / "good cause", defesas preservadas vs. renunciadas).
3. Relação com o Paratexto do Formulário Oficial (${formCode}) para separar o que é observado no documento do que decorre da norma.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchEntryPointRendered =
        response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.renderedContent || null;
      const sources = rawChunks
        .map((chunk: { web?: { uri?: string; title?: string } }) => ({
          title: chunk.web?.title || chunk.web?.uri || 'Fonte Web Verificada',
          uri: chunk.web?.uri || '',
        }))
        .filter((s: { uri: string }) => Boolean(s.uri));

      const nowIso = new Date().toISOString();
      const answerText = response.text || '';
      res.json({
        query: queryText,
        formCode,
        answer: answerText,
        text: answerText,
        searchEntryPointRendered,
        sources,
        model: 'gemini-3.8-flash',
        timestamp: nowIso,
        checkedAt: nowIso,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: `Falha ao consultar Google Search Grounding: ${message}`,
      });
    }
  });

  // 2. OpenAlex Academic Literature Proxy Route (Science Skill)
  app.get('/api/openalex/works', async (req, res) => {
    try {
      const rawSearch =
        typeof req.query.q === 'string'
          ? req.query.q
          : typeof req.query.search === 'string'
          ? req.query.search
          : 'legal argumentation schemes Walton';
      const search = rawSearch.trim() || 'legal argumentation schemes Walton';
      const oaOnly = req.query.oaOnly === 'true';
      const fromYear = typeof req.query.from_year === 'string' ? req.query.from_year.trim() : '';
      const perPage = Math.min(Number(req.query.per_page || req.query.perPage) || 12, 25);

      const params = new URLSearchParams();
      params.set('search', search);
      const filters: string[] = [];
      if (oaOnly) {
        filters.push('is_oa:true');
      }
      if (fromYear && /^\d{4}$/.test(fromYear)) {
        filters.push(`from_publication_date:${fromYear}-01-01`);
      }
      if (filters.length > 0) {
        params.set('filter', filters.join(','));
      }
      params.set('sort', 'cited_by_count:desc');
      params.set('per-page', String(perPage));
      params.set(
        'select',
        'id,display_name,publication_year,cited_by_count,doi,open_access,best_oa_location,primary_location,authorships,abstract_inverted_index'
      );

      const politeEmail = process.env.USER_EMAIL || 'scientist@example.com';
      params.set('mailto', politeEmail);
      if (process.env.OPENALEX_API_KEY) {
        params.set('api_key', process.env.OPENALEX_API_KEY);
      }

      const url = `https://api.openalex.org/works?${params.toString()}`;
      const upstream = await fetchWithRetry(url, {
        headers: {
          Accept: 'application/json',
        },
      });
      const data = (await upstream.json()) as {
        meta?: { count?: number };
        results?: Array<{
          id: string;
          display_name?: string;
          publication_year?: number;
          cited_by_count?: number;
          doi?: string;
          open_access?: { is_oa?: boolean; oa_url?: string };
          best_oa_location?: { pdf_url?: string; landing_page_url?: string };
          primary_location?: { source?: { display_name?: string } };
          authorships?: Array<{ author?: { display_name?: string } }>;
          abstract_inverted_index?: Record<string, number[]> | null;
        }>;
      };

      const works = (data.results || []).map((w) => {
        const shortId = (w.id || '').replace('https://openalex.org/', '') || 'W0';
        const authors = (w.authorships || [])
          .map((a) => a.author?.display_name)
          .filter(Boolean)
          .slice(0, 4)
          .join(', ');
        const abstractText = reconstructAbstract(w.abstract_inverted_index);
        const venueName = w.primary_location?.source?.display_name || 'Publicação Acadêmica';
        return {
          id: w.id,
          shortId,
          openalexId: shortId,
          title: w.display_name || 'Sem título',
          publicationYear: w.publication_year || 2000,
          citedByCount: w.cited_by_count || 0,
          doiUrl: w.doi || w.best_oa_location?.landing_page_url || w.id,
          oaUrl: w.best_oa_location?.pdf_url || w.open_access?.oa_url || '',
          isOa: Boolean(w.open_access?.is_oa),
          venue: venueName,
          sourceName: venueName,
          authorsSummary: authors || 'Autor não listado',
          abstractText: abstractText ? abstractText.slice(0, 520) + (abstractText.length > 520 ? '…' : '') : '',
        };
      });

      const totalCount = data.meta?.count || works.length;
      res.json({
        totalCount,
        meta: { count: totalCount },
        works,
        results: works,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: `Erro na consulta ao OpenAlex: ${message}`,
      });
    }
  });

  // 3. Pre-Flight SHA-256 & Saved Execution Status Route
  app.get('/api/execute/status', async (_req, res) => {
    try {
      const { verifyPreFlightHashes, loadSavedExecutionResults } = await import(
        './src/utils/serverExecutionEngine.ts'
      );
      const hashes = verifyPreFlightHashes(__dirname);
      const records = loadSavedExecutionResults(__dirname);
      res.json({
        hashes,
        allHashesVerified: hashes.every((h) => h.verified),
        records,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: `Falha ao verificar status de execução: ${message}`,
      });
    }
  });

  // 4. Live Multimodal Execution Route (CASE01 R1 + Federal Forms AO 399 / 440 / 441)
  app.post('/api/execute/run', async (req, res) => {
    try {
      const scopeRaw = req.body?.scope;
      const scope: 'all' | 'case01' | 'federal_forms' =
        scopeRaw === 'case01' || scopeRaw === 'federal_forms' ? scopeRaw : 'all';

      const { verifyPreFlightHashes, runLiveExecutionSuite } = await import(
        './src/utils/serverExecutionEngine.ts'
      );
      const hashes = verifyPreFlightHashes(__dirname);
      if (!hashes.every((h) => h.verified)) {
        res.status(400).json({
          error: 'Falha na verificação SHA-256 pré-voo dos estímulos canônicos.',
          hashes,
        });
        return;
      }

      const records = await runLiveExecutionSuite(__dirname, scope);
      res.json({
        hashes,
        records,
        executedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: `Erro durante a execução multimodal ao vivo: ${message}`,
      });
    }
  });

  // 5. Authenticated Cloud SQL Routes (Adjudications & Literature Sync)
  app.get('/api/adjudications', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await getOrCreateUser(uid, email);
      const records = await getUserAdjudicationsByUid(uid);
      res.json({ records });
    } catch (error: any) {
      console.error('Failed to fetch adjudications:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch adjudications' });
    }
  });

  app.post('/api/adjudications', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { caseId, schemeId, targetId, decision, deadlineConclusion, notes } = req.body || {};
      const record = await insertUserAdjudication(uid, email, {
        caseId: String(caseId || '').slice(0, 60),
        schemeId: String(schemeId || '').slice(0, 60),
        targetId: String(targetId || '').slice(0, 120),
        decision: String(decision || 'draft').slice(0, 40),
        deadlineConclusion: String(deadlineConclusion || '').slice(0, 180),
        notes: String(notes || '').slice(0, 2000),
      });
      res.status(201).json({ record });
    } catch (error: any) {
      console.error('Failed to create adjudication:', error);
      res.status(500).json({ error: error.message || 'Failed to create adjudication' });
    }
  });

  app.delete('/api/adjudications/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }
      await deleteUserAdjudicationById(uid, id);
      res.json({ deleted: true });
    } catch (error: any) {
      console.error('Failed to delete adjudication:', error);
      res.status(500).json({ error: error.message || 'Failed to delete adjudication' });
    }
  });

  app.get('/api/literature', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await getOrCreateUser(uid, email);
      const works = await getUserSavedLiteratureByUid(uid);
      res.json({ works });
    } catch (error: any) {
      console.error('Failed to fetch literature:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch literature' });
    }
  });

  app.post('/api/literature', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { openalexId, title, authorsSummary, publicationYear, doiUrl } = req.body || {};
      const work = await insertUserSavedLiterature(uid, email, {
        openalexId: String(openalexId || '').slice(0, 120),
        title: String(title || '').slice(0, 500),
        authorsSummary: String(authorsSummary || '').slice(0, 500),
        publicationYear: Number(publicationYear) || 2000,
        doiUrl: String(doiUrl || '').slice(0, 500),
      });
      res.status(201).json({ work });
    } catch (error: any) {
      console.error('Failed to save literature:', error);
      res.status(500).json({ error: error.message || 'Failed to save literature' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
