import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="border-b" crux-attr="ex-056210">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Interview Moderator Timer
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/studies"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Studies
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: "sm" }), "inline-flex")}
            >
              Register for free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
