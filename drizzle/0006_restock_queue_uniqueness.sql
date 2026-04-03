DELETE FROM "restock_queue" a
USING "restock_queue" b
WHERE a."product_id" = b."product_id"
  AND a."requested_at" > b."requested_at";--> statement-breakpoint

DELETE FROM "restock_queue" a
USING "restock_queue" b
WHERE a."product_id" = b."product_id"
  AND a."requested_at" = b."requested_at"
  AND a."id" > b."id";--> statement-breakpoint

CREATE UNIQUE INDEX "restock_queue_product_id_unique"
  ON "restock_queue" USING btree ("product_id");
