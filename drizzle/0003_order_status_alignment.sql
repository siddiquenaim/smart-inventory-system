DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'processing'
  ) THEN
    ALTER TYPE "public"."order_status" RENAME VALUE 'processing' TO 'confirmed';
  END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'completed'
  ) THEN
    ALTER TYPE "public"."order_status" RENAME VALUE 'completed' TO 'delivered';
  END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'canceled'
  ) THEN
    ALTER TYPE "public"."order_status" RENAME VALUE 'canceled' TO 'cancelled';
  END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'shipped'
  ) THEN
    ALTER TYPE "public"."order_status" ADD VALUE 'shipped' AFTER 'confirmed';
  END IF;
END $$;
