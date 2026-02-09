import { Router } from "express";
import multer from "multer";
import prisma from "../db/prisma";

const router = Router();

console.log("Documents router loaded");


// Store files locally for now
const upload = multer({
  dest: "uploads/",
});

router.post("/upload", upload.single("file"), async (req, res) => {
    console.log("Received file upload request");
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

   
    //create document
    const document = await prisma.document.create({
      data: {
        title: req.file.originalname,
        filePath: req.file.path,

        user:{
          connect:{
            id:"system-user",
          }
        }
        
      },
    });

    //create processing job
     const jobs = await prisma.processingJob.createMany({
      data: [
        {
          documentId: document.id,
          type: "EXTRACT_TEXT",
        },
        {
          documentId: document.id,
          type: "GENERATE_SUMMARY",
        },
        {
          documentId: document.id,
          type: "GENERATE_QUESTIONS",
        },
      ],
    });

    return res.status(201).json({
      message: "Document uploaded and processing jobs created",
      document,
      jobsCreated: jobs.count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            type: true,
            status: true,
            retries: true,
            maxRetries: true,
            error: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

router.get("/:id/full", async (req, res) => {
  const { id } = req.params;

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        extracted: true,
        summaries: true,
        questions: true,
        jobs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

export default router;
