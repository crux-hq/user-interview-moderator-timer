import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const studies = pgTable("studies", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  studyName: text("study_name").notNull(),
  sessionDurationMinutes: integer("session_duration_minutes").notNull(),
  contextGuide: text("context_guide").notNull().default(""),
  warmupGuide: text("warmup_guide").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  studyId: uuid("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sections = pgTable("sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  studyId: uuid("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  durationSeconds: integer("duration_seconds").notNull().default(300),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  questionText: text("question_text").notNull().default(""),
  moderatorNotes: text("moderator_notes").notNull().default(""),
  subQuestions: jsonb("sub_questions").$type<string[]>().notNull().default([]),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studyId: uuid("study_id")
    .notNull()
    .references(() => studies.id, { onDelete: "cascade" }),
  participantId: uuid("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  contextNotes: text("context_notes").notNull().default(""),
  warmupNotes: text("warmup_notes").notNull().default(""),
});

export const questionResponses = pgTable("question_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  responseText: text("response_text").notNull().default(""),
  mainCovered: boolean("main_covered").notNull().default(false),
  coveredSubQuestions: jsonb("covered_sub_questions")
    .$type<boolean[]>()
    .notNull()
    .default([]),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  studies: many(studies),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const studiesRelations = relations(studies, ({ one, many }) => ({
  owner: one(user, {
    fields: [studies.userId],
    references: [user.id],
  }),
  participants: many(participants),
  sections: many(sections),
  sessions: many(sessions),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  study: one(studies, {
    fields: [participants.studyId],
    references: [studies.id],
  }),
  sessions: many(sessions),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  study: one(studies, {
    fields: [sections.studyId],
    references: [studies.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  section: one(sections, {
    fields: [questions.sectionId],
    references: [sections.id],
  }),
  responses: many(questionResponses),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  study: one(studies, {
    fields: [sessions.studyId],
    references: [studies.id],
  }),
  participant: one(participants, {
    fields: [sessions.participantId],
    references: [participants.id],
  }),
  responses: many(questionResponses),
}));

export const questionResponsesRelations = relations(
  questionResponses,
  ({ one }) => ({
    session: one(sessions, {
      fields: [questionResponses.sessionId],
      references: [sessions.id],
    }),
    question: one(questions, {
      fields: [questionResponses.questionId],
      references: [questions.id],
    }),
  }),
);

export type Study = typeof studies.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type QuestionResponse = typeof questionResponses.$inferSelect;
