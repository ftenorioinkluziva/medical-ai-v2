CREATE TABLE "billing_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "billing_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "credit_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"credits" integer NOT NULL,
	"price_in_cents" integer NOT NULL,
	"stripe_price_id" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"description" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_payment_intent_id" varchar(255) NOT NULL,
	"stripe_checkout_session_id" varchar(255),
	"package_id" uuid,
	"credits_granted" integer NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"status" varchar(20) NOT NULL,
	"transaction_id" uuid,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "token_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"analysis_id" uuid,
	"operation" varchar(50) NOT NULL,
	"model_name" varchar(100) NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"cached_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer NOT NULL,
	"credits_debited" integer NOT NULL,
	"transaction_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"total_purchased" integer DEFAULT 0 NOT NULL,
	"total_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_credits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "tokens_used" integer;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "processing_time_ms" integer;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "model_used" text;--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "prompt" text;--> statement-breakpoint
ALTER TABLE "weekly_plans" ADD COLUMN "tokens_used" integer;--> statement-breakpoint
ALTER TABLE "weekly_plans" ADD COLUMN "processing_time_ms" integer;--> statement-breakpoint
ALTER TABLE "weekly_plans" ADD COLUMN "model_used" text;--> statement-breakpoint
ALTER TABLE "weekly_plans" ADD COLUMN "prompt" text;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_payments" ADD CONSTRAINT "stripe_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_payments" ADD CONSTRAINT "stripe_payments_package_id_credit_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."credit_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_payments" ADD CONSTRAINT "stripe_payments_transaction_id_credit_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."credit_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_transaction_id_credit_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."credit_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_transactions_user_id_idx" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_transactions_created_at_idx" ON "credit_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "stripe_payments_user_id_idx" ON "stripe_payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stripe_payments_status_idx" ON "stripe_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stripe_payments_payment_intent_idx" ON "stripe_payments" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "token_usage_logs_user_id_idx" ON "token_usage_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_usage_logs_analysis_id_idx" ON "token_usage_logs" USING btree ("analysis_id");--> statement-breakpoint
CREATE INDEX "token_usage_logs_created_at_idx" ON "token_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_credits_user_id_idx" ON "user_credits" USING btree ("user_id");