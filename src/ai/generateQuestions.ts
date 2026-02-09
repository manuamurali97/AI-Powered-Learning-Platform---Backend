export function generateQuestions(text: string): string[] {
  // Very simple v1 logic:
  // Generate questions based on section structure and key ideas

  const sentences = text
    .split(".")
    .map(s => s.trim())
    .filter(s => s.length > 40);

  const questions: string[] = [];

  if (sentences.length > 0) {
    questions.push("What is the main idea of this document?");
  }

  if (sentences.some(s => s.toLowerCase().includes("architecture"))) {
    questions.push("Why is backend architecture important in modern systems?");
  }

  if (sentences.some(s => s.toLowerCase().includes("asynchronous"))) {
    questions.push("How does asynchronous processing improve scalability?");
  }

  if (sentences.some(s => s.toLowerCase().includes("state"))) {
    questions.push("Why should system state be derived instead of guessed?");
  }

  // Fallback: ensure at least 3 questions
  while (questions.length < 3 && sentences.length > 0) {
    questions.push(`What does the document explain about "${sentences[questions.length].slice(0, 30)}..."?`);
  }

  return questions.slice(0, 5);
}
