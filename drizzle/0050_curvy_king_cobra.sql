CREATE TYPE "public"."gift_reward" AS ENUM('badge', 'premium', 'alias_token');--> statement-breakpoint
CREATE TYPE "public"."gift_status" AS ENUM('active', 'claimed', 'revoked');--> statement-breakpoint
ALTER TYPE "public"."action" ADD VALUE 'password_reset';--> statement-breakpoint
ALTER TYPE "public"."action" ADD VALUE 'username_ban';--> statement-breakpoint
ALTER TYPE "public"."action" ADD VALUE 'username_unban';--> statement-breakpoint
ALTER TYPE "public"."action" ADD VALUE 'gift_create';--> statement-breakpoint
ALTER TYPE "public"."action" ADD VALUE 'gift_revoke';--> statement-breakpoint
CREATE TABLE "alias_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"redeemed_by" text,
	"granted_alias" text,
	"redeemed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alias_tokens_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "username_bans" (
	"id" text PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"reason" text,
	"bannedBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "username_bans_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "gifts" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"rewardType" "gift_reward" NOT NULL,
	"rewardValue" text,
	"message" text,
	"createdBy" text NOT NULL,
	"status" "gift_status" DEFAULT 'active' NOT NULL,
	"claimedBy" text,
	"claimedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gifts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "alias_tokens" ADD CONSTRAINT "alias_tokens_redeemed_by_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "username_bans" ADD CONSTRAINT "username_bans_bannedBy_users_id_fk" FOREIGN KEY ("bannedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_claimedBy_users_id_fk" FOREIGN KEY ("claimedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;