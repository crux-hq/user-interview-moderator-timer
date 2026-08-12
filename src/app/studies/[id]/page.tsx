import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AddParticipantForm } from "@/components/add-participant-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStudyDetail } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StudyDetailPage({ params }: Props) {
  const { id } = await params;
  const study = await getStudyDetail(id);
  if (!study) notFound();

  return (
    <>
      <AppHeader />
      <main
        className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10"
        crux-attr="ex-118017"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{study.clientName}</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {study.studyName}
            </h1>
            <div className="mt-2 flex gap-2">
              <Badge variant="secondary">
                {study.sessionDurationMinutes} min session
              </Badge>
              <Badge variant="outline">
                {study.sections.length} section
                {study.sections.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/studies/${study.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex",
              )}
            >
              Edit script
            </Link>
            <Link
              href="/studies"
              className={cn(buttonVariants({ variant: "ghost" }), "inline-flex")}
            >
              Studies
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Context guide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {study.contextGuide || "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warm-up guide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {study.warmupGuide || "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              Start a session against an individual participant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AddParticipantForm studyId={study.id} />

            {study.participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No participants yet. Add someone to begin interviewing.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {study.participants.map((participant) => {
                    const status =
                      participant.completedCount > 0
                        ? `${participant.completedCount} completed`
                        : "Not started";
                    return (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">
                          {participant.name}
                        </TableCell>
                        <TableCell className="max-w-[240px] truncate text-muted-foreground">
                          {participant.notes || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              participant.completedCount > 0
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          {participant.latestSession?.completedAt && (
                            <Link
                              href={`/sessions/${participant.latestSession.id}`}
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "sm",
                                }),
                                "inline-flex",
                              )}
                            >
                              View latest
                            </Link>
                          )}
                          <Link
                            href={`/studies/${study.id}/participants/${participant.id}/run`}
                            className={cn(
                              buttonVariants({ size: "sm" }),
                              "inline-flex",
                            )}
                          >
                            Start session
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {study.sessions.filter((s) => s.completedAt).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No completed sessions yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {study.sessions
                  .filter((s) => s.completedAt)
                  .map((session) => (
                    <li key={session.id}>
                      <Link
                        href={`/sessions/${session.id}`}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                      >
                        <span className="font-medium">
                          {session.participantName}
                        </span>
                        <span className="text-muted-foreground">
                          {session.completedAt
                            ? new Date(session.completedAt).toLocaleString()
                            : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Script sections</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {study.sections.map((section, index) => (
                <li
                  key={section.id}
                  className="rounded-lg border px-3 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {index + 1}. {section.title}
                    </span>
                    <Badge variant="outline">
                      {Math.round(section.durationSeconds / 60)} min
                    </Badge>
                  </div>
                  {section.description && (
                    <p className="mt-1 text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                  <ul className="mt-3 space-y-2 border-t pt-3">
                    {section.questions.map((question, questionIndex) => (
                      <li key={question.id}>
                        <p className="font-medium">
                          Q{questionIndex + 1}. {question.questionText}
                        </p>
                        {question.subQuestions.length > 0 && (
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                            {question.subQuestions.map((sub, subIndex) => (
                              <li key={`${question.id}-${subIndex}`}>{sub}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
