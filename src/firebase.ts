import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Workspace Drive OAuth Scopes synced with set_up_oauth
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

const googleProvider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  googleProvider.addScope(scope);
}

// In-memory cache for Google Drive OAuth access token (never stored in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

onAuthStateChanged(auth, (user: User | null) => {
  if (!user && !isSigningIn) {
    cachedAccessToken = null;
  }
});

// Validate connection to Firestore on boot as required by firebase-integration-rpc
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGoogle(): Promise<User> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return result.user;
  } finally {
    isSigningIn = false;
  }
}

export async function googleSignInForDrive(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso OAuth para o Google Drive.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
}

export function getAccessToken(): string | null {
  return cachedAccessToken;
}

export async function signOutUser(): Promise<void> {
  cachedAccessToken = null;
  await signOut(auth);
}

// Defensive Validation Constants synced verbatim with firebase-blueprint.json & firestore.rules
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const CASE_ID_REGEX = /^[a-zA-Z0-9_:-]+$/;
const TARGET_ID_REGEX = /^[a-zA-Z0-9_:\-.]+$/;

export interface AdjudicationRecord {
  id: string;
  caseId: string;
  schemeId: 'verbal_classification' | 'established_rule' | 'witness_testimony' | 'grounding_comma';
  targetId: string;
  decision: 'human_verified' | 'disputed' | 'draft';
  deadlineConclusion: string;
  notes: string;
  reviewerUid: string;
  reviewerName: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface SavedWorkRecord {
  id: string;
  openalexId: string;
  title: string;
  authorsSummary: string;
  publicationYear: number;
  citedByCount: number;
  doiUrl: string;
  caseTag: string;
  ownerUid: string;
  createdAt?: Timestamp | null;
}

export type IconocraciaSupportType =
  | 'moeda'
  | 'selo'
  | 'brasao'
  | 'monumento'
  | 'arquitetura_forense'
  | 'paratexto_normativo';

export type IconocraciaScopeType = 'corpus_core' | 'comparador_apendice';

export interface IconocraciaCatalogRecord {
  id: string;
  itemCode: string;
  title: string;
  supportType: IconocraciaSupportType;
  chronologyYear: number;
  scopeClassification: IconocraciaScopeType;
  provenanceArchive: string;
  visualAttributes: string[];
  normalizedBox: string;
  stateMeaningProduced: string;
  silenceAndLimits: string;
  driveFileId: string;
  ownerUid: string;
  createdAt?: Timestamp | null;
}

export async function createAdjudicationRecord(input: {
  caseId: string;
  schemeId: 'verbal_classification' | 'established_rule' | 'witness_testimony' | 'grounding_comma';
  targetId: string;
  decision: 'human_verified' | 'disputed' | 'draft';
  deadlineConclusion: string;
  notes: string;
}): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Autenticação obrigatória para registrar adjudicação humana.');
  }

  const cleanCaseId = input.caseId.trim().slice(0, 64);
  const cleanTargetId = input.targetId.trim().replace(/[^a-zA-Z0-9_:\-.]/g, '_').slice(0, 120);
  const cleanDeadline = input.deadlineConclusion.trim().slice(0, 80);
  const cleanNotes = input.notes.trim().slice(0, 1500);
  const reviewerName = (currentUser.displayName || currentUser.email || 'Revisor Autenticado')
    .trim()
    .slice(0, 120);

  if (cleanCaseId.length < 2 || !CASE_ID_REGEX.test(cleanCaseId)) {
    throw new Error('caseId inválido segundo o contrato do firebase-blueprint.json.');
  }
  if (cleanTargetId.length < 1 || !TARGET_ID_REGEX.test(cleanTargetId)) {
    throw new Error('targetId inválido segundo o contrato do firebase-blueprint.json.');
  }
  if (cleanNotes.length < 3) {
    throw new Error('A justificativa técnica (notes) deve ter pelo menos 3 caracteres.');
  }

  const docId = `adj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!ID_REGEX.test(docId)) {
    throw new Error('ID de documento inválido.');
  }

  const path = `adjudications/${docId}`;
  try {
    await setDoc(doc(db, 'adjudications', docId), {
      caseId: cleanCaseId,
      schemeId: input.schemeId,
      targetId: cleanTargetId,
      decision: input.decision,
      deadlineConclusion: cleanDeadline || 'unspecified',
      notes: cleanNotes,
      reviewerUid: currentUser.uid,
      reviewerName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    try {
      const idToken = await currentUser.getIdToken();
      await fetch('/api/adjudications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          caseId: cleanCaseId,
          schemeId: input.schemeId,
          targetId: cleanTargetId,
          decision: input.decision,
          deadlineConclusion: cleanDeadline || 'unspecified',
          notes: cleanNotes,
        }),
      });
    } catch {
      // Keep UI isolated from backend persistence sync details
    }
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteAdjudicationRecord(adjudicationId: string): Promise<void> {
  const path = `adjudications/${adjudicationId}`;
  try {
    await deleteDoc(doc(db, 'adjudications', adjudicationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveOpenAlexWorkToFirestore(work: {
  openalexId: string;
  title: string;
  authorsSummary: string;
  publicationYear: number;
  citedByCount: number;
  doiUrl: string;
  caseTag: string;
}): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Faça login com Google para salvar referências bibliográficas no Firestore.');
  }

  const cleanOpenalexId = work.openalexId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'W000';
  const docId = `work_${cleanOpenalexId}_${currentUser.uid.slice(0, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `savedWorks/${docId}`;

  try {
    await setDoc(doc(db, 'savedWorks', docId), {
      openalexId: cleanOpenalexId,
      title: (work.title || 'Sem título').trim().slice(0, 500),
      authorsSummary: (work.authorsSummary || 'Autor não listado').trim().slice(0, 300),
      publicationYear: Math.max(1800, Math.min(2100, Math.round(Number(work.publicationYear) || 2000))),
      citedByCount: Math.max(0, Math.round(Number(work.citedByCount) || 0)),
      doiUrl: (work.doiUrl || '').trim().slice(0, 400),
      caseTag: (work.caseTag || 'GERAL').trim().slice(0, 64),
      ownerUid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    try {
      const idToken = await currentUser.getIdToken();
      await fetch('/api/literature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          openalexId: cleanOpenalexId,
          title: (work.title || 'Sem título').trim().slice(0, 500),
          authorsSummary: (work.authorsSummary || 'Autor não listado').trim().slice(0, 300),
          publicationYear: Math.max(1800, Math.min(2100, Math.round(Number(work.publicationYear) || 2000))),
          doiUrl: (work.doiUrl || '').trim().slice(0, 400),
        }),
      });
    } catch {
      // Keep UI isolated from backend persistence sync details
    }
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeSavedWorkFromFirestore(workId: string): Promise<void> {
  const path = `savedWorks/${workId}`;
  try {
    await deleteDoc(doc(db, 'savedWorks', workId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createIconocraciaCatalogEntry(input: {
  itemCode: string;
  title: string;
  supportType: IconocraciaSupportType;
  chronologyYear: number;
  scopeClassification: IconocraciaScopeType;
  provenanceArchive: string;
  visualAttributes: string[];
  normalizedBox: string;
  stateMeaningProduced: string;
  silenceAndLimits: string;
  driveFileId?: string;
}): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Autenticação obrigatória para salvar fichas catalográficas no Firestore.');
  }

  const cleanItemCode = input.itemCode.trim().replace(/[^a-zA-Z0-9_:-]/g, '-').slice(0, 64);
  const cleanTitle = input.title.trim().slice(0, 200);
  const cleanYear = Math.max(1500, Math.min(2100, Math.round(Number(input.chronologyYear) || 1900)));
  const cleanProvenance = input.provenanceArchive.trim().slice(0, 300);
  const cleanAttrs = input.visualAttributes
    .map((a) => a.trim().slice(0, 100))
    .filter((a) => a.length > 0)
    .slice(0, 12);
  const cleanBox = input.normalizedBox.trim().slice(0, 80);
  const cleanMeaning = input.stateMeaningProduced.trim().slice(0, 1200);
  const cleanSilence = input.silenceAndLimits.trim().slice(0, 800);
  const cleanDriveId = (input.driveFileId || '').trim().slice(0, 128);

  if (cleanItemCode.length < 2 || !CASE_ID_REGEX.test(cleanItemCode)) {
    throw new Error('Código do item (itemCode) inválido.');
  }
  if (cleanTitle.length < 3) {
    throw new Error('O título documental deve ter pelo menos 3 caracteres.');
  }
  if (cleanProvenance.length < 3) {
    throw new Error('A proveniência institucional e o identificador de acervo são obrigatórios.');
  }
  if (cleanAttrs.length === 0) {
    throw new Error('Informe ao menos 1 atributo no inventário verbal indiciário (máx. 12).');
  }
  if (cleanMeaning.length < 5 || cleanSilence.length < 5) {
    throw new Error('Preencha o sentido produzido pelo dispositivo estatal e a declaração dos silêncios.');
  }

  const docId = `icon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!ID_REGEX.test(docId)) {
    throw new Error('ID de documento inválido.');
  }

  const path = `iconocraciaCatalog/${docId}`;
  try {
    await setDoc(doc(db, 'iconocraciaCatalog', docId), {
      itemCode: cleanItemCode,
      title: cleanTitle,
      supportType: input.supportType,
      chronologyYear: cleanYear,
      scopeClassification: input.scopeClassification,
      provenanceArchive: cleanProvenance,
      visualAttributes: cleanAttrs,
      normalizedBox: cleanBox || '[0.10, 0.10, 0.90, 0.90]',
      stateMeaningProduced: cleanMeaning,
      silenceAndLimits: cleanSilence,
      driveFileId: cleanDriveId,
      ownerUid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteIconocraciaCatalogEntry(entryId: string): Promise<void> {
  const path = `iconocraciaCatalog/${entryId}`;
  try {
    await deleteDoc(doc(db, 'iconocraciaCatalog', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export { onAuthStateChanged, collection, onSnapshot, query, where };
export type { User };
