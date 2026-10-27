import { db } from './index.ts';
import { users, adjudicationEntries, savedLiteratureEntries } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Database operation failed. Please try again later.', { cause: error });
  }
}

export async function getUserAdjudicationsByUid(uid: string) {
  try {
    const rows = await db
      .select({
        id: adjudicationEntries.id,
        caseId: adjudicationEntries.caseId,
        schemeId: adjudicationEntries.schemeId,
        targetId: adjudicationEntries.targetId,
        decision: adjudicationEntries.decision,
        deadlineConclusion: adjudicationEntries.deadlineConclusion,
        notes: adjudicationEntries.notes,
        createdAt: adjudicationEntries.createdAt,
        authorEmail: users.email,
        authorUid: users.uid,
      })
      .from(adjudicationEntries)
      .innerJoin(users, eq(adjudicationEntries.userId, users.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(adjudicationEntries.createdAt));

    return rows;
  } catch (error) {
    console.error('Database query failed (getUserAdjudicationsByUid):', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertUserAdjudication(
  uid: string,
  email: string,
  input: {
    caseId: string;
    schemeId: string;
    targetId: string;
    decision: string;
    deadlineConclusion: string;
    notes: string;
  }
) {
  try {
    const userRecord = await getOrCreateUser(uid, email);
    const inserted = await db
      .insert(adjudicationEntries)
      .values({
        userId: userRecord.id,
        caseId: input.caseId,
        schemeId: input.schemeId,
        targetId: input.targetId,
        decision: input.decision,
        deadlineConclusion: input.deadlineConclusion,
        notes: input.notes,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database insert failed (insertUserAdjudication):', error);
    throw new Error('Database insert failed. Please try again later.', { cause: error });
  }
}

export async function deleteUserAdjudicationById(uid: string, entryId: number) {
  try {
    const userRecord = await db.select().from(users).where(eq(users.uid, uid));
    if (!userRecord.length) {
      return false;
    }
    await db
      .delete(adjudicationEntries)
      .where(
        and(
          eq(adjudicationEntries.id, entryId),
          eq(adjudicationEntries.userId, userRecord[0].id)
        )
      );
    return true;
  } catch (error) {
    console.error('Database delete failed (deleteUserAdjudicationById):', error);
    throw new Error('Database delete failed. Please try again later.', { cause: error });
  }
}

export async function getUserSavedLiteratureByUid(uid: string) {
  try {
    const rows = await db
      .select({
        id: savedLiteratureEntries.id,
        openalexId: savedLiteratureEntries.openalexId,
        title: savedLiteratureEntries.title,
        authorsSummary: savedLiteratureEntries.authorsSummary,
        publicationYear: savedLiteratureEntries.publicationYear,
        doiUrl: savedLiteratureEntries.doiUrl,
        createdAt: savedLiteratureEntries.createdAt,
        savedByUid: users.uid,
      })
      .from(savedLiteratureEntries)
      .innerJoin(users, eq(savedLiteratureEntries.userId, users.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(savedLiteratureEntries.createdAt));

    return rows;
  } catch (error) {
    console.error('Database query failed (getUserSavedLiteratureByUid):', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertUserSavedLiterature(
  uid: string,
  email: string,
  input: {
    openalexId: string;
    title: string;
    authorsSummary: string;
    publicationYear: number;
    doiUrl: string;
  }
) {
  try {
    const userRecord = await getOrCreateUser(uid, email);
    const inserted = await db
      .insert(savedLiteratureEntries)
      .values({
        userId: userRecord.id,
        openalexId: input.openalexId,
        title: input.title,
        authorsSummary: input.authorsSummary,
        publicationYear: input.publicationYear,
        doiUrl: input.doiUrl,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database insert failed (insertUserSavedLiterature):', error);
    throw new Error('Database insert failed. Please try again later.', { cause: error });
  }
}
