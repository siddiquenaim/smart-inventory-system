"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductInput } from "@/lib/validations/product";

type CategoryOption = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string;
  status: "active" | "out_of_stock";
  stockQuantity: number;
  threshold: number;
  price: string | number;
  categoryId: string;
  categoryName: string | null;
};

type ModalError =
  | {
      mode: "add" | "edit";
      message: string;
    }
  | null;

const createErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
};

const getResponseError = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? response.statusText ?? "Unable to complete the request.";
};

const toNumber = (value: string | number) =>
  typeof value === "number" ? value : Number(value ?? 0);

const toInput = (product: Product): ProductInput => ({
  name: product.name,
  sku: product.sku,
  description: product.description ?? "",
  categoryId: product.categoryId,
  status: product.status,
  stockQuantity: product.stockQuantity,
  threshold: product.threshold,
  price: toNumber(product.price),
});

const formatCurrency = (value: string | number) => {
  const numeric = toNumber(value);
  if (Number.isNaN(numeric)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
};

const statusBadgeVariant = (status: Product["status"]) => {
  if (status === "active") {
    return "default" as const;
  }
  return "destructive" as const;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"add" | "edit" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalError, setModalError] = useState<ModalError>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    const response = await fetch("/api/products");
    if (!response.ok) {
      throw new Error(await getResponseError(response));
    }
    const payload = (await response.json()) as Product[];
    setProducts(payload);
  }, []);

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error(await getResponseError(response));
    }
    const payload = (await response.json()) as CategoryOption[];
    setCategories(payload);
  }, []);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      await Promise.all([fetchProducts(), fetchCategories()]);
    } catch (error) {
      setProducts([]);
      setCategories([]);
      setGlobalError(createErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedProduct(null);
    setModalError(null);
  };

  const handleAddProduct = async (input: ProductInput) => {
    setIsSaving(true);
    setModalError(null);
    closeModal();
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        toast.error(await getResponseError(response));
        return;
      }
      await fetchProducts();
      toast.success("Product created.");
    } catch (error) {
      toast.error(createErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = async (input: ProductInput) => {
    if (!selectedProduct) {
      setModalError({ mode: "edit", message: "Unable to find product to update." });
      return;
    }
    const productId = selectedProduct.id;
    setIsSaving(true);
    setModalError(null);
    closeModal();
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        toast.error(await getResponseError(response));
        return;
      }
      await fetchProducts();
      toast.success("Product updated.");
    } catch (error) {
      toast.error(createErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) {
      return;
    }
    const productId = deleteTarget.id;
    setDeleteTarget(null);
    setIsDeleting(true);
    setGlobalError(null);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const message = await getResponseError(response);
        toast.error(message);
        return;
      }
      await fetchProducts();
      toast.success("Product deleted.");
    } catch (error) {
      toast.error(createErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const productList = useMemo(() => products, [products]);
  const lowStockCount = useMemo(
    () => products.filter((product) => product.stockQuantity <= product.threshold).length,
    [products]
  );

  return (
    <main className="space-y-6 pb-8">
      <Card className="border border-border/70 bg-card/80">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Products</CardTitle>
            <CardDescription>Track stock, pricing, and operational status in one place.</CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
              {products.length} total
            </Badge>
            <Badge variant={lowStockCount > 0 ? "destructive" : "secondary"}>
              {lowStockCount} low stock
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground sm:max-w-2xl">
            Build your catalog with status-aware records so the team can track active items and
            products that are currently out of stock.
          </p>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full px-4 text-sm"
            onClick={() => {
              setActiveModal("add");
              setModalError(null);
            }}
            disabled={loading}
          >
            <Plus className="size-4" />
            Add product
          </Button>
        </CardContent>
      </Card>

      {globalError && (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
          {globalError}
        </div>
      )}

      <Card className="border border-border/80 bg-card/70">
        <CardContent className="px-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-40 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 rounded" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-32 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : productList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No products yet. Add your first product to start inventory tracking.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                productList.map((product) => {
                  const isLowStock = product.stockQuantity <= product.threshold;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="space-y-1">
                        <div className="font-medium text-foreground">{product.name}</div>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.categoryName ?? "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(product.status)}>
                          {product.status === "out_of_stock" ? "Out of Stock" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{product.stockQuantity}</span>
                          {isLowStock && (
                            <Badge variant="destructive" className="inline-flex items-center gap-1">
                              <AlertTriangle className="size-3.5" />
                              Low
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Threshold: {product.threshold}</p>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              setSelectedProduct(product);
                              setModalError(null);
                              setActiveModal("edit");
                            }}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-destructive"
                            onClick={() => setDeleteTarget(product)}
                            disabled={isDeleting}
                          >
                            <Trash className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductFormDialog
        open={activeModal === "add"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeModal();
          }
        }}
        title="Create new product"
        description="Provide category, status, stock, and pricing details for the item."
        submitLabel="Create product"
        loading={isSaving && activeModal === "add"}
        onSubmit={handleAddProduct}
        error={modalError?.mode === "add" ? modalError.message : null}
        categories={categories}
      />

      <ProductFormDialog
        open={activeModal === "edit"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeModal();
          }
        }}
        title="Edit product"
        submitLabel="Update product"
        loading={isSaving && activeModal === "edit"}
        onSubmit={handleEditProduct}
        error={modalError?.mode === "edit" ? modalError.message : null}
        categories={categories}
        defaultValues={selectedProduct ? toInput(selectedProduct) : undefined}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              This action removes the product from inventory tracking and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Confirm removal of{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
