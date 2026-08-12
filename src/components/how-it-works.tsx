import type { ReactNode } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Create a study",
    body: "Name the client, name the study, and set how long each interview should last.",
    mock: <CreateStudyMock />,
  },
  {
    title: "Add your content",
    body: "Write sections, questions, and moderator notes. This is the script you will follow.",
    mock: <ScriptMock />,
  },
  {
    title: "Add people",
    body: "Create a participant for each person you will talk to.",
    mock: <ParticipantsMock />,
  },
  {
    title: "Start a session",
    body: "Open the study, pick a person, and start. The timer begins when you do.",
    mock: <StartSessionMock />,
  },
  {
    title: "Tick off questions and watch the time",
    body: "Check off what you have covered. Watch time for this section next to time for the whole study.",
    mock: <LiveSessionMock />,
  },
];

function MiniWindow({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none overflow-hidden rounded-xl border bg-background shadow-sm"
    >
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="ml-1 truncate text-[11px] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function FakeField({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "rounded-md border bg-background px-2 py-1.5 text-[11px] text-foreground",
          wide && "min-h-10",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function CreateStudyMock() {
  return (
    <MiniWindow title="Create study">
      <div className="mb-2 flex gap-1 text-[10px] text-muted-foreground">
        <span className="font-medium text-foreground">1. Basics</span>
        <span>/</span>
        <span>2. Guides</span>
        <span>/</span>
        <span>3. Sections</span>
      </div>
      <div className="space-y-2 rounded-lg border p-2.5">
        <div className="text-[11px] font-medium">Study basics</div>
        <FakeField label="Client name" value="Acme Corp" />
        <FakeField label="Study name" value="Checkout interviews" />
        <FakeField label="Max session (minutes)" value="60" />
      </div>
    </MiniWindow>
  );
}

function ScriptMock() {
  return (
    <MiniWindow title="Study script">
      <div className="rounded-lg border">
        <div className="flex items-center gap-1.5 border-b px-2.5 py-2">
          <ChevronDown className="size-3 text-muted-foreground" />
          <span className="text-[11px] font-medium">
            Section 1: Last pair walkthrough
          </span>
          <span className="ml-auto rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">
            12 min
          </span>
        </div>
        <div className="space-y-2 p-2.5">
          <FakeField
            label="Question 1"
            value="Walk me through the last time you bought glasses."
          />
          <FakeField
            label="Moderator notes"
            wide
            value="Probe on price vs trust. Do not lead."
          />
        </div>
      </div>
    </MiniWindow>
  );
}

function ParticipantsMock() {
  return (
    <MiniWindow title="Participants">
      <div className="space-y-2">
        <FakeField label="Participant name" value="Jordan Lee" />
        <FakeField label="Notes (optional)" value="Recruited via UserTesting" />
        <div className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
          <Plus className="size-3" />
          Add participant
        </div>
      </div>
    </MiniWindow>
  );
}

function StartSessionMock() {
  return (
    <MiniWindow title="Study">
      <div className="overflow-hidden rounded-lg border text-[11px]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b bg-muted/40 px-2.5 py-1.5 text-[10px] text-muted-foreground">
          <span>Name</span>
          <span>Status</span>
          <span />
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b px-2.5 py-2">
          <span className="font-medium">Jordan Lee</span>
          <span className="rounded-full border px-1.5 py-0.5 text-[10px]">
            Not started
          </span>
          <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
            Start session
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-2.5 py-2 text-muted-foreground">
          <span className="font-medium text-foreground">Sam Ortiz</span>
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
            Done
          </span>
          <span className="rounded-md border px-2 py-1 text-[10px]">
            Start session
          </span>
        </div>
      </div>
    </MiniWindow>
  );
}

function CheckRow({
  done,
  text,
  large,
}: {
  done: boolean;
  text: string;
  large?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 rounded-md border px-2 py-1.5">
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-muted-foreground/40 text-transparent",
        )}
      >
        <Check className="size-2.5" />
      </span>
      <span className={cn(large ? "text-[12px] font-semibold" : "text-[11px]")}>
        {text}
      </span>
    </div>
  );
}

function LiveSessionMock() {
  return (
    <MiniWindow title="Live session">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] text-muted-foreground">
            Acme Corp · Checkout interviews
          </div>
          <div className="text-[12px] font-semibold">Jordan Lee</div>
        </div>
        <div className="flex gap-1.5">
          <div className="min-w-[72px] rounded-md border px-2 py-1">
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Overall
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums">
              42:18
            </div>
          </div>
          <div className="min-w-[72px] rounded-md border border-amber-400 bg-amber-50 px-2 py-1 text-amber-950">
            <div className="text-[9px] uppercase tracking-wide opacity-70">
              This section
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums">
              03:12
            </div>
          </div>
        </div>
      </div>
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Last pair walkthrough
      </div>
      <div className="space-y-1.5">
        <CheckRow
          done
          large
          text="Walk me through the last time you bought glasses."
        />
        <CheckRow done text="What made you trust the site?" />
        <CheckRow done={false} text="How did you pay?" />
      </div>
    </MiniWindow>
  );
}

export function HowItWorks() {
  return (
    <section className="mt-20 border-t pt-16" crux-attr="ex-709754">
      <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Five steps. Write the script once. Run it with each person.
      </p>
      <ol className="mt-10 space-y-12">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="grid items-center gap-6 md:grid-cols-2 md:gap-10"
          >
            <div className={index % 2 === 1 ? "md:order-2" : undefined}>
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
              </div>
              <p className="mt-2 pl-11 text-muted-foreground">{step.body}</p>
            </div>
            <div className={index % 2 === 1 ? "md:order-1" : undefined}>
              {step.mock}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
