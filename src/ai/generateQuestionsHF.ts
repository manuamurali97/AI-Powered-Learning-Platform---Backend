import { hf } from "./hfClient";

export async function generateQuestionsHF(
  text: string
): Promise<string[]> {
  const truncated = text.slice(0, 2000);

  try {
    const prompt = `
Generate 3 to 5 thoughtful study questions based on the following text:

${truncated}
`;

    const result = await hf.textGeneration({
      model: "google/flan-t5-base",
      inputs: prompt,
      parameters: {
        max_new_tokens: 256,
        temperature: 0.5,
      },
    });

    const questions = result.generated_text
      .split("\n")
      .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(q => q.length > 10)
      .map(q => (q.endsWith("?") ? q : q + "?"))
      .slice(0, 5);

    // If model returns garbage or empty output
    if (questions.length === 0) {
      throw new Error("Empty question list from LLM");
    }

    return questions;
  } catch (error) {
    console.warn("⚠️ LLM question generation failed, using fallback", error);

    // ✅ Fallback questions (deterministic, safe)
    return [
      "What is the main topic of this document?",
      "What problem does the document aim to solve?",
      "What are the key ideas discussed in the text?",
    ];
  }
}
