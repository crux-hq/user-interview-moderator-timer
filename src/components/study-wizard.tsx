"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createStudy, updateStudy, type SectionInput, type StudyInput } from "@/lib/actions";

type Props = {
  mode: "create" | "edit";
  studyId?: string;
  initial?: StudyInput;
};

const emptySection = (): SectionInput => ({
  title: "",
  mainQuestion: "",
  keyQuestions: "",
  moderatorNotes: "",
  durationMinutes: 5,
});

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
        setError("Add at least one discussion section.");
        return false;
      }
      if (form.sections.some((s) => !s.title.trim())) {
        setError("Each section needs a title.");
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
        // Next.js redirect() throws; let it through.
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
    <div className="mx-auto w-full max-w-3xl space-y-6">
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
          {form.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Section {index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={form.sections.length === 1}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      sections: prev.sections.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateSection(index, { title: e.target.value })
                      }
                      placeholder="Discovery / Pain points"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={section.durationMinutes}
                      onChange={(e) =>
                        updateSection(index, {
                          durationMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Main question</Label>
                  <Textarea
                    rows={2}
                    value={section.mainQuestion}
                    onChange={(e) =>
                      updateSection(index, { mainQuestion: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key questions</Label>
                  <Textarea
                    rows={3}
                    value={section.keyQuestions}
                    onChange={(e) =>
                      updateSection(index, { keyQuestions: e.target.value })
                    }
                    placeholder="Follow-ups and probes…"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moderator notes</Label>
                  <Textarea
                    rows={2}
                    value={section.moderatorNotes}
                    onChange={(e) =>
                      updateSection(index, { moderatorNotes: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                sections: [...prev.sections, emptySection()],
              }))
            }
          >
            <Plus className="size-4" />
            Add section
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={back} disabled={step === 1 || pending}>
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
            {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create study"}
          </Button>
        )}
      </div>
    </div>
  );
}
