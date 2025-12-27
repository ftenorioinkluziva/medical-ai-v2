ALTER TABLE "knowledge_embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "document_date" timestamp;