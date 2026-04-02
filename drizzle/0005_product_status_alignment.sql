ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
UPDATE "products" SET "status" = 'out_of_stock' WHERE "status" IN ('draft', 'archived');--> statement-breakpoint
UPDATE "products" SET "status" = 'active' WHERE "status" NOT IN ('active', 'out_of_stock');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "public"."product_status";--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'out_of_stock');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."product_status";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE "public"."product_status" USING "status"::"public"."product_status";
