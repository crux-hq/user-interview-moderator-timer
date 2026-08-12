/** Split bulk textarea input into one sub-question per non-empty line. */
export function parseSubQuestions(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Join stored sub-questions back into a bulk-editable textarea value. */
export function formatSubQuestions(items: string[]): string {
  return items.join("\n");
}
