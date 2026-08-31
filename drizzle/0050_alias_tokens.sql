CREATE TABLE IF NOT EXISTS "alias_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"redeemed_by" text,
	"granted_alias" text,
	"redeemed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alias_tokens_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alias_tokens" ADD CONSTRAINT "alias_tokens_redeemed_by_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
