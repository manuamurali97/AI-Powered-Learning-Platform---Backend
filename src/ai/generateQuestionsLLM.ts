import { openai } from "./llmClient";

export async function generateQuestionsLLM(
  text: string
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You generate study questions from educational text.",
      },
      {
        role: "user",
        content: `Generate 3 to 5 thoughtful study questions from the following text:\n\n${text}`,
      },
    ],
    temperature: 0.5,
  });

  const raw = response.choices[0].message.content ?? "";

  return raw
    .split("\n")
    .map(q => q.replace(/^\d+[\).\s]+/, "").trim())
    .filter(Boolean);
}
