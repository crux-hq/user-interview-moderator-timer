import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { StudyWizard } from "@/components/study-wizard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NewStudyPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10" crux-attr="ex-860922">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Create study
            </h1>
            <p className="mt-1 text-muted-foreground">
              Set up the script before adding participants.
            </p>
          </div>
          <Link
            href="/studies"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Cancel
          </Link>
        </div>
        <StudyWizard mode="create" />
      </main>
    </>
  );
}
