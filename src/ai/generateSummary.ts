export function generateSummary(text: string): string {
  // Very simple v1 summary:
  // Take the first 3 non-empty paragraphs
  const paragraphs = text
    .split("\n")
    .map(p => p.trim())
    .filter(Boolean);

  return paragraphs.slice(0, 3).join("\n\n");
}
