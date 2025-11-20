CREATE TABLE "logical_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_ids" json NOT NULL,
	"biomarkers" json NOT NULL,
	"metrics" json NOT NULL,
	"protocols" json NOT NULL,
	"summary" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "latest_biomarkers" json;--> statement-breakpoint
ALTER TABLE "medical_profiles" ADD COLUMN "biomarkers_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "logical_analyses" ADD CONSTRAINT "logical_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;