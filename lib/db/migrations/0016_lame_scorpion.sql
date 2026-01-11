CREATE TABLE "knowledge_update_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid,
	"article_title" varchar(500),
	"suggestion_type" varchar(50) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_slug" varchar(100),
	"target_id" uuid,
	"suggested_data" jsonb NOT NULL,
	"current_data" jsonb,
	"ai_confidence" varchar(10) NOT NULL,
	"ai_reasoning" text,
	"extraction_metadata" jsonb,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"is_conflict" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"applied_by" uuid,
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suggestion_id" uuid,
	"action" varchar(50) NOT NULL,
	"target_type" varchar(50),
	"target_slug" varchar(100),
	"target_id" uuid,
	"changes" jsonb,
	"performed_by" uuid,
	"source_article_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "health_agents" ALTER COLUMN "analysis_order" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "health_agents" ALTER COLUMN "product_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "health_agents" ALTER COLUMN "output_schema" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "health_agents" ALTER COLUMN "rag_config" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "health_agents" ALTER COLUMN "execution_order" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "display_config" jsonb;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "context_config" jsonb DEFAULT '{"includeMedicalProfile":true,"includeDocuments":true,"includeStructuredData":true,"includeRagContext":true,"includePreviousAnalysis":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "synthesis" json;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD COLUMN "last_analyzed_at" timestamp;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD COLUMN "analysis_version" varchar(50);--> statement-breakpoint
ALTER TABLE "biomarkers_reference" ADD COLUMN "last_synced_from" uuid;--> statement-breakpoint
ALTER TABLE "biomarkers_reference" ADD COLUMN "sync_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "protocols" ADD COLUMN "last_synced_from" uuid;--> statement-breakpoint
ALTER TABLE "protocols" ADD COLUMN "sync_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "knowledge_update_suggestions" ADD CONSTRAINT "knowledge_update_suggestions_article_id_knowledge_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."knowledge_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_update_suggestions" ADD CONSTRAINT "knowledge_update_suggestions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_update_suggestions" ADD CONSTRAINT "knowledge_update_suggestions_applied_by_users_id_fk" FOREIGN KEY ("applied_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_audit_log" ADD CONSTRAINT "sync_audit_log_suggestion_id_knowledge_update_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."knowledge_update_suggestions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_audit_log" ADD CONSTRAINT "sync_audit_log_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_audit_log" ADD CONSTRAINT "sync_audit_log_source_article_id_knowledge_articles_id_fk" FOREIGN KEY ("source_article_id") REFERENCES "public"."knowledge_articles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biomarkers_reference" ADD CONSTRAINT "biomarkers_reference_last_synced_from_knowledge_articles_id_fk" FOREIGN KEY ("last_synced_from") REFERENCES "public"."knowledge_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_last_synced_from_knowledge_articles_id_fk" FOREIGN KEY ("last_synced_from") REFERENCES "public"."knowledge_articles"("id") ON DELETE no action ON UPDATE no action;