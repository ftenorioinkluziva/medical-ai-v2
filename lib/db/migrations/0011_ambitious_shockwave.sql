ALTER TABLE "health_agents" ADD COLUMN "use_thinking_mode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "analysis_role" varchar(50) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "health_agents" ADD COLUMN "analysis_order" integer DEFAULT null;