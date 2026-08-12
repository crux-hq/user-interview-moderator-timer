import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionSummary } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SessionSummaryPage({ params }: Props) {
  const { id } = await params;
  const session = await getSessionSummary(id);
  if (!session) notFound();

  const grouped = session.responses.reduce<
    {
      sectionId: string;
      sectionTitle: string;
      sectionDescription: string;
      items: typeof session.responses;
    }[]
  >((acc, response) => {
    const existing = acc.find((group) => group.sectionId === response.sectionId);
    if (existing) {
      existing.items.push(response);
      return acc;
    }
    acc.push({
      sectionId: response.sectionId,
      sectionTitle: response.sectionTitle,
      sectionDescription: response.sectionDescription,
      items: [response],
    });
    return acc;
  }, []);

  return (
    <>
      <AppHeader />
      <main
        className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10"
        crux-attr="ex-158737"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {session.clientName} · {session.studyName}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Session with {session.participantName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed{" "}
              {session.completedAt
                ? new Date(session.completedAt).toLocaleString()
                : "—"}
            </p>
          </div>
          <Link
            href={`/studies/${session.studyId}`}
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Back to study
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Context notes</CardTitle>
              <CardDescription>From the context-setting slide</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {session.contextNotes || "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warm-up notes</CardTitle>
              <CardDescription>From the warm-up slide</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {session.warmupNotes || "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.sectionId} className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {group.sectionTitle}
                </h2>
                {group.sectionDescription && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {group.sectionDescription}
                  </p>
                )}
              </div>
              {group.items.map((response, index) => (
                <Card key={response.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2 text-base">
                      <span
                        className={
                          response.mainCovered
                            ? "mt-0.5 text-emerald-600"
                            : "mt-0.5 text-muted-foreground/40"
                        }
                      >
                        ✓
                      </span>
                      <span>
                        Q{index + 1}. {response.questionText}
                      </span>
                    </CardTitle>
                    {response.subQuestions.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {response.subQuestions.map((sub, subIndex) => (
                          <li
                            key={`${response.id}-sub-${subIndex}`}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span
                              className={
                                response.coveredSubQuestions[subIndex]
                                  ? "text-emerald-600"
                                  : "text-muted-foreground/40"
                              }
                            >
                              ✓
                            </span>
                            <span>{sub}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">
                      {response.responseText || "No response captured."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
