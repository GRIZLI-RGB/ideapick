CREATE TABLE "catalog_idea" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"issued_to_user_id" text,
	"issued_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_idea_title_unique" UNIQUE("title")
);
--> statement-breakpoint
ALTER TABLE "catalog_idea" ADD CONSTRAINT "catalog_idea_issued_to_user_id_user_id_fk" FOREIGN KEY ("issued_to_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalog_idea_issued_idx" ON "catalog_idea" USING btree ("issued_to_user_id","issued_at");