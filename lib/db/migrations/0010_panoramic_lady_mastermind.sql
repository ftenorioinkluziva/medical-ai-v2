ALTER TABLE "health_agents" ADD COLUMN "allowed_authors" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "allowed_subcategories" json DEFAULT '[]'::json;