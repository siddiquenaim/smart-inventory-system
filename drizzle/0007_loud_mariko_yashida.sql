ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'active'::text;--> statement-breakpoint
DROP TYPE "public"."product_status";--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'out_of_stock');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."product_status";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE "public"."product_status" USING "status"::"public"."product_status";--> statement-breakpoint
CREATE UNIQUE INDEX "restock_queue_product_id_unique" ON "restock_queue" USING btree ("product_id");