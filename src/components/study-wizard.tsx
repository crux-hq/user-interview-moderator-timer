"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createStudy,
  updateStudy,
  type QuestionInput,
  type SectionInput,
  type StudyInput,
} from "@/lib/actions";

type Props = {
  mode: "create" | "edit";
  studyId?: string;
  initial?: StudyInput;
};

const emptyQuestion = (): QuestionInput => ({
  questionText: "",
  moderatorNotes: "",
  subQuestions: "",
});

const emptySection = (): SectionInput => ({
  title: "",
  description: "",
  durationMinutes: 5,
  questions: [emptyQuestion()],
});

function isSectionComplete(section: SectionInput) {
  return (
    Boolean(section.title.trim()) &&
    section.questions.length > 0 &&
    section.questions.every((q) => q.questionText.trim())
  );
}

const defaultInitial: StudyInput = {
  clientName: "",
  studyName: "",
  sessionDurationMinutes: 60,
  contextGuide: "",
  warmupGuide: "",
  sections: [emptySection()],
};

export function StudyWizard({ mode, studyId, initial = defaultInitial }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StudyInput>(initial);
  const [collapsed, setCollapsed] = useState<boolean[]>(
    () => initial.sections.map((section) => isSectionComplete(section)),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateSection(index: number, patch: Partial<SectionInput>) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, ...patch } : section,
      ),
    }));
  }

  function updateQuestion(
    sectionIndex: number,
    questionIndex: number,
    patch: Partial<QuestionInput>,
  ) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, j) =>
            j === questionIndex ? { ...question, ...patch } : question,
          ),
        };
      }),
    }));
  }

  function validateStep() {
    if (step === 1) {
      if (!form.clientName.trim() || !form.studyName.trim()) {
        setError("Client name and study name are required.");
        return false;
      }
      if (!form.sessionDurationMinutes || form.sessionDurationMinutes < 1) {
        setError("Session duration must be at least 1 minute.");
        return false;
      }
    }
    if (step === 3) {
      if (form.sections.length === 0) {
        setError("Add at least one section.");
        return false;
      }
      if (form.sections.some((s) => !s.title.trim())) {
        setError("Each section needs a heading.");
        return false;
      }
      if (form.sections.some((s) => s.questions.length === 0)) {
        setError("Each section needs at least one question.");
        return false;
      }
      if (
        form.sections.some((s) =>
          s.questions.some((q) => !q.questionText.trim()),
        )
      ) {
        setError("Each question needs question text.");
        return false;
      }
    }
    setError(null);
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(3, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function save() {
    if (!validateStep()) return;
    startTransition(async () => {
      try {
        if (mode === "edit" && studyId) {
          await updateStudy(studyId, form);
        } else {
          await createStudy(form);
        }
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "digest" in e &&
          String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        setError(e instanceof Error ? e.message : "Failed to save study.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6" crux-attr="ex-860922">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={step === 1 ? "font-medium text-foreground" : ""}>
          1. Basics
        </span>
        <span>/</span>
        <span className={step === 2 ? "font-medium text-foreground" : ""}>
          2. Guides
        </span>
        <span>/</span>
        <span className={step === 3 ? "font-medium text-foreground" : ""}>
          3. Sections
        </span>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Study basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clientName: e.target.value }))
                }
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studyName">Study name</Label>
              <Input
                id="studyName"
                value={form.studyName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, studyName: e.target.value }))
                }
                placeholder="Checkout usability interviews"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Max session duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.sessionDurationMinutes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sessionDurationMinutes: Number(e.target.value),
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Context & warm-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contextGuide">Context-setting guide</Label>
              <Textarea
                id="contextGuide"
                rows={6}
                value={form.contextGuide}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, contextGuide: e.target.value }))
                }
                placeholder="What the participant should know before you begin…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warmupGuide">Warm-up guide</Label>
              <Textarea
                id="warmupGuide"
                rows={6}
                value={form.warmupGuide}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, warmupGuide: e.target.value }))
                }
                placeholder="Ice-breakers and easy opening prompts…"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCollapsed(form.sections.map(() => false))
              }
            >
              Expand all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCollapsed(form.sections.map(() => true))
              }
            >
              Collapse all
            </Button>
          </div>
          {form.sections.map((section, sectionIndex) => {
            const isCollapsed = collapsed[sectionIndex] ?? false;
            return (
            <Card key={sectionIndex}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() =>
                    setCollapsed((prev) =>
                      form.sections.map((_, i) =>
                        i === sectionIndex
                          ? !(prev[i] ?? false)
                          : (prev[i] ?? false),
                      ),
                    )
                  }
                >
                  {isCollapsed ? (
                    <ChevronRight className="size-4 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0" />
                  )}
                  <CardTitle className="truncate text-base">
                    Section {sectionIndex + 1}
                    {section.title ? `: ${section.title}` : ""}
                  </CardTitle>
                  {isCollapsed && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {section.questions.length} question
                      {section.questions.length === 1 ? "" : "s"}
                      {isSectionComplete(section) ? " · complete" : ""}
                    </span>
                  )}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={form.sections.length === 1}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      sections: prev.sections.filter((_, i) => i !== sectionIndex),
                    }));
                    setCollapsed((prev) =>
                      prev.filter((_, i) => i !== sectionIndex),
                    );
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              {!isCollapsed && (
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <div className="space-y-2">
                    <Label>Section heading</Label>
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateSection(sectionIndex, { title: e.target.value })
                      }
                      placeholder="4.2 The last pair: retrospective walkthrough"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={section.durationMinutes}
                      onChange={(e) =>
                        updateSection(sectionIndex, {
                          durationMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Section description (optional)</Label>
                  <Textarea
                    rows={2}
                    value={section.description}
                    onChange={(e) =>
                      updateSection(sectionIndex, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief framing for this part of the interview…"
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="text-sm font-medium">Questions</div>
                  {section.questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="space-y-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Question {questionIndex + 1}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={section.questions.length === 1}
                          onClick={() =>
                            updateSection(sectionIndex, {
                              questions: section.questions.filter(
                                (_, i) => i !== questionIndex,
                              ),
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Textarea
                          rows={2}
                          value={question.questionText}
                          onChange={(e) =>
                            updateQuestion(sectionIndex, questionIndex, {
                              questionText: e.target.value,
                            })
                          }
                          placeholder="Main question for the participant…"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sub-questions (optional)</Label>
                        <Textarea
                          rows={5}
                          value={question.subQuestions}
                          onChange={(e) =>
                            updateQuestion(sectionIndex, questionIndex, {
                              subQuestions: e.target.value,
                            })
                          }
                          placeholder={
                            "One sub-question per line…\nWhat happened next?\nHow did that feel?"
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Paste or type multiple lines — each line becomes its
                          own sub-question.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Moderator notes (optional)</Label>
                        <Textarea
                          rows={2}
                          value={question.moderatorNotes}
                          onChange={(e) =>
                            updateQuestion(sectionIndex, questionIndex, {
                              moderatorNotes: e.target.value,
                            })
                          }
                          placeholder="Private cues for the moderator…"
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSection(sectionIndex, {
                        questions: [...section.questions, emptyQuestion()],
                      })
                    }
                  >
                    <Plus className="size-4" />
                    Add question
                  </Button>
                </div>
              </CardContent>
              )}
            </Card>
            );
          })}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCollapsed((prev) => [
                ...form.sections.map((section, i) =>
                  isSectionComplete(section) ? true : (prev[i] ?? false),
                ),
                false,
              ]);
              setForm((prev) => ({
                ...prev,
                sections: [...prev.sections, emptySection()],
              }));
            }}
          >
            <Plus className="size-4" />
            Add section
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={step === 1 || pending}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={next}>
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={save} disabled={pending}>
            {pending
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create study"}
          </Button>
        )}
      </div>
    </div>
  );
}
