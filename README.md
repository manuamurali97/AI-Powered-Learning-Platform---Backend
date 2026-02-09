This repository contains the backend implementation of an AI-poered document learning platform.
The system ingests documents, process them asynchrously, and generate learning artifacts such as summaries and study questions.

# Features
- Document Upload (PDF)
- Text Extraction from documents
- Async Job processing in background
- Automatic Summary generation
- Automatic study question generation
- Retry and Failure logic
- Pluggable LLM support (Open AI/Hugging Face)
- Persisted storage with relational schema (PostgreSQL)
- Clean REST APIs for frontend

# Architecture Overview
- Follows a pipeline-based architecture
- Upload API stores the document and metadata
- Processing jobs are created for each document : EXTRACT_TEXT, GENERATE_SUMMARY, GENERATE_QUESTIONS
- Backgound worked processes jobs in async way
- Document status
- Results stored and exposed via APIs

# Tech Stack
- Node.js + TypeScript
- Express - REST APIs
- Prisma ORM
- PostgreSQL
- Multer - file uploads
- pdf-parse
- Hugging Face interface (free tier)
- OpenAI API (optional/interchangable)
  
