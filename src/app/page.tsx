import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <>
      <AppHeader />
      <main
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-20"
        crux-attr="ex-437414"
      >
        <h1 className="text-4xl font-semibold tracking-tight">
          Keep time in user interviews
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Write your script. Add the people you will talk to. Run a timer while
          you talk.
        </p>
        <p className="mt-3 text-muted-foreground">Free to use.</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
          >
            Register for free
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </main>
    </>
  );
}
