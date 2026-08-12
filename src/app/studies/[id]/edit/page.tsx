import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { StudyWizard } from "@/components/study-wizard";
import { buttonVariants } from "@/components/ui/button";
import { getStudy } from "@/lib/actions";
import { formatSubQuestions } from "@/lib/sub-questions";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditStudyPage({ params }: Props) {
  const { id } = await params;
  const study = await getStudy(id);
  if (!study) notFound();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">
              Edit study script
            </h1>
            <p className="mt-1 text-muted-foreground">
              {study.clientName} · {study.studyName}
            </p>
          </div>
          <Link
            href={`/studies/${study.id}`}
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Cancel
          </Link>
        </div>
        <StudyWizard
          mode="edit"
          studyId={study.id}
          initial={{
            clientName: study.clientName,
            studyName: study.studyName,
            sessionDurationMinutes: study.sessionDurationMinutes,
            contextGuide: study.contextGuide,
            warmupGuide: study.warmupGuide,
            sections: study.sections.map((section) => ({
              id: section.id,
              title: section.title,
              description: section.description,
              durationMinutes: Math.max(
                1,
                Math.round(section.durationSeconds / 60),
              ),
              questions:
                section.questions.length > 0
                  ? section.questions.map((question) => ({
                      id: question.id,
                      questionText: question.questionText,
                      moderatorNotes: question.moderatorNotes,
                      subQuestions: formatSubQuestions(question.subQuestions),
                    }))
                  : [
                      {
                        questionText: "",
                        moderatorNotes: "",
                        subQuestions: "",
                      },
                    ],
            })),
          }}
        />
      </main>
    </>
  );
}
