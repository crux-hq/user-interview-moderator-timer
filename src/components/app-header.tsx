import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/session";

export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Interview Moderator Timer
        </Link>
        {session?.user && (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  );
}
