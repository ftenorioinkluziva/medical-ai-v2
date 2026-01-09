ALTER TABLE "health_agents" 
ADD COLUMN IF NOT EXISTS "context_config" jsonb 
DEFAULT '{"includeMedicalProfile": true, "includeDocuments": true, "includeStructuredData": true, "includeRagContext": true, "includePreviousAnalysis": true}';
