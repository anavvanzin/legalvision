import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const adjudicationEntries = pgTable('adjudication_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  caseId: text('case_id').notNull(),
  schemeId: text('scheme_id').notNull(),
  targetId: text('target_id').notNull(),
  decision: text('decision').notNull(),
  deadlineConclusion: text('deadline_conclusion').notNull(),
  notes: text('notes').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savedLiteratureEntries = pgTable('saved_literature_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  openalexId: text('openalex_id').notNull(),
  title: text('title').notNull(),
  authorsSummary: text('authors_summary').notNull(),
  publicationYear: integer('publication_year').notNull(),
  doiUrl: text('doi_url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  adjudications: many(adjudicationEntries),
  savedLiterature: many(savedLiteratureEntries),
}));

export const adjudicationEntriesRelations = relations(adjudicationEntries, ({ one }) => ({
  author: one(users, {
    fields: [adjudicationEntries.userId],
    references: [users.id],
  }),
}));

export const savedLiteratureEntriesRelations = relations(savedLiteratureEntries, ({ one }) => ({
  author: one(users, {
    fields: [savedLiteratureEntries.userId],
    references: [users.id],
  }),
}));
