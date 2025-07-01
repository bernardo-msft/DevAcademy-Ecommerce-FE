"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCategories, deleteCategory } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddCategoryDialog } from "@/components/admin/AddCategoryDialog";
import { EditCategoryDialog } from "@/components/admin/EditCategoryDialog";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
    id: string;
    name: string;
}

export default function ManageCategoriesPage() {
    const { user, token, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = useCallback(async () => {
        if (user && user.role === 'Admin') {
            try {
                setIsLoading(true);
                const data = await getCategories();
                setCategories(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch categories.");
            } finally {
                setIsLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'Admin')) {
            router.push('/');
        }
    }, [user, isAuthLoading, router]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCategoryAdded = () => {
        setIsAddDialogOpen(false);
        fetchCategories();
    };

    const handleCategoryUpdated = () => {
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
    };

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete || !token) {
            toast.error("Cannot delete category. Missing information.");
            return;
        }
        setIsDeleting(true);
        try {
            await deleteCategory(categoryToDelete.id, token);
            toast.success(`Category "${categoryToDelete.name}" deleted successfully.`);
            setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryToDelete.id));
        } catch (err: any) {
            toast.error(err.message || "Failed to delete category.");
        } finally {
            setIsDeleting(false);
            setCategoryToDelete(null);
        }
    };

    if (isAuthLoading || !user || user.role !== 'Admin') {
        return <div className="container mx-auto py-10 text-center">Loading or authenticating...</div>;
    }

    if (isLoading && categories.length === 0) {
        return <div className="container mx-auto py-10 text-center">Loading categories...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-10 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-24 sm:py-32">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <AddCategoryDialog onCategoryAdded={handleCategoryAdded} />
                </Dialog>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditClick(category)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-red-500 focus:text-red-500">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
                setIsEditDialogOpen(isOpen);
                if (!isOpen) {
                    setSelectedCategory(null);
                }
            }}>
                <EditCategoryDialog
                    category={selectedCategory}
                    onCategoryUpdated={handleCategoryUpdated}
                />
            </Dialog>
            <AlertDialog open={!!categoryToDelete} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category
                            &quot;{categoryToDelete?.name}&quot;. Deleting a category may also affect associated products.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}