CREATE TABLE "claims" (
	"id" text PRIMARY KEY NOT NULL,
	"discordId" text NOT NULL,
	"letter" varchar(1) NOT NULL,
	"alias" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "claims_discordId_unique" UNIQUE("discordId"),
	CONSTRAINT "claims_letter_unique" UNIQUE("letter"),
	CONSTRAINT "claims_alias_unique" UNIQUE("alias")
);
