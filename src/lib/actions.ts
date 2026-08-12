"use server";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  participants,
  questionResponses,
  questions,
  sections,
  sessions,
  studies,
} from "@/db/schema";
import { parseSubQuestions } from "@/lib/sub-questions";
import { requireUser } from "@/lib/session";

export type QuestionInput = {
  id?: string;
  questionText: string;
  moderatorNotes: string;
  /** Bulk textarea value: one sub-question per line. */
  subQuestions: string;
};

export type SectionInput = {
  id?: string;
  title: string;
  description: string;
  durationMinutes: number;
  questions: QuestionInput[];
};

export type StudyInput = {
  clientName: string;
  studyName: string;
  sessionDurationMinutes: number;
  contextGuide: string;
  warmupGuide: string;
  sections: SectionInput[];
};

export type StudySection = {
  id: string;
  studyId: string;
  sortOrder: number;
  title: string;
  description: string;
  durationSeconds: number;
  questions: {
    id: string;
    sectionId: string;
    sortOrder: number;
    questionText: string;
    moderatorNotes: string;
    subQuestions: string[];
  }[];
};

async function loadStudySections(studyId: string): Promise<StudySection[]> {
  const studySections = await db
    .select()
    .from(sections)
    .where(eq(sections.studyId, studyId))
    .orderBy(asc(sections.sortOrder));

  if (studySections.length === 0) return [];

  const sectionIds = studySections.map((s) => s.id);
  const studyQuestions = await db
    .select()
    .from(questions)
    .where(inArray(questions.sectionId, sectionIds))
    .orderBy(asc(questions.sortOrder));

  return studySections.map((section) => ({
    ...section,
    questions: studyQuestions
      .filter((q) => q.sectionId === section.id)
      .map((q) => ({
        ...q,
        subQuestions: Array.isArray(q.subQuestions) ? q.subQuestions : [],
      })),
  }));
}

async function saveStudySections(studyId: string, inputSections: SectionInput[]) {
  await db.delete(sections).where(eq(sections.studyId, studyId));

  for (const [sectionIndex, section] of inputSections.entries()) {
    const [createdSection] = await db
      .insert(sections)
      .values({
        studyId,
        sortOrder: sectionIndex,
        title: section.title.trim() || `Section ${sectionIndex + 1}`,
        description: section.description,
        durationSeconds: Math.max(1, Math.round(section.durationMinutes * 60)),
      })
      .returning();

    const sectionQuestions =
      section.questions.length > 0
        ? section.questions
        : [
            {
              questionText: "",
              moderatorNotes: "",
              subQuestions: "",
            },
          ];

    await db.insert(questions).values(
      sectionQuestions.map((question, questionIndex) => ({
        sectionId: createdSection.id,
        sortOrder: questionIndex,
        questionText: question.questionText,
        moderatorNotes: question.moderatorNotes,
        subQuestions: parseSubQuestions(question.subQuestions),
      })),
    );
  }
}

export async function listStudies() {
  const currentUser = await requireUser();
  return db
    .select({
      id: studies.id,
      clientName: studies.clientName,
      studyName: studies.studyName,
      sessionDurationMinutes: studies.sessionDurationMinutes,
      createdAt: studies.createdAt,
      participantCount: sql<number>`cast(count(distinct ${participants.id}) as int)`,
    })
    .from(studies)
    .leftJoin(participants, eq(participants.studyId, studies.id))
    .where(eq(studies.userId, currentUser.id))
    .groupBy(studies.id)
    .orderBy(desc(studies.createdAt));
}

export async function getStudy(studyId: string) {
  const currentUser = await requireUser();
  const [study] = await db
    .select()
    .from(studies)
    .where(and(eq(studies.id, studyId), eq(studies.userId, currentUser.id)))
    .limit(1);

  if (!study) return null;

  return {
    ...study,
    sections: await loadStudySections(studyId),
  };
}

export async function getStudyDetail(studyId: string) {
  const study = await getStudy(studyId);
  if (!study) return null;

  const studyParticipants = await db
    .select()
    .from(participants)
    .where(eq(participants.studyId, studyId))
    .orderBy(asc(participants.createdAt));

  const studySessions = await db
    .select({
      id: sessions.id,
      participantId: sessions.participantId,
      startedAt: sessions.startedAt,
      completedAt: sessions.completedAt,
      participantName: participants.name,
    })
    .from(sessions)
    .innerJoin(participants, eq(sessions.participantId, participants.id))
    .where(eq(sessions.studyId, studyId))
    .orderBy(desc(sessions.startedAt));

  const participantsWithStatus = studyParticipants.map((participant) => {
    const participantSessions = studySessions.filter(
      (session) => session.participantId === participant.id,
    );
    const completed = participantSessions.filter((s) => s.completedAt);
    const latest = participantSessions[0] ?? null;

    return {
      ...participant,
      sessionCount: participantSessions.length,
      completedCount: completed.length,
      latestSession: latest,
    };
  });

  return {
    ...study,
    participants: participantsWithStatus,
    sessions: studySessions,
  };
}

export async function createStudy(input: StudyInput) {
  const currentUser = await requireUser();
  const [study] = await db
    .insert(studies)
    .values({
      userId: currentUser.id,
      clientName: input.clientName.trim(),
      studyName: input.studyName.trim(),
      sessionDurationMinutes: input.sessionDurationMinutes,
      contextGuide: input.contextGuide,
      warmupGuide: input.warmupGuide,
    })
    .returning();

  if (input.sections.length > 0) {
    await saveStudySections(study.id, input.sections);
  }

  revalidatePath("/");
  redirect(`/studies/${study.id}`);
}

export async function updateStudy(studyId: string, input: StudyInput) {
  const currentUser = await requireUser();
  const [owned] = await db
    .select({ id: studies.id })
    .from(studies)
    .where(and(eq(studies.id, studyId), eq(studies.userId, currentUser.id)))
    .limit(1);
  if (!owned) {
    redirect("/");
  }

  await db
    .update(studies)
    .set({
      clientName: input.clientName.trim(),
      studyName: input.studyName.trim(),
      sessionDurationMinutes: input.sessionDurationMinutes,
      contextGuide: input.contextGuide,
      warmupGuide: input.warmupGuide,
    })
    .where(and(eq(studies.id, studyId), eq(studies.userId, currentUser.id)));

  await saveStudySections(studyId, input.sections);

  revalidatePath("/");
  revalidatePath(`/studies/${studyId}`);
  redirect(`/studies/${studyId}`);
}

export async function deleteStudy(studyId: string) {
  const currentUser = await requireUser();
  await db
    .delete(studies)
    .where(and(eq(studies.id, studyId), eq(studies.userId, currentUser.id)));
  revalidatePath("/");
  redirect("/");
}

export async function addParticipant(
  studyId: string,
  name: string,
  notes: string,
) {
  const currentUser = await requireUser();
  const [owned] = await db
    .select({ id: studies.id })
    .from(studies)
    .where(and(eq(studies.id, studyId), eq(studies.userId, currentUser.id)))
    .limit(1);
  if (!owned) {
    throw new Error("Study not found");
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Participant name is required");
  }

  await db.insert(participants).values({
    studyId,
    name: trimmed,
    notes: notes.trim(),
  });

  revalidatePath(`/studies/${studyId}`);
}

export async function getRunData(studyId: string, participantId: string) {
  const study = await getStudy(studyId);
  if (!study) return null;

  const [participant] = await db
    .select()
    .from(participants)
    .where(
      and(eq(participants.id, participantId), eq(participants.studyId, studyId)),
    )
    .limit(1);

  if (!participant) return null;

  return { study, participant };
}

export async function completeSession(input: {
  studyId: string;
  participantId: string;
  startedAt: string;
  contextNotes: string;
  warmupNotes: string;
  responses: {
    questionId: string;
    responseText: string;
    mainCovered: boolean;
    coveredSubQuestions: boolean[];
  }[];
}) {
  const currentUser = await requireUser();
  const [owned] = await db
    .select({ id: studies.id })
    .from(studies)
    .where(and(eq(studies.id, input.studyId), eq(studies.userId, currentUser.id)))
    .limit(1);
  if (!owned) {
    redirect("/");
  }

  const [session] = await db
    .insert(sessions)
    .values({
      studyId: input.studyId,
      participantId: input.participantId,
      startedAt: new Date(input.startedAt),
      completedAt: new Date(),
      contextNotes: input.contextNotes,
      warmupNotes: input.warmupNotes,
    })
    .returning();

  if (input.responses.length > 0) {
    await db.insert(questionResponses).values(
      input.responses.map((r) => ({
        sessionId: session.id,
        questionId: r.questionId,
        responseText: r.responseText,
        mainCovered: r.mainCovered,
        coveredSubQuestions: r.coveredSubQuestions,
      })),
    );
  }

  revalidatePath(`/studies/${input.studyId}`);
  redirect(`/sessions/${session.id}`);
}

export async function getSessionSummary(sessionId: string) {
  const currentUser = await requireUser();
  const [session] = await db
    .select({
      id: sessions.id,
      studyId: sessions.studyId,
      participantId: sessions.participantId,
      startedAt: sessions.startedAt,
      completedAt: sessions.completedAt,
      contextNotes: sessions.contextNotes,
      warmupNotes: sessions.warmupNotes,
      participantName: participants.name,
      clientName: studies.clientName,
      studyName: studies.studyName,
      contextGuide: studies.contextGuide,
      warmupGuide: studies.warmupGuide,
    })
    .from(sessions)
    .innerJoin(participants, eq(sessions.participantId, participants.id))
    .innerJoin(studies, eq(sessions.studyId, studies.id))
    .where(and(eq(sessions.id, sessionId), eq(studies.userId, currentUser.id)))
    .limit(1);

  if (!session) return null;

  const responseRows = await db
    .select({
      id: questionResponses.id,
      questionId: questionResponses.questionId,
      responseText: questionResponses.responseText,
      mainCovered: questionResponses.mainCovered,
      coveredSubQuestions: questionResponses.coveredSubQuestions,
      questionText: questions.questionText,
      subQuestions: questions.subQuestions,
      moderatorNotes: questions.moderatorNotes,
      questionSortOrder: questions.sortOrder,
      sectionId: sections.id,
      sectionTitle: sections.title,
      sectionDescription: sections.description,
      sectionSortOrder: sections.sortOrder,
    })
    .from(questionResponses)
    .innerJoin(questions, eq(questionResponses.questionId, questions.id))
    .innerJoin(sections, eq(questions.sectionId, sections.id))
    .where(eq(questionResponses.sessionId, sessionId))
    .orderBy(asc(sections.sortOrder), asc(questions.sortOrder));

  return {
    ...session,
    responses: responseRows.map((row) => ({
      ...row,
      subQuestions: Array.isArray(row.subQuestions) ? row.subQuestions : [],
      coveredSubQuestions: Array.isArray(row.coveredSubQuestions)
        ? row.coveredSubQuestions
        : [],
    })),
  };
}
