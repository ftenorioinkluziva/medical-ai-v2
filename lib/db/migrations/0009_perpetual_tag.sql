CREATE TABLE "complete_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_ids" jsonb NOT NULL,
	"integrative_analysis_id" uuid,
	"nutrition_analysis_id" uuid,
	"exercise_analysis_id" uuid,
	"synthesis" jsonb,
	"recommendations_id" uuid,
	"weekly_plan_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "complete_analyses" ADD CONSTRAINT "complete_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complete_analyses" ADD CONSTRAINT "complete_analyses_integrative_analysis_id_analyses_id_fk" FOREIGN KEY ("integrative_analysis_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complete_analyses" ADD CONSTRAINT "complete_analyses_nutrition_analysis_id_analyses_id_fk" FOREIGN KEY ("nutrition_analysis_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complete_analyses" ADD CONSTRAINT "complete_analyses_exercise_analysis_id_analyses_id_fk" FOREIGN KEY ("exercise_analysis_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complete_analyses" ADD CONSTRAINT "complete_analyses_recommendations_id_recommendations_id_fk" FOREIGN KEY ("recommendations_id") REFERENCES "public"."recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complete_analyses" ADD CONSTRAINT "complete_analyses_weekly_plan_id_weekly_plans_id_fk" FOREIGN KEY ("weekly_plan_id") REFERENCES "public"."weekly_plans"("id") ON DELETE cascade ON UPDATE no action;