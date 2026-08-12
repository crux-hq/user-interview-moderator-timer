"use server";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  participants,
  sectionResponses,
  sections,
  sessions,
  studies,
} from "@/db/schema";

export type SectionInput = {
  id?: string;
  title: string;
  mainQuestion: string;
  keyQuestions: string;
  moderatorNotes: string;
  durationMinutes: number;
};

export type StudyInput = {
  clientName: string;
  studyName: string;
  sessionDurationMinutes: number;
  contextGuide: string;
  warmupGuide: string;
  sections: SectionInput[];
};

export async function listStudies() {
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
    .groupBy(studies.id)
    .orderBy(desc(studies.createdAt));
}

export async function getStudy(studyId: string) {
  const [study] = await db
    .select()
    .from(studies)
    .where(eq(studies.id, studyId))
    .limit(1);

  if (!study) return null;

  const studySections = await db
    .select()
    .from(sections)
    .where(eq(sections.studyId, studyId))
    .orderBy(asc(sections.sortOrder));

  return { ...study, sections: studySections };
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
  const [study] = await db
    .insert(studies)
    .values({
      clientName: input.clientName.trim(),
      studyName: input.studyName.trim(),
      sessionDurationMinutes: input.sessionDurationMinutes,
      contextGuide: input.contextGuide,
      warmupGuide: input.warmupGuide,
    })
    .returning();

  if (input.sections.length > 0) {
    await db.insert(sections).values(
      input.sections.map((section, index) => ({
        studyId: study.id,
        sortOrder: index,
        title: section.title.trim() || `Section ${index + 1}`,
        mainQuestion: section.mainQuestion,
        keyQuestions: section.keyQuestions,
        moderatorNotes: section.moderatorNotes,
        durationSeconds: Math.max(1, Math.round(section.durationMinutes * 60)),
      })),
    );
  }

  revalidatePath("/");
  redirect(`/studies/${study.id}`);
}

export async function updateStudy(studyId: string, input: StudyInput) {
  await db
    .update(studies)
    .set({
      clientName: input.clientName.trim(),
      studyName: input.studyName.trim(),
      sessionDurationMinutes: input.sessionDurationMinutes,
      contextGuide: input.contextGuide,
      warmupGuide: input.warmupGuide,
    })
    .where(eq(studies.id, studyId));

  await db.delete(sections).where(eq(sections.studyId, studyId));

  if (input.sections.length > 0) {
    await db.insert(sections).values(
      input.sections.map((section, index) => ({
        studyId,
        sortOrder: index,
        title: section.title.trim() || `Section ${index + 1}`,
        mainQuestion: section.mainQuestion,
        keyQuestions: section.keyQuestions,
        moderatorNotes: section.moderatorNotes,
        durationSeconds: Math.max(1, Math.round(section.durationMinutes * 60)),
      })),
    );
  }

  revalidatePath("/");
  revalidatePath(`/studies/${studyId}`);
  redirect(`/studies/${studyId}`);
}

export async function deleteStudy(studyId: string) {
  await db.delete(studies).where(eq(studies.id, studyId));
  revalidatePath("/");
  redirect("/");
}

export async function addParticipant(
  studyId: string,
  name: string,
  notes: string,
) {
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
  responses: { sectionId: string; responseText: string }[];
}) {
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
    await db.insert(sectionResponses).values(
      input.responses.map((r) => ({
        sessionId: session.id,
        sectionId: r.sectionId,
        responseText: r.responseText,
      })),
    );
  }

  revalidatePath(`/studies/${input.studyId}`);
  redirect(`/sessions/${session.id}`);
}

export async function getSessionSummary(sessionId: string) {
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
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  const responseRows = await db
    .select({
      id: sectionResponses.id,
      sectionId: sectionResponses.sectionId,
      responseText: sectionResponses.responseText,
      title: sections.title,
      mainQuestion: sections.mainQuestion,
      sortOrder: sections.sortOrder,
    })
    .from(sectionResponses)
    .innerJoin(sections, eq(sectionResponses.sectionId, sections.id))
    .where(eq(sectionResponses.sessionId, sessionId))
    .orderBy(asc(sections.sortOrder));

  return {
    ...session,
    responses: responseRows,
  };
}
