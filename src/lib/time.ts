export function formatCountdown(totalSeconds: number) {
  const negative = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const body =
    hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  return negative ? `-${body}` : body;
}

export function timerTone(remainingSeconds: number, totalSeconds: number) {
  if (remainingSeconds < 0) return "overtime";
  if (remainingSeconds <= Math.max(30, totalSeconds * 0.1)) return "danger";
  if (remainingSeconds <= Math.max(60, totalSeconds * 0.25)) return "warn";
  return "ok";
}
