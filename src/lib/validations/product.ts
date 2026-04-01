import { z } from "zod";

export const productStatusValues = ["draft", "active", "archived"] as const;

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters."),
  sku: z.string().trim().min(2, "SKU must be a valid identifier."),
  description: z.string().trim().optional(),
  categoryId: z.string().uuid("Category id must be a valid UUID."),
  status: z.enum(productStatusValues).default("active"),
  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be a whole number.")
    .min(0, "Stock quantity cannot be negative."),
  threshold: z.coerce
    .number()
    .int("Threshold must be a whole number.")
    .min(0, "Threshold cannot be negative."),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative."),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
