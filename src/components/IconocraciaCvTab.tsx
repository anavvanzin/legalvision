import React, { useState, useMemo } from 'react';
import {
  Eye,
  FolderOpen,
  Calendar,
  BookOpen,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  FileText,
  Image as ImageIcon,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import {
  ICONOCRACIA_CV_PROJECT_LINKS,
  STABLE_VOCABULARY_GLOSSARY,
  ICONOCRACIA_EXEMPLAR_CASES,
  COURSE_SCHEDULE_2026_2,
  ABNT_2025_REFERENCES,
  DEFAULT_PROJETO_DISCIPLINA_MD,
} from '../data/iconocraciaCvData';
import {
  User,
  IconocraciaCatalogRecord,
  IconocraciaSupportType,
  IconocraciaScopeType,
  createIconocraciaCatalogEntry,
  deleteIconocraciaCatalogEntry,
  googleSignInForDrive,
  getAccessToken,
} from '../firebase';

interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

interface IconocraciaCvTabProps {
  currentUser: User | null;
  catalogEntries: IconocraciaCatalogRecord[];
  onUserAuthenticated: (user: User) => void;
}

type SubViewId = 'protocolo_cv' | 'drive_importer' | 'cronograma_parecer';

export const IconocraciaCvTab: React.FC<IconocraciaCvTabProps> = ({
  currentUser,
  catalogEntries,
  onUserAuthenticated,
}) => {
  const [subView, setSubView] = useState<SubViewId>('protocolo_cv');

  // State for Computer Vision Protocol & Assisted Detection Inspector
  const [selectedExemplarId, setSelectedExemplarId] = useState<string>(
    ICONOCRACIA_EXEMPLAR_CASES[0].id
  );
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    ICONOCRACIA_EXEMPLAR_CASES[0].regions[0].id
  );
  const [panofskyLevel, setPanofskyLevel] = useState<'pre' | 'icono' | 'iconol'>('iconol');
  const [showCvBoxes, setShowCvBoxes] = useState<boolean>(true);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'corpus_core' | 'comparador_apendice'>(
    'all'
  );

  // Imported Google Drive Document & Image state
  const [driveToken, setDriveToken] = useState<string | null>(() => getAccessToken());
  const [driveAuthLoading, setDriveAuthLoading] = useState<boolean>(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState<string>(
    'projeto-disciplina-visao-computacional-2026-2.md'
  );
  const [driveMimeFilter, setDriveMimeFilter] = useState<'all' | 'markdown_json' | 'images'>(
    'all'
  );
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveLoading, setDriveLoading] = useState<boolean>(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [importedDocTitle, setImportedDocTitle] = useState<string>(
    'docs/projeto-disciplina-visao-computacional-2026-2.md (Especificação Base Local)'
  );
  const [importedDocContent, setImportedDocContent] = useState<string>(
    DEFAULT_PROJETO_DISCIPLINA_MD
  );
  const [importedDriveFileId, setImportedDriveFileId] = useState<string>('');
  const [importedImageBlobUrl, setImportedImageBlobUrl] = useState<string | null>(null);
  const [importedImageName, setImportedImageName] = useState<string | null>(null);

  // Firestore Catalog Form State
  const [formItemCode, setFormItemCode] = useState<string>('ICON-BR-1891-CONST-01');
  const [formTitle, setFormTitle] = useState<string>(
    'Frontispício Alegórico e Emblema da República na Constituição de 1891'
  );
  const [formSupport, setFormSupport] = useState<IconocraciaSupportType>('paratexto_normativo');
  const [formYear, setFormYear] = useState<string>('1891');
  const [formScope, setFormScope] = useState<IconocraciaScopeType>('corpus_core');
  const [formProvenance, setFormProvenance] = useState<string>(
    'Arquivo Nacional / Senado Federal · Impresso Oficial de 1891 (Domínio Público)'
  );
  const [formAttributesText, setFormAttributesText] = useState<string>(
    'alegoria_feminina, barrete_frigio, estrela_da_uniao, ramos_de_cafe_e_tabaco'
  );
  const [formNormalizedBox, setFormNormalizedBox] = useState<string>('[0.18, 0.12, 0.82, 0.64]');
  const [formStateMeaning, setFormStateMeaning] = useState<string>(
    'Produção de feminilidade de Estado no paratexto constitucional de 1891 (interpretação minha): consagra a personificação feminina da soberania republicana sob regime de reconhecimento sem reciprocidade.'
  );
  const [formSilence, setFormSilence] = useState<string>(
    'Silêncio substantivo sobre cidadania eleitoral feminina; distinção preservada entre sentido produzido pelo impresso estatal e recepção histórica.'
  );
  const [catalogSubmitting, setCatalogSubmitting] = useState<boolean>(false);
  const [catalogFeedback, setCatalogFeedback] = useState<string | null>(null);

  // Confirmation modal state for destructive operations
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<IconocraciaCatalogRecord | null>(
    null
  );

  // Schedule milestone filter
  const [milestoneFilter, setMilestoneFilter] = useState<
    'all' | 'documentado_local' | 'em_preparacao' | 'pendente_entrega_final'
  >('all');

  const currentExemplar = useMemo(
    () =>
      ICONOCRACIA_EXEMPLAR_CASES.find((c) => c.id === selectedExemplarId) ||
      ICONOCRACIA_EXEMPLAR_CASES[0],
    [selectedExemplarId]
  );

  const currentRegion = useMemo(
    () =>
      currentExemplar.regions.find((r) => r.id === selectedRegionId) ||
      currentExemplar.regions[0],
    [currentExemplar, selectedRegionId]
  );

  const filteredCatalogEntries = useMemo(
    () =>
      scopeFilter === 'all'
        ? catalogEntries
        : catalogEntries.filter((e) => e.scopeClassification === scopeFilter),
    [catalogEntries, scopeFilter]
  );

  const coreCatalogCount = useMemo(
    () => catalogEntries.filter((e) => e.scopeClassification === 'corpus_core').length,
    [catalogEntries]
  );

  const comparatorCatalogCount = useMemo(
    () => catalogEntries.filter((e) => e.scopeClassification === 'comparador_apendice').length,
    [catalogEntries]
  );

  const filteredMilestones = useMemo(
    () =>
      milestoneFilter === 'all'
        ? COURSE_SCHEDULE_2026_2
        : COURSE_SCHEDULE_2026_2.filter((m) => m.verificationStatus === milestoneFilter),
    [milestoneFilter]
  );

  const handleSelectExemplar = (exemplarId: string) => {
    const found = ICONOCRACIA_EXEMPLAR_CASES.find((c) => c.id === exemplarId);
    if (!found) return;
    setSelectedExemplarId(found.id);
    if (found.regions[0]) {
      setSelectedRegionId(found.regions[0].id);
      setFormNormalizedBox(`[${found.regions[0].coords.join(', ')}]`);
    }
  };

  // Auto-check chronology window (1800-2000) for corpus_core vs comparador_apendice
  const numericYear = Number(formYear) || 1900;
  const isOutsideCoreWindow = numericYear < 1800 || numericYear > 2000;

  // Google Drive OAuth Login & File Listing
  const handleConnectGoogleDrive = async () => {
    setDriveError(null);
    setDriveAuthLoading(true);
    try {
      const { user, accessToken } = await googleSignInForDrive();
      setDriveToken(accessToken);
      onUserAuthenticated(user);
      await fetchDriveFiles(accessToken, driveSearchQuery, driveMimeFilter);
    } catch (error) {
      setDriveError(
        error instanceof Error
          ? error.message
          : 'Falha ao autenticar com o Google Drive.'
      );
    } finally {
      setDriveAuthLoading(false);
    }
  };

  const fetchDriveFiles = async (
    tokenOverride?: string | null,
    customQuery?: string,
    customMime?: 'all' | 'markdown_json' | 'images'
  ) => {
    const activeToken = tokenOverride ?? driveToken ?? getAccessToken();
    if (!activeToken) {
      setDriveError(
        'Conecte sua conta Google com permissão de leitura do Google Drive para listar e importar arquivos.'
      );
      return;
    }

    setDriveLoading(true);
    setDriveError(null);
    try {
      const qParts: string[] = ['trashed = false'];
      const cleanQ = (customQuery ?? driveSearchQuery).trim().replace(/'/g, "\\'");
      if (cleanQ.length > 0) {
        qParts.push(`name contains '${cleanQ}'`);
      }
      const mimeMode = customMime ?? driveMimeFilter;
      if (mimeMode === 'markdown_json') {
        qParts.push(
          "(mimeType contains 'text/' or mimeType = 'application/json' or mimeType = 'application/vnd.google-apps.document' or name contains '.md' or name contains '.json')"
        );
      } else if (mimeMode === 'images') {
        qParts.push("mimeType contains 'image/'");
      }

      const params = new URLSearchParams({
        pageSize: '20',
        fields: 'files(id,name,mimeType,modifiedTime,webViewLink,size)',
        orderBy: 'modifiedTime desc',
        q: qParts.join(' and '),
      });

      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );

      if (res.status === 401 || res.status === 403) {
        setDriveToken(null);
        throw new Error(
          'Sessão do Google Drive expirada ou sem escopo ativo. Clique em "Sign in with Google" para renovar o acesso.'
        );
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Erro da API do Google Drive (${res.status}): ${errText.slice(0, 180)}`);
      }

      const data = (await res.json()) as { files?: DriveFileItem[] };
      setDriveFiles(data.files || []);
    } catch (error) {
      setDriveError(
        error instanceof Error ? error.message : 'Erro ao consultar arquivos no Google Drive.'
      );
    } finally {
      setDriveLoading(false);
    }
  };

  const handleImportDriveFile = async (file: DriveFileItem) => {
    const activeToken = driveToken ?? getAccessToken();
    if (!activeToken) {
      setDriveError('Autentique-se novamente para importar este arquivo do Google Drive.');
      return;
    }

    setDriveLoading(true);
    setDriveError(null);
    try {
      if (file.mimeType.startsWith('image/')) {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`,
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          }
        );
        if (!res.ok) {
          throw new Error(`Não foi possível baixar a imagem (${res.status}).`);
        }
        const blob = await res.blob();
        if (importedImageBlobUrl) {
          URL.revokeObjectURL(importedImageBlobUrl);
        }
        const objectUrl = URL.createObjectURL(blob);
        setImportedImageBlobUrl(objectUrl);
        setImportedImageName(file.name);
        setImportedDriveFileId(file.id);
        setFormTitle(`Item Importado do Drive: ${file.name}`);
        setSubView('protocolo_cv');
        return;
      }

      // Google Docs native document -> export as plain text; otherwise alt=media
      const endpoint =
        file.mimeType === 'application/vnd.google-apps.document'
          ? `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
              file.id
            )}/export?mimeType=text/plain`
          : `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (!res.ok) {
        throw new Error(`Não foi possível ler o documento (${res.status}).`);
      }
      const textContent = await res.text();
      setImportedDocTitle(`${file.name} (Google Drive ID: ${file.id.slice(0, 12)}…)`);
      setImportedDocContent(textContent);
      setImportedDriveFileId(file.id);
    } catch (error) {
      setDriveError(
        error instanceof Error
          ? error.message
          : 'Erro ao importar conteúdo do arquivo no Google Drive.'
      );
    } finally {
      setDriveLoading(false);
    }
  };

  const handleSaveCatalogEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogFeedback(null);
    setCatalogSubmitting(true);
    try {
      const attrs = formAttributesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const effectiveScope: IconocraciaScopeType = isOutsideCoreWindow
        ? 'comparador_apendice'
        : formScope;

      await createIconocraciaCatalogEntry({
        itemCode: formItemCode,
        title: formTitle,
        supportType: formSupport,
        chronologyYear: numericYear,
        scopeClassification: effectiveScope,
        provenanceArchive: formProvenance,
        visualAttributes: attrs,
        normalizedBox: formNormalizedBox,
        stateMeaningProduced: formStateMeaning,
        silenceAndLimits: formSilence,
        driveFileId: importedDriveFileId,
      });

      setCatalogFeedback(
        isOutsideCoreWindow && formScope === 'corpus_core'
          ? 'Ficha salva no Firestore como comparador_apendice (data fora da janela 1800–2000 do corpus core).'
          : 'Ficha catalográfica documentada gravada com sucesso no Firebase Firestore.'
      );
    } catch (error) {
      setCatalogFeedback(
        error instanceof Error ? error.message : 'Erro ao salvar ficha catalográfica.'
      );
    } finally {
      setCatalogSubmitting(false);
    }
  };

  const handleConfirmDeleteCatalogEntry = async () => {
    if (!pendingDeleteEntry) return;
    const idToDelete = pendingDeleteEntry.id;
    setPendingDeleteEntry(null);
    await deleteIconocraciaCatalogEntry(idToDelete);
  };

  return (
    <div className="space-y-10">
      {/* Header & Epistemic Scope Separation Contract */}
      <section className="border-b border-[#142936] pb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4d5e68]">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-[#146563]">
              MÓDULO ISOLADO · ICONOCRACIA-CV (2026-2)
            </span>
            <span aria-hidden="true">·</span>
            <span>DEC-2026-07-29-APARATO-MINIMO</span>
            <span aria-hidden="true">·</span>
            <span>Janela Core: 1800–2000</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <a
              href={ICONOCRACIA_CV_PROJECT_LINKS.cvRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#146563] hover:underline flex items-center gap-1"
            >
              GitHub iconocracia-cv <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={ICONOCRACIA_CV_PROJECT_LINKS.companionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#146563] hover:underline flex items-center gap-1"
            >
              Companion <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={ICONOCRACIA_CV_PROJECT_LINKS.atlasUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#146563] hover:underline flex items-center gap-1"
            >
              Atlas <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={ICONOCRACIA_CV_PROJECT_LINKS.corpusRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#146563] hover:underline flex items-center gap-1"
            >
              iconocracy-corpus <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-editorial font-bold tracking-tight text-[#142936] max-w-4xl">
          Protocolo de Visão Computacional &amp; Detecção Assistida:{' '}
          <code>iconocracia-cv</code> (<code>2026-2</code>)
        </h1>

        <p className="text-sm text-[#4d5e68] max-w-3xl leading-relaxed">
          Módulo dedicado à especificação{' '}
          <code>docs/projeto-disciplina-visao-computacional-2026-2.md</code>, mantendo{' '}
          <strong className="text-[#142936]">separação explícita de escopo</strong> em relação aos
          pacotes de <code>INE410159</code> (<code>CASE01</code>, <code>AO 399</code>,{' '}
          <code>AO 440</code>, <code>AO 441</code>). Opera sob o pipeline{' '}
          <em>
            teoria → critério de inclusão → catálogo documentado → leitura densa de casos
            exemplares → montagem → análise
          </em>
          , tratando o inventário verbal de atributos e a localização visual como{' '}
          <strong className="text-[#142936]">paradigma indiciário (Morelli–Ginzburg)</strong>.
        </p>

        {/* Sub-module Segmented Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#e6eeef] rounded">
            <button
              onClick={() => setSubView('protocolo_cv')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                subView === 'protocolo_cv'
                  ? 'bg-white text-[#142936] font-bold shadow-xs'
                  : 'text-[#4d5e68] hover:text-[#142936]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              01. Protocolo CV &amp; Detecção Assistida
            </button>
            <button
              onClick={() => setSubView('drive_importer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                subView === 'drive_importer'
                  ? 'bg-white text-[#142936] font-bold shadow-xs'
                  : 'text-[#4d5e68] hover:text-[#142936]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              02. Importador Google Drive (Docs &amp; Imagens)
            </button>
            <button
              onClick={() => setSubView('cronograma_parecer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                subView === 'cronograma_parecer'
                  ? 'bg-white text-[#142936] font-bold shadow-xs'
                  : 'text-[#4d5e68] hover:text-[#142936]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              03. Cronograma 2026-2 &amp; Entregável ABNT
            </button>
          </div>

          <div className="text-xs font-mono text-[#4d5e68] tabular-nums">
            Corpus Core Salvo: <strong>{coreCatalogCount}</strong> · Comparador/Apêndice:{' '}
            <strong>{comparatorCatalogCount}</strong> (excluído de estatísticas core)
          </div>
        </div>
      </section>

      {/* SUBVIEW 1: PROTOCOLO DE VISÃO COMPUTACIONAL & DETECÇÃO ASSISTIDA */}
      {subView === 'protocolo_cv' && (
        <div className="space-y-8">
          {/* Exemplar Selector Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ICONOCRACIA_EXEMPLAR_CASES.map((ex) => {
              const isSelected = ex.id === selectedExemplarId;
              return (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExemplar(ex.id)}
                  className={`text-left p-4 border transition-colors ${
                    isSelected
                      ? 'bg-white border-[#146563] ring-1 ring-[#146563]'
                      : 'bg-white/75 border-[#d4dce0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-[#4d5e68] tabular-nums">
                    <span className="font-bold text-[#146563]">{ex.itemCode}</span>
                    <span>
                      {ex.chronologyYear} · {ex.scopeClassification}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#142936] mt-1.5 leading-snug">
                    {ex.title}
                  </div>
                  <div className="text-xs text-[#8d550b] font-mono mt-1">{ex.supportLabel}</div>
                  <p className="text-xs text-[#4d5e68] mt-2 line-clamp-2">
                    {ex.provenanceArchive}
                  </p>
                </button>
              );
            })}
          </section>

          {/* Main Asymmetric Split: Museum Accession Visual Canvas (Left 7 cols) vs Indiciary & Catalog Form (Right 5 cols) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Assisted Detection Canvas & Panofskian 3-Level Inspector */}
            <div className="lg:col-span-7 bg-white border border-[#d4dce0] p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4dce0] pb-3">
                <div>
                  <div className="text-xs font-mono text-[#146563] tabular-nums">
                    {currentExemplar.itemCode} · {currentExemplar.jurisdiction} ·{' '}
                    {currentExemplar.chronologyYear}
                  </div>
                  <h2 className="text-base font-bold text-[#142936]">
                    Inspetor de Regiões Normalizadas <code>[0,1]</code> e Leitura Panofskiana
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {importedImageBlobUrl && (
                    <button
                      onClick={() => {
                        setImportedImageBlobUrl(null);
                        setImportedImageName(null);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-[#f4eddf] text-[#8d550b] border border-[#8d550b] rounded hover:bg-[#e6eeef] transition-colors whitespace-nowrap shrink-0"
                    >
                      Voltar ao Diagrama Curatorial
                    </button>
                  )}
                  <button
                    onClick={() => setShowCvBoxes((v) => !v)}
                    className="px-2.5 py-1 text-xs font-medium bg-[#e6eeef] text-[#142936] rounded hover:bg-[#d4dce0] transition-colors whitespace-nowrap shrink-0"
                  >
                    {showCvBoxes ? 'Ocultar Regiões [x1,y1,x2,y2]' : 'Mostrar Regiões [x1,y1,x2,y2]'}
                  </button>
                </div>
              </div>

              {/* Museum Accession Visual Canvas */}
              <div className="relative w-full aspect-[16/10] bg-[#f7f4ee] border border-[#142936] overflow-hidden select-none">
                {importedImageBlobUrl ? (
                  <img
                    src={importedImageBlobUrl}
                    alt={importedImageName || 'Imagem de referência importada do Google Drive'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-[#142936]"
                  />
                ) : (
                  <div className="w-full h-full p-6 flex flex-col justify-between bg-[#faf8f3]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#4d5e68] border-b border-[#d4dce0] pb-2">
                      <span>SUPORTE: {currentExemplar.supportLabel.toUpperCase()}</span>
                      <span>JANELA CORE: {currentExemplar.chronologyYear} (1800–2000)</span>
                    </div>

                    {/* Architectural / Numismatic / Archival Schematic Plate */}
                    <div className="my-auto mx-auto max-w-lg text-center space-y-2 p-6 border border-[#d4dce0] bg-white">
                      <div className="text-xs font-mono uppercase tracking-widest text-[#146563]">
                        Prancha Esquemática de Localização Indiciária
                      </div>
                      <div className="text-lg font-editorial font-bold text-[#142936]">
                        {currentExemplar.title}
                      </div>
                      <p className="text-xs text-[#4d5e68]">
                        Proveniência: {currentExemplar.provenanceArchive}
                      </p>
                      <div className="pt-2 text-[11px] font-mono text-[#8d550b]">
                        Direitos: {currentExemplar.rightsStatus}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#4d5e68] border-t border-[#d4dce0] pt-2">
                      <span>
                        Atributos catalogados: {currentExemplar.visualAttributes.join(' · ')}
                      </span>
                      <span>IoU mínimo exigido: ≥ 0,50</span>
                    </div>
                  </div>
                )}

                {/* Normalized Bounding Boxes [0,1] */}
                {showCvBoxes &&
                  currentExemplar.regions.map((reg) => {
                    const [x0, y0, x1, y1] = reg.coords;
                    const isSelected = reg.id === currentRegion.id;
                    return (
                      <div
                        key={reg.id}
                        onClick={() => {
                          setSelectedRegionId(reg.id);
                          setFormNormalizedBox(`[${reg.coords.join(', ')}]`);
                        }}
                        style={{
                          left: `${x0 * 100}%`,
                          top: `${y0 * 100}%`,
                          width: `${(x1 - x0) * 100}%`,
                          height: `${(y1 - y0) * 100}%`,
                          borderColor: reg.color,
                        }}
                        className={`absolute border-2 cursor-pointer transition-opacity ${
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

              {/* Region Selector Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {currentExemplar.regions.map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => {
                      setSelectedRegionId(reg.id);
                      setFormNormalizedBox(`[${reg.coords.join(', ')}]`);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors whitespace-nowrap shrink-0 ${
                      currentRegion.id === reg.id
                        ? 'bg-[#142936] text-white border-[#142936]'
                        : 'bg-[#faf8f3] text-[#142936] border-[#d4dce0] hover:bg-[#e6eeef]'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>

              {/* Panofskian 3-Level Switcher (Pre-Iconographic / Iconographic / Iconological) */}
              <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-[#142936]">
                    Região Ativa: {currentRegion.label}{' '}
                    <code className="text-[#146563] tabular-nums ml-1">
                      [{currentRegion.coords.join(', ')}]
                    </code>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                    <button
                      onClick={() => setPanofskyLevel('pre')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        panofskyLevel === 'pre'
                          ? 'bg-white text-[#142936] font-bold shadow-xs'
                          : 'text-[#4d5e68]'
                      }`}
                    >
                      1. Pré-Iconográfico
                    </button>
                    <button
                      onClick={() => setPanofskyLevel('icono')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        panofskyLevel === 'icono'
                          ? 'bg-white text-[#142936] font-bold shadow-xs'
                          : 'text-[#4d5e68]'
                      }`}
                    >
                      2. Iconografia
                    </button>
                    <button
                      onClick={() => setPanofskyLevel('iconol')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        panofskyLevel === 'iconol'
                          ? 'bg-white text-[#142936] font-bold shadow-xs'
                          : 'text-[#4d5e68]'
                      }`}
                    >
                      3. Iconologia
                    </button>
                  </div>
                </div>

                {panofskyLevel === 'pre' && (
                  <div className="p-3 bg-white border border-[#d4dce0] space-y-1">
                    <div className="font-mono text-[11px] text-[#146563]">
                      Nível 1 · Descrição Pré-Iconográfica (Detecção Assistida / Geometria e Forma)
                    </div>
                    <p className="text-[#142936] leading-relaxed">
                      {currentRegion.preIconographic}
                    </p>
                  </div>
                )}

                {panofskyLevel === 'icono' && (
                  <div className="p-3 bg-white border border-[#d4dce0] space-y-1">
                    <div className="font-mono text-[11px] text-[#146563]">
                      Nível 2 · Análise Iconográfica (Inventário Verbal de Atributos Convencionais)
                    </div>
                    <p className="text-[#142936] leading-relaxed">
                      {currentRegion.iconographicAttribute}
                    </p>
                  </div>
                )}

                {panofskyLevel === 'iconol' && (
                  <div className="p-3 bg-white border border-[#d4dce0] space-y-1">
                    <div className="font-mono text-[11px] text-[#8d550b]">
                      Nível 3 · Interpretação Iconológica (Exclusivo da Intérprete Historiadora)
                    </div>
                    <p className="text-[#142936] leading-relaxed">
                      {currentRegion.iconologicalReading}
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-[#4d5e68] pt-1 border-t border-[#d4dce0]">
                  <strong className="text-[#142936]">Estatuto Indiciário (Morelli–Ginzburg):</strong>{' '}
                  {currentRegion.indiciaryRole}
                </div>
              </div>

              {/* Museum Accession Metadata Definition List (Pattern B) */}
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#d4dce0] text-xs">
                <div className="p-3 bg-[#faf8f3] border border-[#d4dce0] space-y-1">
                  <dt className="font-bold text-[#142936]">
                    Sentido Produzido pelo Dispositivo Estatal
                  </dt>
                  <dd className="text-[#4d5e68] leading-relaxed">
                    {currentExemplar.stateMeaningProduced}
                  </dd>
                </div>
                <div className="p-3 bg-[#faf8f3] border border-[#d4dce0] space-y-1">
                  <dt className="font-bold text-[#142936]">
                    Fronteira com Recepção Histórica &amp; Silêncios do Corpus
                  </dt>
                  <dd className="text-[#4d5e68] leading-relaxed">
                    {currentExemplar.historicalReceptionBoundary}{' '}
                    <span className="block mt-1 text-[#8d550b]">
                      {currentExemplar.silenceDeclaration}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right 5 Cols: Firestore Catalog Entry Recorder & Methodological Guardrails */}
            <div className="lg:col-span-5 space-y-5">
              {/* Guardrail Box: DEC-2026-07-29-APARATO-MINIMO */}
              <div className="bg-white border border-[#d4dce0] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#d4dce0] pb-2.5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8d550b]">
                      Disciplina Metodológica · DEC-2026-07-29-APARATO-MINIMO
                    </span>
                    <h3 className="text-base font-bold text-[#142936]">
                      Catálogo Documentado vs. Amostra Estatística
                    </h3>
                  </div>
                  <ShieldAlert className="w-4 h-4 text-[#8d550b] shrink-0" />
                </div>
                <p className="text-xs text-[#4d5e68] leading-relaxed">
                  O <strong>corpus core</strong> (<code>1800–2000</code>) é um{' '}
                  <strong>catálogo documentado</strong> defendido por critério de inclusão e
                  exclusão explícito e auditável, não por representatividade probabilística. Não
                  são utilizados kappa, alfa de Krippendorff/Cronbach, teste-reteste nem índice
                  agregado de atributos como prova (em conformidade com Hayaert, Agulhon, Warner,
                  Sbriccoli e Resnik &amp; Curtis).
                </p>
              </div>

              {/* Firestore Catalog Registration Form */}
              <div className="bg-white border border-[#d4dce0] p-5 space-y-4">
                <div className="border-b border-[#d4dce0] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                    Catálogo Documentado · Firebase Firestore (<code>/iconocraciaCatalog</code>)
                  </span>
                  <h3 className="text-base font-bold text-[#142936]">
                    Registrar Ficha de Inspeção Indiciária
                  </h3>
                </div>

                {!currentUser ? (
                  <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-3">
                    <p className="text-[#4d5e68]">
                      Autentique-se com sua conta Google para persistir fichas do catálogo
                      documentado (<code>corpus_core</code> ou <code>comparador_apendice</code>) no
                      Firestore.
                    </p>
                    <button
                      onClick={handleConnectGoogleDrive}
                      disabled={driveAuthLoading}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#146563] rounded hover:bg-[#0f4f4d] transition-colors"
                    >
                      Entrar com Google (Firestore &amp; Drive)
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveCatalogEntry} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-[#142936] mb-1">
                          Código Estável (ID):
                        </label>
                        <input
                          type="text"
                          value={formItemCode}
                          onChange={(e) => setFormItemCode(e.target.value)}
                          className="w-full p-2 font-mono bg-[#faf8f3] border border-[#d4dce0]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#142936] mb-1">
                          Ano (Janela Core 1800–2000):
                        </label>
                        <input
                          type="number"
                          value={formYear}
                          onChange={(e) => setFormYear(e.target.value)}
                          className="w-full p-2 font-mono tabular-nums bg-[#faf8f3] border border-[#d4dce0]"
                          required
                        />
                      </div>
                    </div>

                    {isOutsideCoreWindow && (
                      <div className="p-2.5 bg-[#f4eddf] border border-[#8d550b] text-[#8d550b] text-[11px]">
                        <strong>Alerta de Escopo:</strong> O ano <code>{numericYear}</code> está
                        fora da janela <code>1800–2000</code>. O item será automaticamente alocado
                        em <code>comparador_apendice</code> e não entrará nas contagens do{' '}
                        <code>corpus_core</code>.
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-[#142936] mb-1">
                        Título Documental do Caso / Dispositivo:
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-[#142936] mb-1">
                          Suporte Estatal:
                        </label>
                        <select
                          value={formSupport}
                          onChange={(e) =>
                            setFormSupport(e.target.value as IconocraciaSupportType)
                          }
                          className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0] font-mono text-[11px]"
                        >
                          <option value="moeda">moeda</option>
                          <option value="selo">selo</option>
                          <option value="brasao">brasao</option>
                          <option value="monumento">monumento</option>
                          <option value="arquitetura_forense">arquitetura_forense</option>
                          <option value="paratexto_normativo">paratexto_normativo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#142936] mb-1">
                          Recorte de Escopo:
                        </label>
                        <select
                          value={isOutsideCoreWindow ? 'comparador_apendice' : formScope}
                          onChange={(e) => setFormScope(e.target.value as IconocraciaScopeType)}
                          disabled={isOutsideCoreWindow}
                          className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0] font-mono text-[11px]"
                        >
                          <option value="corpus_core">corpus_core (1800–2000)</option>
                          <option value="comparador_apendice">
                            comparador_apendice (Fora das estatísticas)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#142936] mb-1">
                        Proveniência Institucional, Acervo e Direitos:
                      </label>
                      <input
                        type="text"
                        value={formProvenance}
                        onChange={(e) => setFormProvenance(e.target.value)}
                        className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block font-semibold text-[#142936] mb-1">
                          Inventário Verbal de Atributos (separados por vírgula):
                        </label>
                        <input
                          type="text"
                          value={formAttributesText}
                          onChange={(e) => setFormAttributesText(e.target.value)}
                          className="w-full p-2 font-mono text-[11px] bg-[#faf8f3] border border-[#d4dce0]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#142936] mb-1">
                          Caixa [0,1]:
                        </label>
                        <input
                          type="text"
                          value={formNormalizedBox}
                          onChange={(e) => setFormNormalizedBox(e.target.value)}
                          className="w-full p-2 font-mono text-[11px] tabular-nums bg-[#faf8f3] border border-[#d4dce0]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#142936] mb-1">
                        Sentido Produzido pelo Dispositivo Estatal:
                      </label>
                      <textarea
                        rows={2}
                        value={formStateMeaning}
                        onChange={(e) => setFormStateMeaning(e.target.value)}
                        className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#142936] mb-1">
                        Declaração dos Silêncios (Ausência Substantiva vs. Coleta / Recepção):
                      </label>
                      <textarea
                        rows={2}
                        value={formSilence}
                        onChange={(e) => setFormSilence(e.target.value)}
                        className="w-full p-2 bg-[#faf8f3] border border-[#d4dce0]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={catalogSubmitting}
                      className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#146563] rounded hover:bg-[#0f4f4d] disabled:opacity-50 transition-colors"
                    >
                      {catalogSubmitting
                        ? 'Salvando Ficha no Firestore...'
                        : 'Salvar Ficha Documentada no Firestore'}
                    </button>

                    {catalogFeedback && (
                      <div className="p-2.5 bg-[#e6eeef] border border-[#146563] text-xs text-[#142936]">
                        {catalogFeedback}
                      </div>
                    )}
                  </form>
                )}

                {/* User's Saved Catalog Entries with Corpus Core vs Comparator Filter */}
                {currentUser && (
                  <div className="pt-3 border-t border-[#d4dce0] space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#142936]">
                        Fichas Salvas ({filteredCatalogEntries.length})
                      </span>
                      <div className="flex items-center gap-1 p-0.5 bg-[#e6eeef] rounded text-[11px]">
                        {(['all', 'corpus_core', 'comparador_apendice'] as const).map((sc) => (
                          <button
                            key={sc}
                            onClick={() => setScopeFilter(sc)}
                            className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                              scopeFilter === sc
                                ? 'bg-white text-[#142936] font-semibold'
                                : 'text-[#4d5e68]'
                            }`}
                          >
                            {sc === 'all' ? 'Todas' : sc === 'corpus_core' ? 'Core' : 'Comparador'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredCatalogEntries.length === 0 ? (
                      <p className="text-xs text-[#4d5e68]">
                        Nenhuma ficha registrada neste filtro de escopo.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {filteredCatalogEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-2.5 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                              <span className="font-bold text-[#142936]">
                                {entry.itemCode} · {entry.chronologyYear} · {entry.supportType}
                              </span>
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    entry.scopeClassification === 'corpus_core'
                                      ? 'text-[#146563] font-semibold'
                                      : 'text-[#8d550b] font-semibold'
                                  }
                                >
                                  {entry.scopeClassification}
                                </span>
                                <button
                                  onClick={() => setPendingDeleteEntry(entry)}
                                  className="text-[#8d550b] hover:text-[#142936]"
                                  title="Remover ficha"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="font-semibold text-[#142936]">{entry.title}</div>
                            <div className="text-[11px] text-[#4d5e68]">
                              Proveniência: {entry.provenanceArchive} · Caixa:{' '}
                              <code>{entry.normalizedBox}</code>
                            </div>
                            <div className="text-[11px] font-mono text-[#146563]">
                              Atributos: {entry.visualAttributes.join(' · ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Stable Vocabulary Reference Table */}
          <section className="bg-white border border-[#d4dce0] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4dce0] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                  Vocabulário Estável Obrigatório (Sem Variação Sinonímica)
                </span>
                <h2 className="text-lg font-editorial font-bold text-[#142936]">
                  Correspondência entre Categorias Teóricas da Tese e Operacionalização Computacional
                </h2>
              </div>
              <BookOpen className="w-5 h-5 text-[#146563]" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#e6eeef] border-b border-[#d4dce0]">
                    <th className="p-3 font-bold">Termo Canônico</th>
                    <th className="p-3 font-bold">Definição Analítica na Tese</th>
                    <th className="p-3 font-bold">
                      Operacionalização no Protocolo <code>iconocracia-cv</code>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4dce0]">
                  {STABLE_VOCABULARY_GLOSSARY.map((row) => (
                    <tr key={row.term} className="hover:bg-[#faf8f3]">
                      <td className="p-3 font-mono font-bold text-[#142936] whitespace-nowrap">
                        {row.term}
                      </td>
                      <td className="p-3 text-[#4d5e68] leading-relaxed">{row.definition}</td>
                      <td className="p-3 text-[#142936] leading-relaxed">
                        {row.cvOperationalization}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* SUBVIEW 2: IMPORTADOR GOOGLE DRIVE (DOCUMENTOS & IMAGENS DE REFERÊNCIA) */}
      {subView === 'drive_importer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: Google Drive OAuth Connection & File Browser */}
          <div className="lg:col-span-5 bg-white border border-[#d4dce0] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4dce0] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                  Google Workspace Integration · Drive API v3
                </span>
                <h2 className="text-base font-bold text-[#142936]">
                  Importar Documentos e Imagens de Referência
                </h2>
              </div>
              <FolderOpen className="w-5 h-5 text-[#146563]" />
            </div>

            <p className="text-xs text-[#4d5e68] leading-relaxed">
              Localize no seu Google Drive o arquivo{' '}
              <code>projeto-disciplina-visao-computacional-2026-2.md</code>, manifestos JSON ou
              imagens do catálogo documentado para carregá-los na sessão. O token OAuth é mantido
              exclusivamente em memória.
            </p>

            {/* Official-style Sign in with Google button when Drive token is not yet in memory */}
            {!driveToken ? (
              <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] space-y-3">
                <div className="text-xs font-semibold text-[#142936]">
                  Autorizar leitura de arquivos do Google Drive nesta sessão:
                </div>
                <button
                  onClick={handleConnectGoogleDrive}
                  disabled={driveAuthLoading}
                  className="flex items-center gap-3 px-4 py-2 bg-white border border-[#747775] rounded text-sm font-medium text-[#1f1f1f] hover:bg-[#f8f9fa] transition-colors shadow-2xs"
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4 h-4 shrink-0"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>
                    {driveAuthLoading ? 'Conectando ao Google Drive...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => {
                      setDriveSearchQuery('projeto-disciplina-visao-computacional-2026-2.md');
                      setDriveMimeFilter('markdown_json');
                      fetchDriveFiles(
                        driveToken,
                        'projeto-disciplina-visao-computacional-2026-2.md',
                        'markdown_json'
                      );
                    }}
                    className="px-2.5 py-1 text-xs font-mono bg-[#faf8f3] border border-[#d4dce0] hover:bg-[#e6eeef] transition-colors"
                  >
                    projeto-disciplina-visao-computacional-2026-2.md
                  </button>
                  <button
                    onClick={() => {
                      setDriveSearchQuery('iconocracia');
                      setDriveMimeFilter('all');
                      fetchDriveFiles(driveToken, 'iconocracia', 'all');
                    }}
                    className="px-2.5 py-1 text-xs font-mono bg-[#faf8f3] border border-[#d4dce0] hover:bg-[#e6eeef] transition-colors"
                  >
                    iconocracia
                  </button>
                  <button
                    onClick={() => {
                      setDriveSearchQuery('');
                      setDriveMimeFilter('images');
                      fetchDriveFiles(driveToken, '', 'images');
                    }}
                    className="px-2.5 py-1 text-xs font-mono bg-[#faf8f3] border border-[#d4dce0] hover:bg-[#e6eeef] transition-colors"
                  >
                    Imagens de Acervo
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={driveSearchQuery}
                    onChange={(e) => setDriveSearchQuery(e.target.value)}
                    placeholder="Nome do arquivo no Google Drive..."
                    className="flex-1 p-2 text-xs bg-[#faf8f3] border border-[#d4dce0]"
                  />
                  <button
                    onClick={() => fetchDriveFiles()}
                    disabled={driveLoading}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#146563] rounded hover:bg-[#0f4f4d] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {driveLoading ? 'Buscando...' : 'Buscar no Drive'}
                  </button>
                </div>
              </div>
            )}

            {driveError && (
              <div className="p-3 bg-[#f4eddf] border border-[#8d550b] text-xs text-[#8d550b] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{driveError}</span>
              </div>
            )}

            {/* Results from Google Drive */}
            {driveToken && (
              <div className="space-y-2 max-h-96 overflow-y-auto pt-2 border-t border-[#d4dce0]">
                {driveFiles.length === 0 && !driveLoading ? (
                  <p className="text-xs text-[#4d5e68]">
                    Nenhum arquivo listado para esta consulta. Ajuste o filtro acima ou clique em{' '}
                    <strong>Buscar no Drive</strong>.
                  </p>
                ) : (
                  driveFiles.map((df) => {
                    const isImage = df.mimeType.startsWith('image/');
                    return (
                      <div
                        key={df.id}
                        className="p-3 bg-[#faf8f3] border border-[#d4dce0] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#142936] truncate">
                            {isImage ? (
                              <ImageIcon className="w-3.5 h-3.5 text-[#8d550b] shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-[#146563] shrink-0" />
                            )}
                            <span className="truncate">{df.name}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#4d5e68] truncate mt-0.5">
                            {df.mimeType} ·{' '}
                            {df.modifiedTime
                              ? new Date(df.modifiedTime).toLocaleDateString('pt-BR')
                              : 'Data n/d'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleImportDriveFile(df)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#142936] rounded hover:bg-[#1e3a4c] transition-colors whitespace-nowrap shrink-0"
                        >
                          <Upload className="w-3 h-3" />
                          {isImage ? 'Inspecionar Imagem' : 'Importar Texto'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Right 7 Cols: Document Reader & Editor for projeto-disciplina-visao-computacional-2026-2.md */}
          <div className="lg:col-span-7 bg-white border border-[#d4dce0] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4dce0] pb-3">
              <div>
                <span className="text-xs font-mono text-[#146563]">
                  Documento em Inspeção · {importedDocTitle}
                </span>
                <h2 className="text-base font-bold text-[#142936]">
                  Leitor / Editor de Especificação (
                  <code>docs/projeto-disciplina-visao-computacional-2026-2.md</code>)
                </h2>
              </div>
              <button
                onClick={() => {
                  setImportedDocTitle(
                    'docs/projeto-disciplina-visao-computacional-2026-2.md (Especificação Base Local)'
                  );
                  setImportedDocContent(DEFAULT_PROJETO_DISCIPLINA_MD);
                  setImportedDriveFileId('');
                }}
                className="px-2.5 py-1 text-xs font-medium bg-[#e6eeef] text-[#142936] rounded hover:bg-[#d4dce0] transition-colors whitespace-nowrap shrink-0"
              >
                Restaurar Documento Base
              </button>
            </div>

            <textarea
              value={importedDocContent}
              onChange={(e) => setImportedDocContent(e.target.value)}
              rows={20}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs leading-relaxed bg-[#faf8f3] border border-[#d4dce0] text-[#142936] focus:outline-none focus:border-[#146563]"
            />
          </div>
        </div>
      )}

      {/* SUBVIEW 3: CRONOGRAMA DE ENTREGAS 2026-2 & PARECER CANÔNICO ABNT NBR 6023:2025 */}
      {subView === 'cronograma_parecer' && (
        <div className="space-y-10">
          {/* Interactive Schedule Tracker (2026-2) */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-editorial font-bold text-[#142936]">
                  Cronograma de Entregas da Disciplina de Visão Computacional (2026-2)
                </h2>
                <p className="text-sm text-[#4d5e68]">
                  Acompanhamento dos marcos de <strong>02/12/2026</strong> (apresentação presencial)
                  e <strong>05/01/2027</strong> (relatório em PDF, GitHub, vídeo, post e artefatos).
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#e6eeef] rounded">
                {(
                  [
                    'all',
                    'documentado_local',
                    'em_preparacao',
                    'pendente_entrega_final',
                  ] as const
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => setMilestoneFilter(st)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      milestoneFilter === st
                        ? 'bg-white text-[#142936] font-bold shadow-xs'
                        : 'text-[#4d5e68]'
                    }`}
                  >
                    {st === 'all'
                      ? 'Todos (4)'
                      : st === 'documentado_local'
                      ? 'Documentado'
                      : st === 'em_preparacao'
                      ? 'Em Preparação'
                      : 'Entrega Final'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMilestones.map((ms) => (
                <article
                  key={ms.id}
                  className="bg-white border border-[#d4dce0] p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="font-bold text-[#146563]">{ms.date}</span>
                      <span className="text-[#8d550b] font-semibold">{ms.verificationStatus}</span>
                    </div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-[#4d5e68]">
                      {ms.phaseLabel}
                    </div>
                    <h3 className="text-base font-bold text-[#142936]">{ms.title}</h3>
                    <ul className="space-y-1.5 pt-1 text-xs text-[#4d5e68]">
                      {ms.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#146563] shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#d4dce0] text-xs space-y-1">
                    <div className="text-[#4d5e68]">
                      <strong className="text-[#142936]">Limite Epistêmico:</strong>{' '}
                      {ms.epistemicBoundary}
                    </div>
                    <div className="font-mono text-[11px] text-[#146563]">
                      Vínculo: {ms.linkedRepositoryPath}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Canonical 5-Section Academic Synthesis: Problema / Argumento / Evidências / Lacunas / Próximos passos */}
          <section className="bg-white border border-[#d4dce0] p-6 space-y-6">
            <div className="border-b border-[#142936] pb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#146563]">
                Síntese Acadêmica Estruturada · Regra 4 das Instruções de Orientação
              </div>
              <h2 className="text-2xl font-editorial font-bold text-[#142936] mt-1">
                Parecer Metodológico: <code>iconocracia-cv</code> (<code>2026-2</code>) em Diálogo
                Controlado com <code>INE410159</code>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
              <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] space-y-2">
                <h3 className="text-sm font-editorial font-bold text-[#142936]">1. Problema</h3>
                <p className="text-[#4d5e68]">
                  Como empregar protocolos de visão computacional (detecção assistida de regiões
                  normalizadas <code>[0,1]</code> e validação de localização espacial{' '}
                  <code>IoU ≥ 0,5</code>) no estudo da <strong>alegoria feminina</strong> na
                  história da <strong>cultura jurídica</strong> (<code>1800–2000</code>), sem
                  reduzir o <strong>catálogo documentado</strong> a uma amostra probabilística nem
                  confundir detecção de formas pré-iconográficas com inferência automática sobre{' '}
                  <strong>soberania</strong>, <strong>legitimidade</strong> ou{' '}
                  <strong>embodiment de gênero</strong>?
                </p>
              </div>

              <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] space-y-2">
                <h3 className="text-sm font-editorial font-bold text-[#142936]">2. Argumento</h3>
                <p className="text-[#4d5e68]">
                  Sustenta-se que a visão computacional pode operar como instrumento auxiliar
                  auditável de <strong>descrição pré-iconográfica</strong> e{' '}
                  <strong>inventário verbal de atributos</strong> sob o estatuto do{' '}
                  <strong>paradigma indiciário</strong> (Ginzburg, 1989), desde que subordinada ao
                  pipeline{' '}
                  <em>
                    teoria → critério de inclusão → catálogo documentado → leitura densa de casos
                    exemplares → montagem → análise
                  </em>{' '}
                  (<code>DEC-2026-07-29-APARATO-MINIMO</code>). Os{' '}
                  <strong>regimes iconocráticos</strong> que distribuem{' '}
                  <strong>feminilidade de Estado</strong> sob{' '}
                  <strong>reconhecimento sem reciprocidade</strong> constituem tipologia analítica
                  produzida pela intérprete historiadora (interpretação minha), jamais agrupamento
                  emergente de modelos ou prova estatística por kappa/alfa.
                </p>
              </div>

              <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] space-y-2">
                <h3 className="text-sm font-editorial font-bold text-[#142936]">3. Evidências</h3>
                <p className="text-[#4d5e68]">
                  (a) Na frente <code>INE410159</code>: 10 esquemas argumentativos auditados, 2
                  perfis v0.1, 16 oráculos especificados, 6 fixtures sintéticas aprovadas no
                  checker <code>CASE01</code> e 3 casos documentais federais (
                  <code>AO 440</code>, <code>AO 441</code>, <code>AO 399</code>) com 12 testes
                  locais aprovados; (b) Na frente <code>iconocracia-cv</code>: especificação do
                  protocolo de detecção assistida com separação estrita entre{' '}
                  <strong>corpus core</strong> (<code>1800–2000</code>: moedas, selos, brasões,
                  monumentos, arquitetura forense, paratextos normativos) e{' '}
                  <strong>comparador / apêndice</strong>, rastreabilidade de acervo e distinção
                  entre sentido produzido pelo dispositivo estatal e recepção histórica.
                </p>
              </div>

              <div className="p-4 bg-[#faf8f3] border border-[#d4dce0] space-y-2">
                <h3 className="text-sm font-editorial font-bold text-[#142936]">
                  4. Lacunas e Silêncios
                </h3>
                <p className="text-[#4d5e68]">
                  (a) O piloto jurídico <code>CASE01</code> (Gemma 4) e o lote de 36 chamadas de{' '}
                  <code>legal-grounding</code> permanecem sem execução candidata de modelos (ausência
                  de execução ≠ acurácia zero); (b) As anotações de regiões normalizadas aguardam
                  dupla revisão humana independente e adjudicação; (c) No catálogo{' '}
                  <code>iconocracia-cv</code>, declara-se a distinção obrigatória entre{' '}
                  <em>ausência substantiva de atributos na fonte</em> (ex.: supressão da balança ou
                  apagamento étnico-racial por <strong>purificação simbólica</strong>) e{' '}
                  <em>ausência de coleta ou restrição de direitos de reprodução</em>.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#e6eeef]/60 border border-[#146563] text-xs space-y-2">
              <h3 className="text-sm font-editorial font-bold text-[#142936]">
                5. Próximos Passos (Rumo a 02/12/2026 e 05/01/2027)
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-[#142936]">
                <li>
                  Importar via Google Drive a versão corrente de{' '}
                  <code>docs/projeto-disciplina-visao-computacional-2026-2.md</code> e os itens
                  prioritários do <code>corpus_core</code> (<code>1800–2000</code>) com
                  identificadores estáveis de acervo.
                </li>
                <li>
                  Concluir a adjudicação humana das caixas normalizadas <code>[0,1]</code> antes de
                  autorizar qualquer execução controlada de modelo multimodal.
                </li>
                <li>
                  Consolidar a apresentação presencial de <strong>02/12/2026</strong> e o relatório
                  final de <strong>05/01/2027</strong> mantendo separados os denominadores de{' '}
                  <code>INE410159</code> e o catálogo documentado de <code>iconocracia-cv</code>.
                </li>
              </ol>
            </div>

            {/* ABNT NBR 6023:2025 References */}
            <div className="pt-4 border-t border-[#d4dce0] space-y-3">
              <h3 className="text-base font-editorial font-bold text-[#142936]">
                Referências Bibliográficas (Padrão ABNT NBR 6023:2025)
              </h3>
              <div className="space-y-2">
                {ABNT_2025_REFERENCES.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-3 bg-[#faf8f3] border border-[#d4dce0] text-xs space-y-1"
                  >
                    <div className="font-mono text-[11px] text-[#142936]">
                      {ref.citationAbnt2025}
                    </div>
                    <div className="text-[#4d5e68]">
                      <strong className="text-[#146563]">Função Metodológica:</strong>{' '}
                      {ref.methodologicalRole}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Confirmation Modal for Destructive Firestore Catalog Deletion */}
      {pendingDeleteEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#142936] max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-editorial font-bold text-[#142936]">
              Confirmar Exclusão de Ficha Catalográfica
            </h3>
            <p className="text-xs text-[#4d5e68] leading-relaxed">
              Deseja remover permanentemente do Firebase Firestore a ficha{' '}
              <strong className="text-[#142936]">
                {pendingDeleteEntry.itemCode} — {pendingDeleteEntry.title}
              </strong>
              ? Esta operação não altera arquivos locais do repositório, mas exclui o registro na
              coleção <code>/iconocraciaCatalog</code>.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingDeleteEntry(null)}
                className="px-3.5 py-1.5 text-xs font-medium border border-[#d4dce0] text-[#142936] bg-[#faf8f3] rounded hover:bg-[#e6eeef] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteCatalogEntry}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8d550b] rounded hover:bg-[#6e4208] transition-colors"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
