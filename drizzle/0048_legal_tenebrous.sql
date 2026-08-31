CREATE TYPE "public"."meta_size" AS ENUM('Large', 'Small');--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "meta_image" text;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "meta_color" text;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "meta_size" "meta_size" DEFAULT 'Large' NOT NULL;