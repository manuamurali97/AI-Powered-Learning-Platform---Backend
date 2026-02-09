import fs from "fs";

const pdfParse = require("pdf-parse");

export async function extractTextFromFile(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await pdfParse(dataBuffer);
  return result.text;
}
