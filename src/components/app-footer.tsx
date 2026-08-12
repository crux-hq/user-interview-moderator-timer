const DONATE_URL =
  "https://checkout.revolut.com/pay/2fb0703d-8aff-4765-8be1-f2603cc89591";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t" crux-attr="ex-954028">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-3 text-xs text-muted-foreground">
        <span>Interview Moderator Timer</span>
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          Donate a beer for Si
        </a>
      </div>
    </footer>
  );
}
