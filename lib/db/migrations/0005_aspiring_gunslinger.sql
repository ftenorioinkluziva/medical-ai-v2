ALTER TABLE "health_agents" ADD COLUMN "knowledge_access_type" varchar(20) DEFAULT 'full' NOT NULL;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "allowed_categories" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "excluded_article_ids" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "included_article_ids" json DEFAULT '[]'::json;