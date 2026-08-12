"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { completeSession, type StudySection } from "@/lib/actions";
import type { Participant, Study } from "@/db/schema";
import { formatCountdown, timerTone } from "@/lib/time";
import { cn } from "@/lib/utils";

type StudyWithSections = Study & { sections: StudySection[] };

type Slide =
  | { kind: "context" }
  | { kind: "warmup" }
  | {
      kind: "question";
      section: StudySection;
      question: StudySection["questions"][number];
      sectionIndex: number;
      questionIndex: number;
    };

function TimerChip({
  label,
  remaining,
  total,
}: {
  label: string;
  remaining: number;
  total: number;
}) {
  const tone = timerTone(remaining, total);
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 min-w-[120px]",
        tone === "ok" && "bg-card",
        tone === "warn" && "border-warn bg-[#fffbeb] text-warn-foreground",
        tone === "danger" && "border-destructive bg-[#fef2f2] text-destructive",
        tone === "overtime" && "border-destructive bg-[#fee2e2] text-destructive",
      )}
    >
      <div className="text-[12px] font-medium uppercase tracking-wide opacity-70">{label}</div>
      <div className="font-mono text-[22px] font-semibold tabular-nums leading-none">
        {formatCountdown(remaining)}
      </div>
    </div>
  );
}

export function SessionRunner({
  study,
  participant,
}: {
  study: StudyWithSections;
  participant: Participant;
}) {
  const router = useRouter();
  const slides: Slide[] = useMemo(
    () => [
      { kind: "context" },
      { kind: "warmup" },
      ...study.sections.flatMap((section, sectionIndex) =>
        section.questions.map((question, questionIndex) => ({
          kind: "question" as const,
          section,
          question,
          sectionIndex,
          questionIndex,
        })),
      ),
    ],
    [study.sections],
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const [startedAt] = useState(() => new Date().toISOString());
  const [overallRemaining, setOverallRemaining] = useState(
    study.sessionDurationMinutes * 60,
  );
  const [sectionRemaining, setSectionRemaining] = useState(0);
  const [contextNotes, setContextNotes] = useState("");
  const [warmupNotes, setWarmupNotes] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [mainCovered, setMainCovered] = useState<Record<string, boolean>>({});
  const [subCovered, setSubCovered] = useState<Record<string, boolean[]>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const previousSectionId = useRef<string | null>(null);

  const slide = slides[slideIndex];
  const overallTotal = study.sessionDurationMinutes * 60;
  const sectionTotal =
    slide.kind === "question" ? slide.section.durationSeconds : 0;

  useEffect(() => {
    const id = window.setInterval(() => {
      setOverallRemaining((v) => v - 1);
      setSectionRemaining((v) => v - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (slide.kind === "question") {
      if (previousSectionId.current !== slide.section.id) {
        setSectionRemaining(slide.section.durationSeconds);
        previousSectionId.current = slide.section.id;
      }
    } else {
      previousSectionId.current = null;
      setSectionRemaining(0);
    }
  }, [slideIndex, slide]);

  function finish() {
    setError(null);
    startTransition(async () => {
      try {
        await completeSession({
          studyId: study.id,
          participantId: participant.id,
          startedAt,
          contextNotes,
          warmupNotes,
          responses: study.sections.flatMap((section) =>
            section.questions.map((question) => ({
              questionId: question.id,
              responseText: responses[question.id] ?? "",
              mainCovered: mainCovered[question.id] ?? false,
              coveredSubQuestions:
                subCovered[question.id] ??
                question.subQuestions.map(() => false),
            })),
          ),
        });
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "digest" in e &&
          String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        setError(e instanceof Error ? e.message : "Failed to save session.");
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div>
            <div className="text-sm text-muted-foreground">
              {study.clientName} · {study.studyName}
            </div>
            <div className="text-lg font-semibold">{participant.name}</div>
          </div>
          <div className="flex items-center gap-3">
            <TimerChip
              label="Overall"
              remaining={overallRemaining}
              total={overallTotal}
            />
            {slide.kind === "question" && (
              <TimerChip
                label="This section"
                remaining={sectionRemaining}
                total={sectionTotal}
              />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            Slide {slideIndex + 1} / {slides.length}
          </Badge>
          {slide.kind === "context" && <Badge>Context</Badge>}
          {slide.kind === "warmup" && <Badge>Warm-up</Badge>}
          {slide.kind === "question" && (
            <>
              <Badge>Section {slide.sectionIndex + 1}</Badge>
              <Badge variant="outline">
                Question {slide.questionIndex + 1}
              </Badge>
            </>
          )}
        </div>

        <div className="flex-1 space-y-6">
          {slide.kind === "context" && (
            <>
              <h1 className="text-[28px] font-semibold tracking-tight">
                Context setting
              </h1>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
                {study.contextGuide || "No context guide written for this study."}
              </p>
              <div className="space-y-2">
                <div className="text-sm font-medium">Optional notes</div>
                <Textarea
                  rows={5}
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  placeholder="Capture anything useful from the intro…"
                />
              </div>
            </>
          )}

          {slide.kind === "warmup" && (
            <>
              <h1 className="text-[28px] font-semibold tracking-tight">Warm-up</h1>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
                {study.warmupGuide || "No warm-up guide written for this study."}
              </p>
              <div className="space-y-2">
                <div className="text-sm font-medium">Optional notes</div>
                <Textarea
                  rows={5}
                  value={warmupNotes}
                  onChange={(e) => setWarmupNotes(e.target.value)}
                  placeholder="Capture warm-up observations…"
                />
              </div>
            </>
          )}

          {slide.kind === "question" && (
            <>
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {slide.section.title}
                </p>
                {slide.section.description && (
                  <p className="mt-2 whitespace-pre-wrap text-base text-muted-foreground">
                    {slide.section.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setMainCovered((prev) => ({
                    ...prev,
                    [slide.question.id]: !prev[slide.question.id],
                  }))
                }
                className="flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border",
                    mainCovered[slide.question.id]
                      ? "border-success bg-success text-white"
                      : "border-muted-foreground/40 text-transparent",
                  )}
                >
                  <Check className="size-4" />
                </span>
                <h1 className="text-[28px] font-semibold tracking-tight">
                  {slide.question.questionText}
                </h1>
              </button>

              {slide.question.subQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Sub-questions
                  </div>
                  <ul className="space-y-2">
                    {slide.question.subQuestions.map((subQuestion, subIndex) => {
                      const covered =
                        subCovered[slide.question.id]?.[subIndex] ?? false;
                      return (
                        <li key={`${slide.question.id}-${subIndex}`}>
                          <button
                            type="button"
                            onClick={() =>
                              setSubCovered((prev) => {
                                const current =
                                  prev[slide.question.id] ??
                                  slide.question.subQuestions.map(() => false);
                                const next = [...current];
                                next[subIndex] = !next[subIndex];
                                return {
                                  ...prev,
                                  [slide.question.id]: next,
                                };
                              })
                            }
                            className="flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                                covered
                                  ? "border-success bg-success text-white"
                                  : "border-muted-foreground/40 text-transparent",
                              )}
                            >
                              <Check className="size-3.5" />
                            </span>
                            <span className="text-base leading-relaxed">
                              {subQuestion}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {slide.question.moderatorNotes && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="mb-1 text-sm font-medium">Moderator notes</div>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {slide.question.moderatorNotes}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-sm font-medium">Participant response</div>
                <Textarea
                  rows={6}
                  value={responses[slide.question.id] ?? ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [slide.question.id]: e.target.value,
                    }))
                  }
                  placeholder="Optional — capture quotes, themes, and answers…"
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={slideIndex === 0 || pending}
            onClick={() => setSlideIndex((i) => i - 1)}
          >
            <ArrowLeft className="size-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/studies/${study.id}`)}
            disabled={pending}
          >
            Exit
          </Button>
          {slideIndex < slides.length - 1 ? (
            <Button
              type="button"
              onClick={() => setSlideIndex((i) => i + 1)}
              disabled={pending}
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={finish} disabled={pending}>
              <Check className="size-4" />
              {pending ? "Saving…" : "Finish & save"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
