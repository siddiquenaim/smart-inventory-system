"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFormDialog } from "@/components/categories/category-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CategoryInput } from "@/lib/validations/category";
import { Pencil, Plus, Trash } from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string;
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"add" | "edit" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalError, setModalError] = useState<ModalError>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        const message = await getResponseError(response);
        setCategories([]);
        setGlobalError(message);
        return;
      }
      const payload = (await response.json()) as Category[];
      setCategories(payload);
    } catch (error) {
      setCategories([]);
      setGlobalError(createErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCategory(null);
    setModalError(null);
  };

  const handleAddCategory = async (input: CategoryInput) => {
    setIsSaving(true);
    setModalError(null);
    closeModal();
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        toast.error(await getResponseError(response));
        return;
      }
      await fetchCategories();
      toast.success("Category created.");
    } catch (error) {
      toast.error(createErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCategory = async (input: CategoryInput) => {
    if (!selectedCategory) {
      setModalError({ mode: "edit", message: "Unable to find category to update." });
      return;
    }
    const categoryId = selectedCategory.id;
    setIsSaving(true);
    setModalError(null);
    closeModal();
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        toast.error(await getResponseError(response));
        return;
      }
      await fetchCategories();
      toast.success("Category updated.");
    } catch (error) {
      toast.error(createErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) {
      return;
    }
    const categoryId = deleteTarget.id;
    setDeleteTarget(null);
    setIsDeleting(true);
    setGlobalError(null);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const message = await getResponseError(response);
        toast.error(message);
        return;
      }
      await fetchCategories();
      toast.success("Category deleted.");
    } catch (error) {
      toast.error(createErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setModalError(null);
    setActiveModal("edit");
  };

  const categoriesMemo = useMemo(() => categories, [categories]);

  return (
    <main className="space-y-6 pb-8">
      <Card className="border border-border/70 bg-card/80">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Categories</CardTitle>
            <CardDescription>Organize your inventory with reusable labels.</CardDescription>
          </div>
          <CardAction>
            <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
              {categories.length} total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground sm:max-w-xl">
            Categories group products so you can report on them, manage stock, and prioritize restock
            efforts.
          </p>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full px-4 text-sm"
            onClick={() => {
              setActiveModal("add");
              setModalError(null);
            }}
          >
            <Plus className="size-4" />
            Add category
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
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-32 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48 rounded" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-32 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : categoriesMemo.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No categories yet. Start by adding your first one.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                categoriesMemo.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="space-y-1">
                      <div className="text-foreground">{category.name}</div>
                      <p className="text-xs text-muted-foreground">{category.id}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleEditClick(category)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-destructive"
                          onClick={() => setDeleteTarget(category)}
                          disabled={isDeleting}
                        >
                          <Trash className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={activeModal === "add"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeModal();
          }
        }}
        title="Create new category"
        description="Categories help you tag products and organize stock reporting."
        submitLabel="Create category"
        loading={isSaving && activeModal === "add"}
        onSubmit={handleAddCategory}
        error={modalError?.mode === "add" ? modalError.message : null}
      />

      <CategoryFormDialog
        open={activeModal === "edit"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeModal();
          }
        }}
        title="Edit category"
        submitLabel="Update category"
        loading={isSaving && activeModal === "edit"}
        onSubmit={handleEditCategory}
        error={modalError?.mode === "edit" ? modalError.message : null}
        defaultValues={
          selectedCategory
            ? {
                name: selectedCategory.name,
                description: selectedCategory.description,
              }
            : undefined
        }
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
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              This action removes the category from the system including any
              products that reference it. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? This cannot be undone.
            </p>
            {globalError && (
              <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {globalError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCategory}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

