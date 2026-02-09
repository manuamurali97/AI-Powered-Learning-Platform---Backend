import { openai } from "./llmClient";

export async function generateSummaryLLM(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You summarize documents for learning purposes. Be concise and clear.",
      },
      {
        role: "user",
        content: `Summarize the following text:\n\n${text}`,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content ?? "";
}
