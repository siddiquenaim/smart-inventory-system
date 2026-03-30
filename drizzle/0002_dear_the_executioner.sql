CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."restock_priority" AS ENUM('low', 'medium', 'high');