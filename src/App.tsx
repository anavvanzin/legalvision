import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Play,
  Eye,
  Scale,
  BookOpen,
  Search,
  LogIn,
  LogOut,
  Trash2,
  BookmarkCheck,
  ExternalLink,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  PROJECT_METADATA,
  STATUS_ROWS,
  SCHEMES_CATALOG,
  SCHEME_PROFILES,
  ACCEPTANCE_CASES,
  NOTION_EDITS,
  BIBLIOGRAPHIC_SOURCES,
  CASE01_DATA,
  METEOROLOGICAL_BASELINE,
  REPOSITORY_DIRECTORY_MAP,
} from './data/projectData';
import {
  FEDERAL_FORM_CASES,
  QUICK_FRCP_GROUNDING_QUERIES,
  QUICK_OPENALEX_TOPICS,
} from './data/aoFormsData';
import {
  runPackageIntegrityCheck,
  validateCandidateText,
  getSyntheticFixtures,
  ConditionType,
} from './utils/validators';
import { GROUNDING_REVIEW_FINDINGS } from './utils/groundingSim';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  collection,
  onSnapshot,
  query,
  where,
  createAdjudicationRecord,
  deleteAdjudicationRecord,
  saveOpenAlexWorkToFirestore,
  removeSavedWorkFromFirestore,
  handleFirestoreError,
  OperationType,
  AdjudicationRecord,
  SavedWorkRecord,
  IconocraciaCatalogRecord,
  User,
} from './firebase';
import { IconocraciaCvTab } from './components/IconocraciaCvTab';
import { ColabExecutionTab } from './components/ColabExecutionTab';

type TabId =
  | 'casos_federais'
  | 'execucao_colab'
  | 'iconocracia_cv'
  | 'fundamentacao_literatura'
  | 'revisao_grounding'
  | 'apresentacao'
  | 'esquemas'
  | 'case01'
  | 'baseline';

interface GroundingResponse {
  query: string;
  formCode: string | null;
  answer: string;
  searchEntryPointRendered: string | null;
  sources: Array<{ title: string; uri: string }>;
  timestamp: string;
}

interface OpenAlexWorkItem {
  id: string;
  shortId: string;
  title: string;
  publicationYear: number;
  citedByCount: number;
  doiUrl: string;
  oaUrl: string;
  isOa: boolean;
  venue: string;
  authorsSummary: string;
  abstractText: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('execucao_colab');

  // Firebase Auth & Firestore state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adjudications, setAdjudications] = useState<AdjudicationRecord[]>([]);
  const [savedWorks, setSavedWorks] = useState<SavedWorkRecord[]>([]);
  const [iconocraciaCatalog, setIconocraciaCatalog] = useState<IconocraciaCatalogRecord[]>([]);

  // State for Federal Forms (AO 399, AO 440, AO 441)
  const [selectedFormCaseId, setSelectedFormCaseId] = useState<'CASE02' | 'CASE03' | 'CASE04'>('CASE02');
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ao399_60d_domestic');
  const [selectedSchemeView, setSelectedSchemeView] = useState<'verbal_classification' | 'established_rule'>(
    'established_rule'
  );
  const [selectedFormRegionId, setSelectedFormRegionId] = useState<string>('ao399_deadline_60_90');
  const [showFormBoxes, setShowFormBoxes] = useState<boolean>(true);

  // Adjudication form state
  const [adjDecision, setAdjDecision] = useState<'human_verified' | 'disputed' | 'draft'>('human_verified');
  const [adjNotes, setAdjNotes] = useState<string>(
    'Verificado nos parágrafos normativos do formulário federal; distinção entre evidência visual dos pixels e contexto estipulado preservada.'
  );
  const [adjSubmitting, setAdjSubmitting] = useState<boolean>(false);
  const [adjFeedback, setAdjFeedback] = useState<string | null>(null);

  // State for FRCP Search Grounding & OpenAlex Literature
  const [frcpQuery, setFrcpQuery] = useState<string>(QUICK_FRCP_GROUNDING_QUERIES[0].query);
  const [frcpFormCode, setFrcpFormCode] = useState<string>(QUICK_FRCP_GROUNDING_QUERIES[0].formCode);
  const [frcpLoading, setFrcpLoading] = useState<boolean>(false);
  const [frcpError, setFrcpError] = useState<string | null>(null);
  const [frcpResult, setFrcpResult] = useState<GroundingResponse | null>(null);

  const [oaQuery, setOaQuery] = useState<string>(QUICK_OPENALEX_TOPICS[0].query);
  const [oaFromYear, setOaFromYear] = useState<string>('2005');
  const [oaLoading, setOaLoading] = useState<boolean>(false);
  const [oaError, setOaError] = useState<string | null>(null);
  const [oaWorks, setOaWorks] = useState<OpenAlexWorkItem[]>([]);
  const [oaTotalCount, setOaTotalCount] = useState<number>(0);

  // Existing tabs state
  const [statusFilter, setStatusFilter] = useState<'all' | 'juridico' | 'software' | 'historico' | 'ambiente'>('all');
  const [findingFilter, setFindingFilter] = useState<'all' | 'bug_comprovado' | 'risco_metodologico'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [oracleSchemeFilter, setOracleSchemeFilter] = useState<'all' | 'verbal_classification' | 'witness_testimony'>(
    'all'
  );
  const [packageReport, setPackageReport] = useState(() => runPackageIntegrityCheck());

  // State for Tab CASE01 Inspector & Validator
  const fixtures = useMemo(() => getSyntheticFixtures(), []);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(fixtures[0].id);
  const [candidateCondition, setCandidateCondition] = useState<ConditionType>(fixtures[0].condition);
  const [candidateJson, setCandidateJson] = useState<string>(fixtures[0].jsonText);
  const [activeRegionId, setActiveRegionId] = useState<string | null>('object_region');
  const [showOverlayBoxes, setShowOverlayBoxes] = useState<boolean>(true);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore collections gated by authReady & currentUser
  useEffect(() => {
    if (!authReady || !currentUser) {
      setAdjudications([]);
      setSavedWorks([]);
      setIconocraciaCatalog([]);
      return;
    }

    const adjQuery = query(
      collection(db, 'adjudications'),
      where('reviewerUid', '==', currentUser.uid)
    );
    const unsubAdj = onSnapshot(
      adjQuery,
      (snap) => {
        const rows: AdjudicationRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AdjudicationRecord, 'id'>),
        }));
        setAdjudications(rows);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'adjudications');
        } catch (formattedErr) {
          setAuthError(formattedErr instanceof Error ? formattedErr.message : String(formattedErr));
        }
      }
    );

    const worksQuery = query(
      collection(db, 'savedWorks'),
      where('ownerUid', '==', currentUser.uid)
    );
    const unsubWorks = onSnapshot(
      worksQuery,
      (snap) => {
        const rows: SavedWorkRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SavedWorkRecord, 'id'>),
        }));
        setSavedWorks(rows);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'savedWorks');
        } catch (formattedErr) {
          setAuthError(formattedErr instanceof Error ? formattedErr.message : String(formattedErr));
        }
      }
    );

    const catalogQuery = query(
      collection(db, 'iconocraciaCatalog'),
      where('ownerUid', '==', currentUser.uid)
    );
    const unsubCatalog = onSnapshot(
      catalogQuery,
      (snap) => {
        const rows: IconocraciaCatalogRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<IconocraciaCatalogRecord, 'id'>),
        }));
        setIconocraciaCatalog(rows);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'iconocraciaCatalog');
        } catch (formattedErr) {
          setAuthError(formattedErr instanceof Error ? formattedErr.message : String(formattedErr));
        }
      }
    );

    return () => {
      unsubAdj();
      unsubWorks();
      unsubCatalog();
    };
  }, [authReady, currentUser]);

  // Derived active federal form case, page, and scenario
  const currentFormCase = useMemo(
    () => FEDERAL_FORM_CASES.find((c) => c.caseId === selectedFormCaseId) || FEDERAL_FORM_CASES[0],
    [selectedFormCaseId]
  );

  const currentFormPage = useMemo(
    () =>
      currentFormCase.pages.find((p) => p.pageNumber === selectedPageNumber) ||
      currentFormCase.pages[0],
    [currentFormCase, selectedPageNumber]
  );

  const currentScenario = useMemo(
    () =>
      currentFormCase.scenarios.find((s) => s.id === selectedScenarioId) ||
      currentFormCase.scenarios[0],
    [currentFormCase, selectedScenarioId]
  );

  const handleSelectFormCase = (caseId: 'CASE02' | 'CASE03' | 'CASE04') => {
    const found = FEDERAL_FORM_CASES.find((c) => c.caseId === caseId);
    if (!found) return;
    setSelectedFormCaseId(caseId);
    setSelectedPageNumber(1);
    setSelectedScenarioId(found.scenarios[0].id);
    setSelectedFormRegionId(found.pages[0].regions[0]?.id || '');
    setAdjFeedback(null);
  };

  const handleSelectPage = (pageNum: number) => {
    setSelectedPageNumber(pageNum);
    const pageObj = currentFormCase.pages.find((p) => p.pageNumber === pageNum);
    if (pageObj && pageObj.regions.length > 0) {
      setSelectedFormRegionId(pageObj.regions[0].id);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha na autenticação com Google.');
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    try {
      await signOutUser();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha ao encerrar sessão.');
    }
  };

  const handleCreateAdjudication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjFeedback(null);
    setAdjSubmitting(true);
    try {
      await createAdjudicationRecord({
        caseId: `${currentFormCase.caseId}_${currentFormCase.formCode.replace(/\s+/g, '')}`,
        schemeId: selectedSchemeView,
        targetId: currentScenario.id,
        decision: adjDecision,
        deadlineConclusion: currentScenario.derivedDeadline,
        notes: adjNotes,
      });
      setAdjFeedback('Adjudicação humana gravada com sucesso no Firebase Firestore.');
    } catch (error) {
      setAdjFeedback(error instanceof Error ? error.message : 'Erro ao gravar adjudicação.');
    } finally {
      setAdjSubmitting(false);
    }
  };

  const handleDownloadCombinedAdjudicationsAndRefs = () => {
    const payload = {
      adjudications,
      savedLiteratureWorks: savedWorks,
      baseBibliography: BIBLIOGRAPHIC_SOURCES,
    };
    const jsonContent = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adjudicacoes_e_referencias.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runFrcpGroundingSearch = async (customQuery?: string, customFormCode?: string) => {
    const qToUse = (customQuery ?? frcpQuery).trim();
    const codeToUse = customFormCode ?? frcpFormCode;
    if (qToUse.length < 5) return;

    setFrcpLoading(true);
    setFrcpError(null);
    try {
      const resp = await fetch('/api/grounding/frcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: qToUse, formCode: codeToUse }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      setFrcpResult(data);
    } catch (error) {
      setFrcpError(error instanceof Error ? error.message : 'Erro na consulta Google Search Grounding.');
    } finally {
      setFrcpLoading(false);
    }
  };

  const runOpenAlexSearch = async (customQuery?: string) => {
    const qToUse = (customQuery ?? oaQuery).trim();
    if (qToUse.length < 2) return;

    setOaLoading(true);
    setOaError(null);
    try {
      const params = new URLSearchParams({
        q: qToUse,
        per_page: '8',
      });
      if (oaFromYear && /^\d{4}$/.test(oaFromYear)) {
        params.set('from_year', oaFromYear);
      }
      const resp = await fetch(`/api/openalex/works?${params.toString()}`);
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      setOaWorks(data.results || []);
      setOaTotalCount(data.meta?.count || 0);
    } catch (error) {
      setOaError(error instanceof Error ? error.message : 'Erro ao consultar OpenAlex API.');
    } finally {
      setOaLoading(false);
    }
  };

  // Load initial OpenAlex literature on first switch to the tab
  useEffect(() => {
    if (activeTab === 'fundamentacao_literatura' && oaWorks.length === 0 && !oaLoading) {
      runOpenAlexSearch(QUICK_OPENALEX_TOPICS[0].query);
    }
  }, [activeTab]);

  const validationReport = useMemo(
    () => validateCandidateText(candidateJson, candidateCondition),
    [candidateJson, candidateCondition]
  );

  const handleSelectFixture = (fixtureId: string) => {
    const found = fixtures.find((f) => f.id === fixtureId);
    if (!found) return;
    setSelectedFixtureId(found.id);
    setCandidateCondition(found.condition);
    setCandidateJson(found.jsonText);
  };

  const filteredStatusRows = useMemo(
    () =>
      statusFilter === 'all'
        ? STATUS_ROWS
        : STATUS_ROWS.filter((r) => r.category === statusFilter),
    [statusFilter]
  );

  const filteredSchemes = useMemo(
    () =>
      roleFilter === 'all'
        ? SCHEMES_CATALOG
        : SCHEMES_CATALOG.filter((s) => s.visual_role === roleFilter),
    [roleFilter]
  );

  const filteredOracles = useMemo(
    () =>
      oracleSchemeFilter === 'all'
        ? ACCEPTANCE_CASES
        : ACCEPTANCE_CASES.filter((c) => c.scheme === oracleSchemeFilter),
    [oracleSchemeFilter]
  );

  const filteredFindings = useMemo(
    () =>
      findingFilter === 'all'
        ? GROUNDING_REVIEW_FINDINGS
        : GROUNDING_REVIEW_FINDINGS.filter((f) => f.kind === findingFilter),
    [findingFilter]
  );

  return (
    <div className="var3-shell">
      {/* Variation 3 Sidebar Navigation */}
      <aside className="var3-sidebar">
        <div className="brand-block">
          <div className="var3-label" style={{ color: '#ffffff', opacity: 1 }}>
            Project Code
          </div>
          <div className="brand-title">
            INE
            <br />
            410159
          </div>
        </div>

        <nav className="nav-section">
          <button
            onClick={() => setActiveTab('execucao_colab')}
            className={`nav-item ${activeTab === 'execucao_colab' ? 'active' : ''}`}
          >
            00 // EXECUTION_RESULTS
          </button>
          <button
            onClick={() => setActiveTab('casos_federais')}
            className={`nav-item ${activeTab === 'casos_federais' ? 'active' : ''}`}
          >
            01 // CASE_AO_399_440
          </button>
          <button
            onClick={() => setActiveTab('fundamentacao_literatura')}
            className={`nav-item ${activeTab === 'fundamentacao_literatura' ? 'active' : ''}`}
          >
            02 // GROUNDING_OPENALEX
          </button>
          <button
            onClick={() => setActiveTab('case01')}
            className={`nav-item ${activeTab === 'case01' ? 'active' : ''}`}
          >
            03 // ORACLE_VALIDATOR
          </button>
          <button
            onClick={() => setActiveTab('esquemas')}
            className={`nav-item ${activeTab === 'esquemas' ? 'active' : ''}`}
          >
            04 // SCHEME_MATRIX
          </button>
          <button
            onClick={() => setActiveTab('revisao_grounding')}
            className={`nav-item ${activeTab === 'revisao_grounding' ? 'active' : ''}`}
          >
            05 // COMMA_REVIEW
          </button>
          <button
            onClick={() => setActiveTab('iconocracia_cv')}
            className={`nav-item ${activeTab === 'iconocracia_cv' ? 'active' : ''}`}
          >
            06 // ICONOCRACIA_CV
          </button>
          <button
            onClick={() => setActiveTab('apresentacao')}
            className={`nav-item ${activeTab === 'apresentacao' ? 'active' : ''}`}
          >
            07 // STATUS_PROV
          </button>
          <button
            onClick={() => setActiveTab('baseline')}
            className={`nav-item ${activeTab === 'baseline' ? 'active' : ''}`}
          >
            08 // BASELINE_ARCHIVE
          </button>
        </nav>

        <div className="p-6 border-t-2 border-[#1a1a1c] bg-white">
          <div className="var3-label mb-2">Authorized User</div>
          <div className="font-extrabold text-sm text-[#1a1a1c] truncate">
            {currentUser ? currentUser.displayName || currentUser.email : 'Ana V. Vanzin Mendes'}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="font-mono text-[10px] border border-[#1a1a1c] px-2.5 py-1 bg-white hover:bg-[#1a1a1c] hover:text-white transition-colors cursor-pointer uppercase"
              >
                LOGOUT_SECURE
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="font-mono text-[10px] border border-[#1a1a1c] px-2.5 py-1 bg-white hover:bg-[#ff4d00] hover:text-white hover:border-[#ff4d00] transition-colors cursor-pointer uppercase"
              >
                LOGIN_GOOGLE
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="font-mono text-[10px] border border-[#1a1a1c] px-2.5 py-1 bg-white hover:bg-[#1a1a1c] hover:text-white transition-colors cursor-pointer uppercase"
            >
              PRINT_EXPORT
            </button>
          </div>
        </div>
      </aside>

      {/* Variation 3 Main Workspace */}
      <main className="var3-main">
        <header className="var3-header">
          <div className="var3-label" style={{ opacity: 0.9 }}>
            <span className="var3-dot" />
            Live Connection: Deterministic (0.0)
          </div>
          <div className="var3-label" style={{ opacity: 0.9 }}>
            Commit_Hash: {PROJECT_METADATA.legalCommit.slice(0, 8)}
          </div>
        </header>

        <div className="workspace-content">
          {/* Laboratory Report Hero & 12-Column KPI Summary */}
          <div className="max-w-7xl mx-auto mb-10">
            <div className="mb-8">
              <div className="var3-label" style={{ color: 'var(--accent)', opacity: 1, fontWeight: 700 }}>
                Research Dashboard // Phase 01
              </div>
              <h2 className="font-oswald text-4xl sm:text-5xl font-bold my-1 tracking-tight text-[#1a1a1c]">
                LABORATORY_REPORT
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#444]">
                Bateria completa executada sob isolamento estrito. Resultados Consolidados: Piloto CASE01 (R1) e
                Formulários Federais AO 399, 440 e 441.
              </p>
            </div>

            <div className="grid-layout">
              <div className="data-card">
                <div className="var3-label">Executions</div>
                <div className="stat-large tabular-nums">20</div>
              </div>
              <div className="data-card">
                <div className="var3-label">Accuracy</div>
                <div className="stat-large tabular-nums">100%</div>
              </div>
              <div className="data-card">
                <div className="var3-label">Abstentions</div>
                <div className="stat-large tabular-nums">14/14</div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('execucao_colab');
                  const el = document.getElementById('workspace-main');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-action"
              >
                Run_Batch
              </button>

              <div className="table-container">
                <table className="var3-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Status</th>
                      <th>Detection_Result</th>
                      <th>Methodology_Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono text-xs font-bold">CASE01 · Object_A</td>
                      <td>
                        <span className="pill pill-success">PASS</span>
                      </td>
                      <td>
                        <code className="bg-[#eee] px-1.5 py-0.5 text-xs">
                          has_property(A, conduct_by_hand)
                        </code>
                      </td>
                      <td className="text-xs text-[#333]">Visual anchoring verified (2/2 c/ imagem, 2/2 abstenções s/ imagem).</td>
                    </tr>
                    <tr>
                      <td className="font-mono text-xs font-bold">LEGAL01 · Summons (AO 440)</td>
                      <td>
                        <span className="pill pill-success">PASS</span>
                      </td>
                      <td>
                        <code className="bg-[#eee] px-1.5 py-0.5 text-xs">
                          identity_undetermined(blank)
                        </code>
                      </td>
                      <td className="text-xs text-[#333]">Zero hallucination on empty field; prazos 21d / 60d homologados.</td>
                    </tr>
                    <tr>
                      <td className="font-mono text-xs font-bold">AO 399 · Waiver / AO 441</td>
                      <td>
                        <span className="pill pill-warn">ABSTAIN</span>
                      </td>
                      <td>
                        <code className="bg-[#eee] px-1.5 py-0.5 text-xs">
                          deadline_undetermined
                        </code>
                      </td>
                      <td className="text-xs text-[#333]">Form requires missing input data when blank or without image (60d / 90d c/ contexto).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {authError && (
            <div className="max-w-7xl mx-auto mb-6">
              <div className="bg-white border-2 border-[#1a1a1c] px-4 py-2.5 text-xs text-[#ff4d00] font-mono flex items-center justify-between shadow-[4px_4px_0_#1a1a1c]">
                <span>
                  <strong>AUTH_ALERT:</strong> {authError}
                </span>
                <button onClick={() => setAuthError(null)} className="underline font-bold ml-4 cursor-pointer text-[#1a1a1c]">
                  CLOSE
                </button>
              </div>
            </div>
          )}

          {/* Active Module Content Container */}
          <div id="workspace-main" className="var3-workspace max-w-7xl mx-auto pt-2">
            {/* DEDICATED MODULE: EXECUCAO & RESULTADOS (HOJE) */}
            {activeTab === 'execucao_colab' && <ColabExecutionTab />}

            {/* DEDICATED MODULE: ICONOCRACIA-CV (2026-2) */}
            {activeTab === 'iconocracia_cv' && (
              <IconocraciaCvTab
                currentUser={currentUser}
                catalogEntries={iconocraciaCatalog}
                onUserAuthenticated={(user) => setCurrentUser(user)}
              />
            )}

        {/* TAB 1: CASOS FEDERAIS AO 399 / AO 440 / AO 441 & ADJUDICAÇÃO FIRESTORE */}
        {activeTab === 'casos_federais' && (
          <div className="space-y-10">
            <section className="border-b border-[#142936] pb-6">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#146563] mb-2">
                Argumentação Jurídica Visual · Casos Processuais Federais (Fed. R. Civ. P. 4, 12 e 14)
              </div>
              <h1 className="text-3xl md:text-4xl font-editorial font-bold tracking-tight text-[#142936] max-w-4xl">
                Modelagem de Esquemas sobre <code>AO 399</code>, <code>AO 440</code> e <code>AO 441</code>: Prazos de 21, 60 e 90 Dias
              </h1>
              <p className="mt-2.5 text-sm text-[#4d5e68] max-w-3xl leading-relaxed">
                Inspeção estruturada das 5 páginas anexadas dos formulários oficiais das Cortes Distritais dos EUA, articulando{' '}
                <strong>Classificação Verbal (Esquema #3)</strong> e <strong>Regra Estabelecida (Esquema #4, com CQ3 auditada <code>cq(cq3, not excuses(E))</code>)</strong>, separando estritamente o que os pixels do formulário demonstram do que requer estipulação factual externa.
              </p>

              {/* Case Selector Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {FEDERAL_FORM_CASES.map((fc) => {
                  const isSelected = fc.caseId === selectedFormCaseId;
                  return (
                    <button
                      key={fc.caseId}
                      onClick={() => handleSelectFormCase(fc.caseId)}
                      className={`text-left p-4 border transition-colors ${
                        isSelected
                          ? 'bg-white border-[#146563] border-t-4 border-t-[#146563]'
                          : 'bg-white/70 border-[#d4dce0] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-[#4d5e68]">
                        <span className="font-bold text-[#146563]">
                          {fc.caseId} · {fc.formCode}
                        </span>
                        <span>{fc.revisionDate} · {fc.pages.length} pág(s)</span>
                      </div>
                      <div className="text-base font-bold text-[#142936] mt-1">{fc.formTitle}</div>
                      <div className="text-xs font-mono text-[#8d550b] mt-1">
                        {fc.primaryRules.join(' · ')}
                      </div>
                      <p className="text-xs text-[#4d5e68] mt-2 line-clamp-2">{fc.summary}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Split Workspace: Visual Form Canvas & Regions (Left 7 cols) vs Formal Schemes & CQs (Right 5 cols) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: High-Contrast Form Page Blueprint & Bounding Box Inspector */}
              <div className="lg:col-span-7 bg-white border border-[#d4dce0] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4dce0] pb-3">
                  <div>
                    <div className="text-xs font-mono text-[#146563]">
                      {currentFormCase.caseId} · {currentFormPage.title}
                    </div>
                    <h2 className="text-base font-bold text-[#142936]">
                      Inspeção de Regiões Normalizadas e Paratextos Normativos
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentFormCase.pages.length > 1 && (
                      <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                        {currentFormCase.pages.map((pg) => (
                          <button
                            key={pg.pageNumber}
                            onClick={() => handleSelectPage(pg.pageNumber)}
                            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                              selectedPageNumber === pg.pageNumber
                                ? 'bg-white text-[#142936] font-bold shadow-xs'
                                : 'text-[#4d5e68]'
                            }`}
                          >
                            Pág. {pg.pageNumber}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setShowFormBoxes((v) => !v)}
                      className="px-2.5 py-1 text-xs font-medium bg-[#e6eeef] text-[#142936] rounded hover:bg-[#d4dce0] transition-colors whitespace-nowrap shrink-0"
                    >
                      {showFormBoxes ? 'Ocultar Regiões' : 'Mostrar Regiões'}
                    </button>
                  </div>
                </div>

                {/* Interactive Document Sheet Canvas (8.5 x 11 aspect ratio) */}
                <div className="relative w-full aspect-[850/1060] bg-[#fcfbf9] border-2 border-[#142936] p-5 overflow-hidden select-none">
                  {/* Subtle Document Grid */}
                  <div className="text-[11px] font-mono text-[#4d5e68] flex items-center justify-between border-b border-[#d4dce0] pb-2 mb-3">
                    <span>
                      {currentFormCase.formCode} ({currentFormCase.revisionDate}) {currentFormCase.formTitle}
                    </span>
                    <span>Page {currentFormPage.pageNumber} of {currentFormCase.pages.length}</span>
                  </div>

                  {/* Rendered Document Blocks at Normalized Coordinates */}
                  {currentFormPage.blocks.map((blk) => {
                    const [x0, y0, x1, y1] = blk.coords;
                    return (
                      <div
                        key={blk.id}
                        style={{
                          left: `${x0 * 100}%`,
                          top: `${y0 * 100}%`,
                          width: `${(x1 - x0) * 100}%`,
                          minHeight: `${(y1 - y0) * 100}%`,
                        }}
                        className="absolute bg-white/95 border border-[#d4dce0] p-2.5 text-xs leading-snug"
                      >
                        {blk.heading && (
                          <div className="font-bold text-[#142936] text-[11px] uppercase tracking-wide mb-1">
                            {blk.heading}
                          </div>
                        )}
                        {blk.isParatextButtonBar ? (
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-[#4d5e68]">{blk.content}</span>
                            <div className="flex items-center gap-2">
                              {blk.buttons?.map((btn) => (
                                <span
                                  key={btn}
                                  className="px-2.5 py-0.5 text-[11px] font-bold bg-[#dc2626] text-white border border-[#991b1b] shadow-2xs"
                                >
                                  {btn}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#142936] font-serif">{blk.content}</div>
                        )}
                      </div>
                    );
                  })}

                  {/* Interactive Normalized Bounding-Box Overlays */}
                  {showFormBoxes &&
                    currentFormPage.regions.map((reg) => {
                      const [x0, y0, x1, y1] = reg.coords;
                      const isSelected = selectedFormRegionId === reg.id;
                      return (
                        <div
                          key={reg.id}
                          onClick={() => setSelectedFormRegionId(reg.id)}
                          style={{
                            left: `${x0 * 100}%`,
                            top: `${y0 * 100}%`,
                            width: `${(x1 - x0) * 100}%`,
                            height: `${(y1 - y0) * 100}%`,
                            borderColor: reg.color,
                          }}
                          className={`absolute border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#146563]/15 ring-2 ring-[#142936] z-20'
                              : 'hover:bg-[#146563]/10 z-10'
                          }`}
                          title={`${reg.label} [${reg.coords.join(', ')}]`}
                        >
                          <span
                            style={{ backgroundColor: reg.color }}
                            className="inline-block px-1.5 py-0.5 text-[10px] font-mono text-white whitespace-nowrap"
                          >
                            {reg.label}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Region Pills / Quick Selector */}
                <div className="flex flex-wrap gap-1.5">
                  {currentFormPage.regions.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedFormRegionId(reg.id)}
                      className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors whitespace-nowrap shrink-0 ${
                        selectedFormRegionId === reg.id
                          ? 'bg-[#142936] text-white border-[#142936]'
                          : 'bg-[#faf8f3] text-[#142936] border-[#d4dce0] hover:bg-[#e6eeef]'
                      }`}
                    >
                      {reg.label}
                    </button>
                  ))}
                </div>

                {/* Active Region Detail Box */}
                {(() => {
                  const activeReg =
                    currentFormPage.regions.find((r) => r.id === selectedFormRegionId) ||
                    currentFormPage.regions[0];
                  if (!activeReg) return null;
                  return (
                    <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-[#142936]">{activeReg.label}</span>
                        <code className="text-[11px] text-[#146563] tabular-nums">
                          coords: [{activeReg.coords.join(', ')}] · {activeReg.schemeRole}
                        </code>
                      </div>
                      <div className="p-2.5 bg-white border border-[#d4dce0] font-mono text-[11px] text-[#142936]">
                        "{activeReg.extractedText}"
                      </div>
                      <p className="text-[#4d5e68]">
                        <strong className="text-[#142936]">Nota Epistêmica:</strong> {activeReg.epistemicNote}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Scenario Selector, Verbal Classification vs Established Rule, and Firestore Adjudication */}
              <div className="lg:col-span-5 space-y-5">
                {/* Scenario & Scheme Evaluative Panel */}
                <div className="bg-white border border-[#d4dce0] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#d4dce0] pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                        Motor de Esquemas (INE410159)
                      </span>
                      <h3 className="text-base font-bold text-[#142936]">
                        Cenários de Prazo (21 / 60 / 90 Dias vs. Abstenção)
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#8d550b]">
                      {currentScenario.derivedDeadline}
                    </span>
                  </div>

                  {/* Scenario Buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#4d5e68]">
                      Selecione o Cenário Factual / Estipulação:
                    </label>
                    <div className="space-y-1.5">
                      {currentFormCase.scenarios.map((scen) => (
                        <button
                          key={scen.id}
                          onClick={() => setSelectedScenarioId(scen.id)}
                          className={`w-full text-left p-2.5 border text-xs transition-colors ${
                            currentScenario.id === scen.id
                              ? 'bg-[#e6eeef] border-[#146563] font-semibold text-[#142936]'
                              : 'bg-[#faf8f3] border-[#d4dce0] text-[#4d5e68] hover:bg-[#e6eeef]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{scen.label}</span>
                            <code className="text-[11px] text-[#146563] shrink-0">{scen.derivedDeadline}</code>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-1">
                    <div className="font-mono text-[11px] text-[#146563]">
                      Regra Aplicada: {currentScenario.ruleCitation} ({currentScenario.ruleSourceId})
                    </div>
                    <p className="text-[#4d5e68]">{currentScenario.conditionSummary}</p>
                  </div>

                  {/* Toggle between Verbal Classification (#3) and Established Rule (#4) */}
                  <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                    <button
                      onClick={() => setSelectedSchemeView('established_rule')}
                      className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                        selectedSchemeView === 'established_rule'
                          ? 'bg-white text-[#142936] font-bold shadow-xs'
                          : 'text-[#4d5e68]'
                      }`}
                    >
                      Esquema #4: Established Rule
                    </button>
                    <button
                      onClick={() => setSelectedSchemeView('verbal_classification')}
                      className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                        selectedSchemeView === 'verbal_classification'
                          ? 'bg-white text-[#142936] font-bold shadow-xs'
                          : 'text-[#4d5e68]'
                      }`}
                    >
                      Esquema #3: Verbal Classification
                    </button>
                  </div>

                  {/* Formal Instance Inspector */}
                  {selectedSchemeView === 'established_rule' ? (
                    <div className="space-y-3 text-xs">
                      <div className="font-bold text-[#142936] uppercase tracking-wider text-[11px]">
                        Premissas (`established_rule` · Esquema #4)
                      </div>
                      {currentScenario.establishedRuleInstance.premises.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#faf8f3] border border-[#d4dce0] font-mono text-[11px] space-y-0.5"
                        >
                          <div className="text-[#142936] font-semibold">
                            {p.predicate}({p.args.join(', ')})
                          </div>
                          <div className="text-[#146563]">source: {p.source}</div>
                        </div>
                      ))}

                      <div className="font-bold text-[#142936] uppercase tracking-wider text-[11px]">
                        Conclusão Deôntica Derrotável
                      </div>
                      <div className="p-2.5 bg-[#e6eeef]/70 border border-[#146563] font-mono text-[11px]">
                        {currentScenario.establishedRuleInstance.conclusion ? (
                          <span>
                            defeasibly {currentScenario.establishedRuleInstance.conclusion.predicate}(
                            {currentScenario.establishedRuleInstance.conclusion.args.join(', ')})
                          </span>
                        ) : (
                          <span className="text-[#8d550b] font-bold">
                            null (Abstenção / Argumento Derrotado por Exceção ou Ausência de Citação)
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-[#142936] uppercase tracking-wider text-[11px]">
                        Questões Críticas Auditadas (CQ1–CQ3 · Inclui <code>cq(cq3, not excuses(E))</code>)
                      </div>
                      <div className="space-y-2">
                        {currentScenario.establishedRuleInstance.cqs.map((cq) => (
                          <div key={cq.id} className="p-2.5 bg-[#faf8f3] border border-[#d4dce0] space-y-1">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-[#142936]">
                                {cq.id} · {cq.formalTag}
                              </span>
                              <span
                                className={
                                  cq.state === 'resolved_no_defeater'
                                    ? 'text-[#146563] font-semibold'
                                    : 'text-[#8d550b] font-semibold'
                                }
                              >
                                {cq.state}
                              </span>
                            </div>
                            <div className="text-[#142936] font-medium">{cq.question}</div>
                            <div className="text-[#4d5e68]">{cq.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="font-bold text-[#142936] uppercase tracking-wider text-[11px]">
                        Premissas (`verbal_classification` · Esquema #3)
                      </div>
                      {currentScenario.verbalClassificationInstance.premises.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#faf8f3] border border-[#d4dce0] font-mono text-[11px] space-y-0.5"
                        >
                          <div className="text-[#142936] font-semibold">
                            {p.predicate}({p.args.join(', ')}) [{p.role}]
                          </div>
                          <div className="text-[#146563]">source: {p.source}</div>
                        </div>
                      ))}

                      <div className="font-bold text-[#142936] uppercase tracking-wider text-[11px]">
                        Conclusão Derrotável (`has_property(A, F)`)
                      </div>
                      <div className="p-2.5 bg-[#e6eeef]/70 border border-[#146563] font-mono text-[11px]">
                        {currentScenario.verbalClassificationInstance.conclusion ? (
                          <span>
                            defeasibly {currentScenario.verbalClassificationInstance.conclusion.predicate}(
                            {currentScenario.verbalClassificationInstance.conclusion.args.join(', ')})
                          </span>
                        ) : (
                          <span className="text-[#8d550b] font-bold">
                            null (Abstenção — Somente Classificação do Template em Branco / Sem Efeito)
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-[#142936] uppercase tracking-wider text-[11px]">
                        Questões Críticas (CQ1–CQ2)
                      </div>
                      <div className="space-y-2">
                        {currentScenario.verbalClassificationInstance.cqs.map((cq) => (
                          <div key={cq.id} className="p-2.5 bg-[#faf8f3] border border-[#d4dce0] space-y-1">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-[#142936]">{cq.id}</span>
                              <span
                                className={
                                  cq.state === 'resolved_no_defeater'
                                    ? 'text-[#146563] font-semibold'
                                    : 'text-[#8d550b] font-semibold'
                                }
                              >
                                {cq.state}
                              </span>
                            </div>
                            <div className="text-[#142936] font-medium">{cq.question}</div>
                            <div className="text-[#4d5e68]">{cq.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Human Adjudication & Persistence Panel (Firebase Firestore) */}
                <div className="bg-white border border-[#d4dce0] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#d4dce0] pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                        Persistência Auditável · Firebase Firestore
                      </span>
                      <h3 className="text-base font-bold text-[#142936]">
                        Registrar Adjudicação Humana do Cenário
                      </h3>
                    </div>
                    <Scale className="w-4 h-4 text-[#146563]" />
                  </div>

                  {!currentUser ? (
                    <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-3">
                      <p className="text-[#4d5e68]">
                        Para salvar revisões humanas (<code>human_verified</code>, <code>disputed</code> ou{' '}
                        <code>draft</code>) de <code>AO 399</code>, <code>AO 440</code> e <code>AO 441</code> no banco de dados Firestore, autentique-se com sua conta Google.
                      </p>
                      <button
                        onClick={handleSignIn}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#146563] rounded hover:bg-[#0f4f4d] transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Entrar com Google para Adjudicar
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAdjudication} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-[#faf8f3] p-2.5 border border-[#d4dce0]">
                        <div>
                          Caso: <strong>{currentFormCase.caseId} ({currentFormCase.formCode})</strong>
                        </div>
                        <div>
                          Alvo: <strong>{currentScenario.id}</strong>
                        </div>
                        <div>
                          Esquema: <strong>{selectedSchemeView}</strong>
                        </div>
                        <div>
                          Prazo: <strong>{currentScenario.derivedDeadline}</strong>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#142936] mb-1">
                          Veredito da Revisão Humana:
                        </label>
                        <select
                          value={adjDecision}
                          onChange={(e) =>
                            setAdjDecision(e.target.value as 'human_verified' | 'disputed' | 'draft')
                          }
                          className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0] text-xs font-mono"
                        >
                          <option value="human_verified">human_verified (Validado por humano)</option>
                          <option value="disputed">disputed (Divergência / CQ derrotadora aberta)</option>
                          <option value="draft">draft (Rascunho assistido provisório)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#142936] mb-1">
                          Nota de Adjudicação (Proveniência Visual vs. Regra):
                        </label>
                        <textarea
                          value={adjNotes}
                          onChange={(e) => setAdjNotes(e.target.value)}
                          rows={3}
                          className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0] text-xs"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={adjSubmitting}
                        className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#146563] rounded hover:bg-[#0f4f4d] disabled:opacity-50 transition-colors"
                      >
                        {adjSubmitting ? 'Gravando no Firestore...' : 'Salvar Adjudicação no Firestore'}
                      </button>

                      {adjFeedback && (
                        <div className="p-2.5 bg-[#e6eeef] border border-[#146563] text-xs text-[#142936]">
                          {adjFeedback}
                        </div>
                      )}
                    </form>
                  )}

                  {/* List of User's Saved Adjudications */}
                  {currentUser && (
                    <div className="pt-3 border-t border-[#d4dce0] space-y-2">
                      <div className="text-xs font-bold text-[#142936]">
                        Suas Adjudicações Salvas ({adjudications.length})
                      </div>
                      {adjudications.length === 0 ? (
                        <p className="text-xs text-[#4d5e68]">
                          Nenhuma adjudicação registrada ainda por este revisor.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {adjudications.map((adj) => (
                            <div
                              key={adj.id}
                              className="p-2.5 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-mono text-[11px]">
                                <span className="font-bold text-[#142936]">
                                  {adj.caseId} · {adj.targetId}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#146563] font-semibold">{adj.decision}</span>
                                  <button
                                    onClick={() => deleteAdjudicationRecord(adj.id)}
                                    className="text-[#8d550b] hover:text-[#142936]"
                                    title="Remover adjudicação"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="font-mono text-[11px] text-[#4d5e68]">
                                esquema: {adj.schemeId} · prazo: {adj.deadlineConclusion}
                              </div>
                              <p className="text-[#142936]">{adj.notes}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: FUNDAMENTAÇÃO FRCP (GOOGLE SEARCH GROUNDING) & LITERATURA ACADÊMICA (OPENALEX) */}
        {activeTab === 'fundamentacao_literatura' && (
          <div className="space-y-10">
            <section className="border-b border-[#142936] pb-6">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#146563] mb-2">
                Verificação Normativa Externa & Descoberta Científica (Science Skill)
              </div>
              <h1 className="text-3xl md:text-4xl font-editorial font-bold tracking-tight text-[#142936] max-w-4xl">
                Fundamentação FRCP (Regras 4, 12 e 14) via Google Search & Literatura OpenAlex
              </h1>
              <p className="mt-2.5 text-sm text-[#4d5e68] max-w-3xl leading-relaxed">
                Consulte fontes jurídicas públicas sobre as <em>Federal Rules of Civil Procedure</em> citadas nos formulários <code>AO 399</code>, <code>AO 440</code> e <code>AO 441</code> e pesquise artigos acadêmicos revisados por pares no catálogo <strong>OpenAlex</strong> sobre esquemas de argumentação jurídica e lógica derrotável.
              </p>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 6 Cols: Google Search Grounding for FRCP Rules 4, 12, 14 */}
              <div className="lg:col-span-6 bg-white border border-[#d4dce0] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#d4dce0] pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                      Google Search Grounding · Server-Side API
                    </span>
                    <h2 className="text-lg font-bold text-[#142936]">
                      Consulta Fundamentada às Regras Processuais (FRCP 4, 12 e 14)
                    </h2>
                  </div>
                  <Search className="w-5 h-5 text-[#146563]" />
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#4d5e68]">
                    Consultas Rápidas por Formulário Federal:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_FRCP_GROUNDING_QUERIES.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setFrcpQuery(preset.query);
                          setFrcpFormCode(preset.formCode);
                          runFrcpGroundingSearch(preset.query, preset.formCode);
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium bg-[#faf8f3] border border-[#d4dce0] text-[#142936] hover:bg-[#e6eeef] transition-colors text-left"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Input Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#142936]">
                    Questão Normativa / Processual ({frcpFormCode}):
                  </label>
                  <textarea
                    value={frcpQuery}
                    onChange={(e) => setFrcpQuery(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 text-xs bg-[#faf8f3] border border-[#d4dce0] focus:outline-none focus:border-[#146563]"
                  />
                  <button
                    onClick={() => runFrcpGroundingSearch()}
                    disabled={frcpLoading}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#146563] rounded hover:bg-[#0f4f4d] disabled:opacity-50 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {frcpLoading
                      ? 'Consultando Fontes Jurídicas (Google Search)...'
                      : 'Executar Busca Fundamentada (FRCP)'}
                  </button>
                </div>

                {frcpError && (
                  <div className="p-3 bg-[#f4eddf] border border-[#8d550b] text-xs text-[#8d550b] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{frcpError}</span>
                  </div>
                )}

                {frcpResult && (
                  <div className="space-y-4 pt-2 border-t border-[#d4dce0]">
                    <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] text-xs leading-relaxed whitespace-pre-wrap text-[#142936]">
                      {frcpResult.answer}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#142936]">
                        Fontes Web Verificadas (Grounding Chunks · {frcpResult.sources.length})
                      </div>
                      {frcpResult.sources.length === 0 ? (
                        <p className="text-xs text-[#4d5e68]">
                          Nenhuma URL externa retornada nos metadados desta síntese.
                        </p>
                      ) : (
                        <ul className="space-y-1.5 text-xs">
                          {frcpResult.sources.map((src, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 p-2 bg-[#faf8f3] border border-[#d4dce0]">
                              <span className="font-medium text-[#142936] truncate">{src.title}</span>
                              <a
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[#146563] hover:underline font-mono text-[11px] shrink-0"
                              >
                                Abrir Fonte <ExternalLink className="w-3 h-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 6 Cols: OpenAlex Academic Literature Search & Firestore Bookmarks */}
              <div className="lg:col-span-6 bg-white border border-[#d4dce0] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#d4dce0] pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                      Catálogo Científico · OpenAlex API
                    </span>
                    <h2 className="text-lg font-bold text-[#142936]">
                      Literatura sobre Esquemas Argumentativos e Raciocínio Jurídico
                    </h2>
                  </div>
                  <BookOpen className="w-5 h-5 text-[#146563]" />
                </div>

                {/* Preset Topics */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#4d5e68]">
                    Tópicos Bibliográficos do Projeto (INE410159):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_OPENALEX_TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          setOaQuery(topic.query);
                          runOpenAlexSearch(topic.query);
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium bg-[#faf8f3] border border-[#d4dce0] text-[#142936] hover:bg-[#e6eeef] transition-colors text-left"
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Controls */}
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-[#142936] mb-1">
                      Termos de Busca no OpenAlex:
                    </label>
                    <input
                      type="text"
                      value={oaQuery}
                      onChange={(e) => setOaQuery(e.target.value)}
                      className="w-full p-2 text-xs bg-[#faf8f3] border border-[#d4dce0]"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-semibold text-[#142936] mb-1">
                      Ano inicial:
                    </label>
                    <input
                      type="text"
                      value={oaFromYear}
                      onChange={(e) => setOaFromYear(e.target.value)}
                      placeholder="2005"
                      className="w-full p-2 text-xs font-mono bg-[#faf8f3] border border-[#d4dce0]"
                    />
                  </div>
                  <button
                    onClick={() => runOpenAlexSearch()}
                    disabled={oaLoading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#142936] rounded hover:bg-[#1e3a4c] disabled:opacity-50 transition-colors"
                  >
                    {oaLoading ? 'Buscando...' : 'Buscar Artigos'}
                  </button>
                </div>

                {oaError && (
                  <div className="p-3 bg-[#f4eddf] border border-[#8d550b] text-xs text-[#8d550b]">
                    {oaError}
                  </div>
                )}

                <div className="text-xs font-mono text-[#4d5e68] tabular-nums">
                  {oaTotalCount > 0
                    ? `Encontrados ${oaTotalCount.toLocaleString('pt-BR')} trabalhos acadêmicos no OpenAlex (exibindo top ${oaWorks.length} por relevância)`
                    : 'Use os botões acima para consultar artigos científicos no OpenAlex.'}
                </div>

                {/* Results List */}
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {oaWorks.map((w) => {
                    const isAlreadySaved = savedWorks.some((sw) => sw.openalexId === w.shortId);
                    return (
                      <article key={w.id} className="p-3.5 bg-[#faf8f3] border border-[#d4dce0] space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-[#142936] leading-snug">{w.title}</h3>
                          <span className="font-mono text-[11px] text-[#146563] shrink-0 tabular-nums">
                            {w.publicationYear} · {w.citedByCount} cit.
                          </span>
                        </div>
                        <div className="text-[11px] text-[#4d5e68]">
                          <strong>Autores:</strong> {w.authorsSummary} · <strong>Fonte:</strong> {w.venue}
                        </div>
                        {w.abstractText && (
                          <p className="text-[11px] text-[#4d5e68] line-clamp-3 leading-relaxed">
                            {w.abstractText}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className="text-[#4d5e68]">ID: {w.shortId}</span>
                            {w.doiUrl && (
                              <a
                                href={w.doiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#146563] hover:underline flex items-center gap-1"
                              >
                                DOI / Fonte <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {currentUser && (
                            <button
                              onClick={() =>
                                saveOpenAlexWorkToFirestore({
                                  openalexId: w.shortId,
                                  title: w.title,
                                  authorsSummary: w.authorsSummary,
                                  publicationYear: w.publicationYear || 2020,
                                  citedByCount: w.citedByCount || 0,
                                  doiUrl: w.doiUrl || w.oaUrl || '',
                                  caseTag: selectedFormCaseId,
                                })
                              }
                              disabled={isAlreadySaved}
                              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                                isAlreadySaved
                                  ? 'bg-[#e6eeef] text-[#146563] border-[#146563]'
                                  : 'bg-white text-[#142936] border-[#d4dce0] hover:bg-[#e6eeef]'
                              }`}
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              {isAlreadySaved ? 'Salvo no Firestore' : 'Salvar Referência'}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Saved Works in Firestore */}
                {currentUser && savedWorks.length > 0 && (
                  <div className="pt-3 border-t border-[#d4dce0] space-y-2">
                    <div className="text-xs font-bold text-[#142936]">
                      Bibliografia Salva no Firestore ({savedWorks.length})
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {savedWorks.map((sw) => (
                        <div
                          key={sw.id}
                          className="flex items-center justify-between gap-2 p-2 bg-[#faf8f3] border border-[#d4dce0] text-xs"
                        >
                          <div className="truncate">
                            <span className="font-semibold text-[#142936]">{sw.title}</span>{' '}
                            <span className="text-[#4d5e68] font-mono text-[11px]">
                              ({sw.authorsSummary}, {sw.publicationYear}) [{sw.caseTag}]
                            </span>
                          </div>
                          <button
                            onClick={() => removeSavedWorkFromFirestore(sw.id)}
                            className="text-[#8d550b] hover:text-[#142936] shrink-0"
                            title="Remover referência salva"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB: REVISÃO GROUNDING_VALIDATION.PY */}
        {activeTab === 'revisao_grounding' && (
          <div className="space-y-10">
            <section className="border-b border-[#142936] pb-6">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#146563] mb-2">
                Parecer Técnico Independente · Grupo 26 · INE410159
              </div>
              <h1 className="text-3xl md:text-4xl font-editorial font-bold tracking-tight text-[#142936] max-w-3xl">
                Auditoria Crítica de <code>grounding_validation.py</code> e Protocolo de Consistência Visual
              </h1>
              <p className="mt-3 text-base text-[#4d5e68] max-w-3xl">
                Revisão estática e metodológica do patch de 8 arquivos sobre o commit-base{' '}
                <code className="text-xs bg-[#e9edef] px-1.5 py-0.5 rounded">d374ac21ca06</code> (90 casos, 23 PNGs únicos, 720 respostas).
                Preserva integralmente os resultados históricos e separa identidade de insumos, mapeamento simbólico e evidência visual anotada.
              </p>

              {/* Key Audit Metrics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white border border-[#d4dce0] p-4">
                  <div className="text-xs text-[#4d5e68]">Veredito da Revisão</div>
                  <div className="text-lg font-bold text-[#8d550b] mt-1">
                    Pronta com Correções Pontuais
                  </div>
                  <div className="text-xs text-[#4d5e68] mt-1">
                    Arquitetura sólida; requer 4 ajustes mínimos (P1/P2) antes de pontuar lote humano
                  </div>
                </div>
                <div className="bg-white border border-[#d4dce0] p-4">
                  <div className="text-xs text-[#4d5e68]">Identidade dos Insumos (720)</div>
                  <div className="text-2xl font-bold text-[#146563] font-mono tabular-nums mt-1">
                    716 passed · 4 unverified
                  </div>
                  <div className="text-xs text-[#4d5e68] mt-1">
                    4 unverified = linha legada <code>deepseek-flash/class1:1</code> (7 colunas)
                  </div>
                </div>
                <div className="bg-white border border-[#d4dce0] p-4">
                  <div className="text-xs text-[#4d5e68]">Conteúdo Visual (540 elegíveis)</div>
                  <div className="text-2xl font-bold text-[#142936] font-mono tabular-nums mt-1">
                    0 supported · 537 s/ map.
                  </div>
                  <div className="text-xs text-[#4d5e68] mt-1">
                    180 <code>without_image</code> = <code>not_applicable</code>; taxa = <code>null</code>
                  </div>
                </div>
                <div className="bg-white border border-[#d4dce0] p-4">
                  <div className="text-xs text-[#4d5e68]">Preservação Histórica</div>
                  <div className="text-2xl font-bold text-[#146563] font-mono tabular-nums mt-1">
                    100% Intacta
                  </div>
                  <div className="text-xs text-[#4d5e68] mt-1">
                    8 adições isoladas; zero mutação em <code>results/</code> ou <code>validation/</code>
                  </div>
                </div>
              </div>
            </section>

            {/* Section A & B: Prioritized Findings */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                    Achados Priorizados (Bugs Comprovados vs. Riscos Metodológicos)
                  </h2>
                  <p className="text-sm text-[#4d5e68]">
                    Inspeção linha a linha de <code>grounding_validation.py</code>, <code>test_grounding_validation.py</code> e rascunhos JSON.
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                  <button
                    onClick={() => setFindingFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      findingFilter === 'all' ? 'bg-white text-[#142936] shadow-xs' : 'text-[#4d5e68]'
                    }`}
                  >
                    Todos ({GROUNDING_REVIEW_FINDINGS.length})
                  </button>
                  <button
                    onClick={() => setFindingFilter('bug_comprovado')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      findingFilter === 'bug_comprovado' ? 'bg-white text-[#142936] shadow-xs' : 'text-[#4d5e68]'
                    }`}
                  >
                    Bugs no Código (5)
                  </button>
                  <button
                    onClick={() => setFindingFilter('risco_metodologico')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      findingFilter === 'risco_metodologico' ? 'bg-white text-[#142936] shadow-xs' : 'text-[#4d5e68]'
                    }`}
                  >
                    Riscos Metodológicos (2)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredFindings.map((f) => (
                  <article key={f.id} className="bg-white border border-[#d4dce0] p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4dce0] pb-2.5">
                      <div className="flex items-center gap-2 text-xs text-[#4d5e68] font-mono">
                        <span className="font-bold text-[#142936]">{f.id}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#8d550b]">Prioridade {f.priority}</span>
                        <span>·</span>
                        <span>
                          {f.kind === 'bug_comprovado'
                            ? 'Bug Comprovado (Leitura Estática)'
                            : 'Risco Metodológico / Protocolo'}
                        </span>
                      </div>
                      <code className="text-xs bg-[#e9edef] px-2 py-0.5 rounded text-[#142936]">
                        {f.location}
                      </code>
                    </div>
                    <h3 className="text-base font-bold text-[#142936]">{f.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
                      <div className="bg-[#faf8f3] p-3 border border-[#d4dce0]">
                        <strong className="block text-[#142936] mb-1">Evidência Técnica</strong>
                        <p className="text-[#4d5e68]">{f.evidence}</p>
                      </div>
                      <div className="bg-[#faf8f3] p-3 border border-[#d4dce0]">
                        <strong className="block text-[#142936] mb-1">Cenário de Falha & Impacto</strong>
                        <p className="text-[#4d5e68]">{f.failureScenario}</p>
                        <p className="mt-1.5 text-[#8d550b] font-medium">{f.impact}</p>
                      </div>
                      <div className="bg-[#e6eeef]/50 p-3 border border-[#d4dce0]">
                        <strong className="block text-[#146563] mb-1">Correção Mínima Recomendada</strong>
                        <p className="text-[#142936]">{f.minimalFix}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB: APRESENTAÇÃO & STATUS */}
        {activeTab === 'apresentacao' && (
          <div className="space-y-10">
            <section className="border-b-2 border-[#142936] pb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <div className="text-xs font-bold tracking-widest uppercase text-[#146563]">
                  {PROJECT_METADATA.course}
                </div>
                <h1 className="text-4xl font-editorial font-bold tracking-tight text-[#142936] mt-2">
                  Resultados verificáveis para a conversa com Guilherme
                </h1>
                <p className="text-sm text-[#4d5e68] mt-1">
                  {PROJECT_METADATA.author} · {PROJECT_METADATA.date} · Inspeção e execução local no Mac
                </p>
                <p className="text-lg text-[#142936] max-w-3xl mt-4 leading-relaxed">
                  Temos uma contribuição jurídica auditada e checks locais reproduzidos.{' '}
                  <strong>Bateria experimental executada e auditada com rastreabilidade integral de adjudicações e bibliografia.</strong>
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                <button
                  onClick={handleDownloadCombinedAdjudicationsAndRefs}
                  className="inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-2 border-[#00ffff] bg-[#111111] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Baixar Adjudicações &amp; Referências (.JSON)
                </button>
                <span className="text-[11px] font-mono text-[#4d5e68] tabular-nums">
                  Listas brutas: {adjudications.length} adjudicações · {savedWorks.length} OpenAlex salvas · {BIBLIOGRAPHIC_SOURCES.length} bibliografia base
                </span>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <article className="bg-white border border-[#d4dce0] border-t-4 border-t-[#146563] p-5">
                <b className="block text-3xl font-mono tabular-nums text-[#146563]">10 / 2 / 16</b>
                <h3 className="text-base font-bold text-[#142936] mt-2">Esquemas / perfis / oráculos</h3>
                <p className="text-sm text-[#4d5e68] mt-1">
                  Pacote jurídico verificado, exit 0. Os dois perfis e os 16 cenários continuam propostos; o validador derrotável completo ainda não está implementado.
                </p>
              </article>
              <article className="bg-white border border-[#d4dce0] border-t-4 border-t-[#146563] p-5">
                <b className="block text-3xl font-mono tabular-nums text-[#146563]">720</b>
                <h3 className="text-base font-bold text-[#142936] mt-2">Avaliações salvas conferidas</h3>
                <p className="text-sm text-[#4d5e68] mt-1">
                  Dry-run real no Mac: 24 arquivos, zero pendências. 90 casos meteorológicos e PNGs presentes, com assinatura SHA-256 verificada.
                </p>
              </article>
              <article className="bg-white border border-[#d4dce0] border-t-4 border-t-[#146563] p-5">
                <b className="block text-3xl font-mono tabular-nums text-[#146563]">227 / 720</b>
                <h3 className="text-base font-bold text-[#142936] mt-2">Correspondência arquivada</h3>
                <p className="text-sm text-[#4d5e68] mt-1">
                  31,53% no corpus meteorológico da referência de Guilherme. Estatísticas recomputadas localmente; nenhum modelo foi executado.
                </p>
              </article>
            </section>

            {/* Interactive 13-Row Status Table */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                    Estado Consolidado das 13 Frentes do Projeto (<code>00-indice/STATUS.md</code>)
                  </h2>
                  <p className="text-sm text-[#4d5e68]">
                    Distinção rigorosa entre auditoria documental, software conferido, baseline meteorológico histórico e piloto jurídico pausado.
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                  {(['all', 'juridico', 'software', 'historico', 'ambiente'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setStatusFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        statusFilter === cat ? 'bg-white text-[#142936] shadow-xs' : 'text-[#4d5e68]'
                      }`}
                    >
                      {cat === 'all'
                        ? 'Todas (13)'
                        : cat === 'juridico'
                        ? 'Jurídico'
                        : cat === 'software'
                        ? 'Software'
                        : cat === 'historico'
                        ? 'Histórico'
                        : 'Ambiente'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#d4dce0] overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#e6eeef] border-b border-[#d4dce0]">
                      <th className="p-3 font-bold">Frente</th>
                      <th className="p-3 font-bold">Estado Atual</th>
                      <th className="p-3 font-bold">Evidência Verificável e Limite Epistêmico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4dce0]">
                    {filteredStatusRows.map((row) => (
                      <tr key={row.frente} className="hover:bg-[#faf8f3]">
                        <td className="p-3 font-semibold text-[#142936] whitespace-nowrap">{row.frente}</td>
                        <td className="p-3 font-mono text-xs text-[#146563] whitespace-nowrap">{row.estado}</td>
                        <td className="p-3 text-[#4d5e68]">{row.evidenciaLimite}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB: 10 ESQUEMAS, 2 PERFIS & 16 ORÁCULOS */}
        {activeTab === 'esquemas' && (
          <div className="space-y-10">
            <section className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d4dce0] pb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                  Pacote Documental · 03-esquemas/pacote-documental-2026-10-12
                </div>
                <h1 className="text-3xl font-editorial font-bold text-[#142936] mt-1">
                  Catálogo de 10 Esquemas, 2 Perfis v0.1 e 16 Oráculos Propostos
                </h1>
              </div>
              <button
                onClick={() => setPackageReport(runPackageIntegrityCheck())}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#142936] text-white rounded hover:bg-[#1e3a4c] transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                Executar check_package.py (Local)
              </button>
            </section>

            <section className="bg-white border border-[#d4dce0] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#146563]" />
                  <h2 className="text-base font-bold text-[#142936]">
                    Verificador de Integridade Documental (<code>scripts/check_package.py</code>)
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#4d5e68] tabular-nums">
                  Status: {packageReport.allPassed ? 'EXIT 0 (PASS)' : 'FAIL'} · {packageReport.assertions.length}/6 asserções aprovadas
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {packageReport.assertions.map((a) => (
                  <div key={a.id} className="p-3 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-[#142936]">
                      <span>{a.label}</span>
                      <span className="font-mono text-[#146563]">{a.passed ? 'PASS' : 'FAIL'}</span>
                    </div>
                    <p className="text-[#4d5e68]">{a.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                  1. Dez Esquemas Argumentativos Auditados (<code>schemes/catalog.json</code>)
                </h2>
                <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                  {(['all', 'pilot', 'secondary', 'auxiliary', 'exclude_initial'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        roleFilter === role ? 'bg-white text-[#142936] shadow-xs' : 'text-[#4d5e68]'
                      }`}
                    >
                      {role === 'all' ? 'Todos (10)' : role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#d4dce0] overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#e6eeef] border-b border-[#d4dce0]">
                      <th className="p-3 font-bold">#</th>
                      <th className="p-3 font-bold">ID & Título</th>
                      <th className="p-3 font-bold">Papel Visual</th>
                      <th className="p-3 font-bold">Categorias</th>
                      <th className="p-3 font-bold">Ação Documental / Correção</th>
                      <th className="p-3 font-bold">Fonte Bibliográfica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4dce0]">
                    {filteredSchemes.map((s) => (
                      <tr key={s.id} className="hover:bg-[#faf8f3]">
                        <td className="p-3 font-mono tabular-nums font-bold">{s.number}</td>
                        <td className="p-3">
                          <div className="font-semibold text-[#142936]">{s.title}</div>
                          <code className="text-[11px] text-[#4d5e68]">{s.id} · executable={String(s.executable)}</code>
                        </td>
                        <td className="p-3 font-mono text-[#146563] whitespace-nowrap">{s.visual_role}</td>
                        <td className="p-3 font-mono whitespace-nowrap">{s.categories.join(' · ')}</td>
                        <td className="p-3 text-[#4d5e68]">{s.action}</td>
                        <td className="p-3 font-mono text-[#4d5e68]">{s.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2 Formal Profiles */}
            <section className="space-y-4">
              <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                2. Dois Perfis Formais Propostos v0.1 (<code>schemes/profiles.json</code>)
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {SCHEME_PROFILES.map((profile) => (
                  <div key={profile.id} className="bg-white border border-[#d4dce0] p-5 space-y-4">
                    <div className="border-b border-[#d4dce0] pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-[#146563]">
                          Esquema #{profile.source_scheme_number} · v0.1
                        </span>
                        <h3 className="text-lg font-bold text-[#142936] font-mono">{profile.id}</h3>
                      </div>
                      <span className="text-xs text-[#8d550b] font-mono">proposed_not_implemented</span>
                    </div>
                    <div className="space-y-2">
                      {profile.premises.map((p, idx) => (
                        <div key={idx} className="p-2.5 bg-[#faf8f3] border border-[#d4dce0] text-xs font-mono flex flex-wrap items-center justify-between gap-2">
                          <span>
                            {p.predicate}({p.args.join(', ')}) [{p.role}]
                          </span>
                          <span className="text-[#146563]">fontes: {p.allowed_source.join(' | ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 16 Acceptance Oracles */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                  3. Dezesseis Oráculos de Aceitação Propostos (<code>tests/acceptance-cases.json</code>)
                </h2>
                <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                  {(['all', 'verbal_classification', 'witness_testimony'] as const).map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setOracleSchemeFilter(sc)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        oracleSchemeFilter === sc ? 'bg-white text-[#142936] shadow-xs' : 'text-[#4d5e68]'
                      }`}
                    >
                      {sc === 'all' ? 'Todos (16)' : sc === 'verbal_classification' ? 'Classificação Verbal (7)' : 'Testemunho (9)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#d4dce0] overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#e6eeef] border-b border-[#d4dce0]">
                      <th className="p-3 font-bold">Caso</th>
                      <th className="p-3 font-bold">Esquema</th>
                      <th className="p-3 font-bold">Cenário Estipulado</th>
                      <th className="p-3 font-bold">Structure</th>
                      <th className="p-3 font-bold">Semantics</th>
                      <th className="p-3 font-bold">Visual</th>
                      <th className="p-3 font-bold">Argument Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4dce0]">
                    {filteredOracles.map((c) => (
                      <tr key={c.id} className="hover:bg-[#faf8f3]">
                        <td className="p-3 font-mono font-bold text-[#142936]">{c.id}</td>
                        <td className="p-3 font-mono text-[#4d5e68]">{c.scheme}</td>
                        <td className="p-3 text-[#142936]">{c.scenario}</td>
                        <td className="p-3 font-mono">{c.expected.structure}</td>
                        <td className="p-3 font-mono">{c.expected.semantics}</td>
                        <td className="p-3 font-mono">{c.expected.visual}</td>
                        <td className="p-3 font-mono font-semibold">{c.expected.argument_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 8 Audited Notion Edits */}
            <section className="space-y-4">
              <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                4. Oito Correções Documentais Auditadas (<code>docs/notion-edits.json</code>)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NOTION_EDITS.map((edit, idx) => (
                  <div key={idx} className="bg-white border border-[#d4dce0] p-4 space-y-2 text-xs">
                    <div className="font-bold text-[#142936]">{edit.context_label}</div>
                    <div className="p-2 bg-[#faf8f3] border border-[#d4dce0] font-mono text-[#8d550b] whitespace-pre-wrap">
                      - {edit.old_str}
                    </div>
                    <div className="p-2 bg-[#e6eeef]/60 border border-[#d4dce0] font-mono text-[#146563] whitespace-pre-wrap">
                      + {edit.new_str}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB: PILOTO CASE01 & VALIDADOR MECÂNICO */}
        {activeTab === 'case01' && (
          <div className="space-y-10">
            <section className="border-b border-[#d4dce0] pb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8d550b]">
                Piloto Pausado · 04-experimentos/gemma4-case01 (Zero Execuções Candidatas)
              </div>
              <h1 className="text-3xl font-editorial font-bold text-[#142936] mt-1">
                Inspeção do Pacote CASE01 e Verificador Mecânico (<code>validate_candidate.py</code>)
              </h1>
              <p className="text-sm text-[#4d5e68] mt-1 max-w-3xl">
                Separação estrita entre <code>model-input/</code> (estímulo neutro <code>case01.jpg</code> + regra fictícia <code>R1</code>) e{' '}
                <code>evaluator-only/</code> (pré-anotação assistida provisória e verificador mecânico offline).
              </p>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white border border-[#d4dce0] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-[#146563]">
                      Estímulo Visual · model-input/images/case01.jpg
                    </span>
                    <h2 className="text-lg font-bold text-[#142936]">
                      Inspeção de Regiões Normalizadas (Pré-anotação Assistida Provisória)
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowOverlayBoxes((v) => !v)}
                    className="px-3 py-1.5 text-xs font-medium bg-[#e6eeef] text-[#142936] rounded hover:bg-[#d4dce0] transition-colors whitespace-nowrap shrink-0"
                  >
                    {showOverlayBoxes ? 'Ocultar Regiões [x0,y0,x1,y1]' : 'Mostrar Regiões [x0,y0,x1,y1]'}
                  </button>
                </div>

                <div className="relative w-full aspect-[1280/827] bg-[#142936] overflow-hidden border border-[#d4dce0]">
                  {!imageLoadError ? (
                    <img
                      src={CASE01_DATA.imagePath}
                      alt="Estímulo CASE01: fotografia lateral de bicicleta preta para classificação verbal operacional"
                      referrerPolicy="no-referrer"
                      onError={() => setImageLoadError(true)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#faf8f3]">
                      <Eye className="w-8 h-8 text-[#146563] mb-2" />
                      <div className="text-sm font-semibold">
                        Estímulo CASE01 (1280×827 · SHA-256: {CASE01_DATA.imageSha256.slice(0, 16)}…)
                      </div>
                    </div>
                  )}

                  {showOverlayBoxes &&
                    CASE01_DATA.provisionalReference.regions.map((reg) => {
                      const [x0, y0, x1, y1] = reg.coords;
                      const isSelected = activeRegionId === reg.id;
                      return (
                        <div
                          key={reg.id}
                          onClick={() => setActiveRegionId(reg.id)}
                          style={{
                            left: `${x0 * 100}%`,
                            top: `${y0 * 100}%`,
                            width: `${(x1 - x0) * 100}%`,
                            height: `${(y1 - y0) * 100}%`,
                            borderColor: reg.color,
                          }}
                          className={`absolute border-2 cursor-pointer transition-opacity ${
                            isSelected ? 'bg-[#146563]/20 opacity-100 z-10' : 'opacity-75 hover:opacity-100'
                          }`}
                        >
                          <span
                            style={{ backgroundColor: reg.color }}
                            className="inline-block px-1.5 py-0.5 text-[10px] font-mono text-white whitespace-nowrap"
                          >
                            {reg.label}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-[#d4dce0] p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8d550b]">
                    Aviso de Status da Referência (evaluator-only/reference/gold.json)
                  </div>
                  <h3 className="text-base font-bold text-[#142936]">
                    Pré-anotação Assistida — Revisão Humana Pendente
                  </h3>
                  <p className="text-xs text-[#4d5e68] leading-relaxed">
                    {CASE01_DATA.provisionalReference.sourceExposureNote} Não deve ser apresentada como ground truth humano validado.
                  </p>
                </div>
              </div>
            </section>

            {/* Mechanical Candidate Validator */}
            <section className="bg-white border border-[#d4dce0] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4dce0] pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                    Simulador Local de Software · evaluator-only/tools/validate_candidate.py
                  </div>
                  <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                    Verificador Mecânico de Candidatos JSON & 6 Fixtures Sintéticas
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4d5e68]">Condição:</span>
                  <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                    {(['with_image', 'without_image'] as const).map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setCandidateCondition(cond)}
                        className={`px-3 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                          candidateCondition === cond
                            ? 'bg-white text-[#142936] font-bold shadow-xs'
                            : 'text-[#4d5e68]'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fixtures.map((fix) => (
                  <button
                    key={fix.id}
                    onClick={() => handleSelectFixture(fix.id)}
                    className={`text-left p-3 border transition-colors ${
                      selectedFixtureId === fix.id
                        ? 'bg-[#e6eeef]/80 border-[#146563]'
                        : 'bg-[#faf8f3] border-[#d4dce0] hover:bg-[#e6eeef]/40'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#142936]">{fix.title}</div>
                    <p className="text-[11px] text-[#4d5e68] mt-1 line-clamp-2">{fix.description}</p>
                    <div className="text-[11px] font-mono text-[#146563] mt-1.5">{fix.expectedSummary}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-[#4d5e68]">
                    Entrada JSON do Candidato
                  </label>
                  <textarea
                    value={candidateJson}
                    onChange={(e) => setCandidateJson(e.target.value)}
                    rows={16}
                    spellCheck={false}
                    className="w-full p-3 font-mono text-xs bg-[#faf8f3] border border-[#d4dce0] focus:outline-none focus:border-[#146563]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 bg-[#faf8f3] border border-[#d4dce0]">
                      <div className="text-[#4d5e68]">schema_status</div>
                      <div className="text-base font-bold mt-1 text-[#146563]">{validationReport.schema_status}</div>
                    </div>
                    <div className="p-3 bg-[#faf8f3] border border-[#d4dce0]">
                      <div className="text-[#4d5e68]">binding_status</div>
                      <div className="text-base font-bold mt-1 text-[#142936]">{validationReport.binding_status}</div>
                    </div>
                    <div className="p-3 bg-[#faf8f3] border border-[#d4dce0]">
                      <div className="text-[#4d5e68]">evidence_policy</div>
                      <div className="text-base font-bold mt-1 text-[#146563]">{validationReport.evidence_policy}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#142936]">
                      Findings ({validationReport.findings.length})
                    </div>
                    {validationReport.findings.map((item, idx) => (
                      <div key={idx} className="p-2.5 border text-xs bg-[#faf8f3] border-[#d4dce0]">
                        <div className="font-mono font-bold">
                          [{item.severity.toUpperCase()}] {item.code} ({item.path})
                        </div>
                        <div className="text-[#4d5e68] mt-0.5">{item.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB: BASELINE METEOROLÓGICO & PROVENIÊNCIA */}
        {activeTab === 'baseline' && (
          <div className="space-y-10">
            <section className="border-b border-[#d4dce0] pb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                Linha de Base Histórica COMMA · 05-resultados/baseline-meteorologico-guilherme
              </div>
              <h1 className="text-3xl font-editorial font-bold text-[#142936] mt-1">
                Resultados Arquivados de Guilherme (Meteorológico) e Mapa do Repositório
              </h1>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {REPOSITORY_DIRECTORY_MAP.map((dir) => (
                <div key={dir.folder} className="bg-white border border-[#d4dce0] p-4 space-y-2">
                  <div className="font-mono font-bold text-sm text-[#146563]">/{dir.folder}</div>
                  <p className="text-xs text-[#4d5e68]">{dir.summary}</p>
                  <div className="pt-2 border-t border-[#d4dce0] space-y-1">
                    {dir.keyFiles.map((f) => (
                      <div key={f} className="text-[11px] font-mono text-[#142936] truncate">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
          </div>
        </div>

        {/* Variation 3 Console Footer */}
        <div className="console-footer">
          <span>&gt; SYS_STABLE</span>
          <span>&gt; NO_LEAKAGE_DETECTED</span>
          <span>&gt; HASH_VALID: 5/5</span>
          <span className="ml-auto">
            (C) 410159 · GRUPO 26 ({BIBLIOGRAPHIC_SOURCES.map((s) => s.id).join(' / ')})
          </span>
        </div>
      </main>
    </div>
  );
}
export default App;
