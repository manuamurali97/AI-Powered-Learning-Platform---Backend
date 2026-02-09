import { hf } from "./hfClient";

export async function generateSummaryHF(text: string): Promise<string> {
  // HF models have input limits → keep it safe
  const truncated = text.slice(0, 3000);

  const result = await hf.summarization({
    model: "facebook/bart-large-cnn",
    inputs: truncated,
  });

  return result.summary_text;
}
