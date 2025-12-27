CREATE TABLE "biomarkers_reference" (
	"slug" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(100),
	"unit" varchar(50),
	"optimal_min" numeric(10, 2),
	"optimal_max" numeric(10, 2),
	"lab_min" numeric(10, 2),
	"lab_max" numeric(10, 2),
	"clinical_insight" text,
	"metaphor" text,
	"source_ref" varchar(200),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calculated_metrics" (
	"slug" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"formula" varchar(500) NOT NULL,
	"target_max" numeric(10, 2),
	"target_min" numeric(10, 2),
	"risk_insight" text,
	"source_ref" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_condition" varchar(500) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"dosage" varchar(200),
	"source_ref" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
