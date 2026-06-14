CREATE TABLE "llm_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"idea_id" text,
	"template_key" text,
	"model" text NOT NULL,
	"status" text NOT NULL,
	"system_prompt" text DEFAULT '' NOT NULL,
	"user_prompt" text DEFAULT '' NOT NULL,
	"response_content" text DEFAULT '' NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cached_tokens" integer DEFAULT 0 NOT NULL,
	"cost_micro_usd" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"error_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_template" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"model" text DEFAULT 'deepseek-v4-pro' NOT NULL,
	"thinking" boolean DEFAULT true NOT NULL,
	"temperature" integer DEFAULT 40 NOT NULL,
	"max_tokens" integer DEFAULT 8000 NOT NULL,
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idea" ADD COLUMN "analysis_report" jsonb;--> statement-breakpoint
ALTER TABLE "idea" ADD COLUMN "analysis_status" text;--> statement-breakpoint
ALTER TABLE "llm_request" ADD CONSTRAINT "llm_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_request" ADD CONSTRAINT "llm_request_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "llm_request_created_idx" ON "llm_request" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "prompt_template_key_idx" ON "prompt_template" USING btree ("key","is_active");