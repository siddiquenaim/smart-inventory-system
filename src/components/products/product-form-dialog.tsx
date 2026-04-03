"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  productSchema,
  type ProductFormInput,
  type ProductInput,
} from "@/lib/validations/product";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProductInput) => Promise<void>;
  title: string;
  description?: string;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  categories: CategoryOption[];
  defaultValues?: ProductFormInput;
};

const emptyFormValue: ProductFormInput = {
  name: "",
  sku: "",
  description: "",
  categoryId: "",
  status: "active",
  stockQuantity: 0,
  threshold: 0,
  price: 0,
};

export function ProductFormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitLabel,
  loading,
  error,
  categories,
  defaultValues,
}: ProductFormDialogProps) {
  const form = useForm<ProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? emptyFormValue,
  });
  const stockQuantity = useWatch({
    control: form.control,
    name: "stockQuantity",
  });
  const derivedStatus = Number(stockQuantity) <= 0 ? "out_of_stock" : "active";

  useEffect(() => {
    form.reset(defaultValues ?? emptyFormValue);
  }, [defaultValues, form]);

  useEffect(() => {
    form.setValue("status", derivedStatus, { shouldValidate: true });
  }, [derivedStatus, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      status: derivedStatus,
    });
    form.reset(defaultValues ?? emptyFormValue);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 text-sm">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                placeholder="Coffee Beans"
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
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                placeholder="COF-001"
                autoComplete="off"
                {...form.register("sku")}
              />
              {form.formState.errors.sku && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.sku.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <Label htmlFor="product-description">Description</Label>
            <Input
              id="product-description"
              placeholder="Premium blend for espresso"
              autoComplete="off"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 text-sm">
              <Label>Category</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.categoryId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <Label>Status</Label>
              <div className="flex min-h-9 items-center rounded-2xl border border-input  px-3">
                <Badge
                  variant={
                    derivedStatus === "out_of_stock" ? "destructive" : "default"
                  }
                >
                  {derivedStatus === "out_of_stock" ? "Out of Stock" : "Active"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1 text-sm">
              <Label htmlFor="product-stock-quantity">Stock Quantity</Label>
              <Input
                id="product-stock-quantity"
                type="number"
                min={0}
                {...form.register("stockQuantity", { valueAsNumber: true })}
              />
              {form.formState.errors.stockQuantity && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.stockQuantity.message}
                </p>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <Label htmlFor="product-threshold">Threshold</Label>
              <Input
                id="product-threshold"
                type="number"
                min={0}
                {...form.register("threshold", { valueAsNumber: true })}
              />
              {form.formState.errors.threshold && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.threshold.message}
                </p>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
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
              {loading ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
