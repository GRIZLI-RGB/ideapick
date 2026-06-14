CREATE TABLE "anamnesis_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'paid' NOT NULL,
	"idea_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "anamnesis_session" ADD CONSTRAINT "anamnesis_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anamnesis_session" ADD CONSTRAINT "anamnesis_session_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anamnesis_session_user_idx" ON "anamnesis_session" USING btree ("user_id","status");