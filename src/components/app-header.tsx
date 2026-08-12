import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Interview Moderator Timer
        </Link>
      </div>
    </header>
  );
}
