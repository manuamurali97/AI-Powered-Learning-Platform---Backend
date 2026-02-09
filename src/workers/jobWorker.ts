import prisma from "../db/prisma";
import { extractTextFromFile } from "../ai/extractText";
//import { generateSummary } from "../ai/generateSummary";
//import { generateQuestions } from "../ai/generateQuestions";
//import { generateSummaryLLM } from "../ai/generateSummaryLLM";
//import { generateQuestionsLLM } from "../ai/generateQuestionsLLM";

import { generateSummaryHF } from "../ai/generateSummaryHF";
import { generateQuestionsHF } from "../ai/generateQuestionsHF";



const POLL_INTERVAL_MS = 5000;

async function updateDocumentStatus(documentId: string) {
  const jobs = await prisma.processingJob.findMany({
    where: { documentId },
  });

  if (jobs.some((job) => job.status === "FAILED")) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });
    return;
  }

  if (jobs.every((job) => job.status === "COMPLETED")) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "COMPLETED" },
    });
    return;
  }

  if (jobs.some((job) => job.status === "RUNNING")) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });
  }
}

async function processNextJob() {
  const job = await prisma.processingJob.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  if (!job) {
    console.log("🟡 No pending jobs");
    return;
  }

  console.log(`⚙️ Processing job ${job.id} (${job.type})`);

  try {
    // Mark job as RUNNING
    await prisma.processingJob.update({
      where: { id: job.id },
      data: { status: "RUNNING" },
    });

    // Update document to PROCESSING
    await updateDocumentStatus(job.documentId);

    // 🔧 Simulate work (AI later)
    //await new Promise((resolve) => setTimeout(resolve, 3000));

    if (job.type === "EXTRACT_TEXT") {
  const document = await prisma.document.findUnique({
    where: { id: job.documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const text = await extractTextFromFile(document.filePath);

  await prisma.extractedText.upsert({
    where: { documentId: document.id },
    update: { content: text },
    create: {
      documentId: document.id,
      content: text,
    },
  });

  console.log(`📄 Extracted and stored ${text.length} characters`);
}

if (job.type === "GENERATE_SUMMARY") {
  const extracted = await prisma.extractedText.findUnique({
    where: { documentId: job.documentId },
  });

  if (!extracted) {
    throw new Error("Extracted text not found");
  }

  const summary = await generateSummaryHF(extracted.content);

  await prisma.summary.create({
    data: {
      documentId: job.documentId,
      content: summary,
    },
  });

  console.log(`📝 Summary generated`);
}

// New job type for generating questions
if (job.type === "GENERATE_QUESTIONS") {
  const extracted = await prisma.extractedText.findUnique({
    where: { documentId: job.documentId },
  });

  if (!extracted) {
    throw new Error("Extracted text not found");
  }

  const questions = await generateQuestionsHF(extracted.content);

  for (const content of questions) {
    await prisma.question.create({
      data: {
        documentId: job.documentId,
        content,
      },
    });
  }

  console.log(`❓ Generated ${questions.length} questions`);
}

    // Mark job as COMPLETED
    await prisma.processingJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED" },
    });

    // Update document after completion
    await updateDocumentStatus(job.documentId);

    console.log(`✅ Job ${job.id} completed`);
  } catch (error) {
    console.error(`❌ Job ${job.id} failed`, error);

    if (job.retries + 1 >= job.maxRetries) {
      await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          retries: job.retries + 1,
          error: "Max retries reached",
        },
      });

      console.log(`🛑 Job ${job.id} permanently failed`);
    } else {
      await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: "PENDING",
          retries: job.retries + 1,
          error: "Retrying job",
        },
      });

      console.log(
        `🔁 Job ${job.id} retrying (${job.retries + 1}/${job.maxRetries})`
      );
    }

    // Update document after failure / retry decision
    await updateDocumentStatus(job.documentId);
  }
}

console.log("🚀 Job worker started");

setInterval(processNextJob, POLL_INTERVAL_MS);
