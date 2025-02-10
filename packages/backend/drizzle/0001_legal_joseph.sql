CREATE TABLE "schedule" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe" text NOT NULL,
	"date" date NOT NULL,
	"sort" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;