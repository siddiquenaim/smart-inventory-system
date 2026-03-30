import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters."),
  description: z.string().trim().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
