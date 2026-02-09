import express from "express";
import cors from "cors";
import documentsRouter from "./routes/documents";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

app.use("/documents", documentsRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});



export default app;
