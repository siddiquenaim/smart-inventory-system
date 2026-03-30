"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CategoryInput,
  categorySchema,
} from "@/lib/validations/category";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryInput) => Promise<void>;
  title: string;
  description?: string;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  defaultValues?: CategoryInput;
};

const emptyFormValue: CategoryInput = {
  name: "",
  description: "",
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitLabel,
  loading,
  error,
  defaultValues,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? emptyFormValue,
  });

  useEffect(() => {
    form.reset(defaultValues ?? emptyFormValue);
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset(defaultValues ?? emptyFormValue);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-1">
          <div className="text-lg font-semibold text-foreground">{title}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-sm">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              placeholder="Beverages"
              autoComplete="off"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
              placeholder="Beverages, mocktails, and mixers"
              autoComplete="off"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <DialogFooter className="justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
