import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const studies = pgTable("studies", {
  id: uuid("id").defaultRandom().primaryKey(),
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
  mainQuestion: text("main_question").notNull().default(""),
  keyQuestions: text("key_questions").notNull().default(""),
  moderatorNotes: text("moderator_notes").notNull().default(""),
  durationSeconds: integer("duration_seconds").notNull().default(300),
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

export const sectionResponses = pgTable("section_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  responseText: text("response_text").notNull().default(""),
});

export const studiesRelations = relations(studies, ({ many }) => ({
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
  responses: many(sectionResponses),
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
  responses: many(sectionResponses),
}));

export const sectionResponsesRelations = relations(
  sectionResponses,
  ({ one }) => ({
    session: one(sessions, {
      fields: [sectionResponses.sessionId],
      references: [sessions.id],
    }),
    section: one(sections, {
      fields: [sectionResponses.sectionId],
      references: [sections.id],
    }),
  }),
);

export type Study = typeof studies.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type SectionResponse = typeof sectionResponses.$inferSelect;
