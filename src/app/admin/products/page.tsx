"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { deleteProduct, getProducts } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddProductDialog } from "@/components/admin/AddProductDialog";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditProductDialog } from "@/components/admin/EditProductDialog";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    categoryName: string;
    imageUrl?: string | null;
}

export default function ManageProductsPage() {
    const { user, token, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        if (user && user.role === 'Admin') {
            try {
                setIsLoading(true);
                const data = await getProducts();
                setProducts(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch products.");
            } finally {
                setIsLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'Admin')) {
            router.push('/'); // Redirect non-admins
        }
    }, [user, isAuthLoading, router]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleProductAdded = () => {
        setIsDialogOpen(false);
        fetchProducts();
    };

    const handleProductUpdated = () => {
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
    };

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete || !token) {
            toast.error("Cannot delete product. Missing information.");
            return;
        }
        setIsDeleting(true);
        try {
            await deleteProduct(productToDelete.id, token);
            toast.success(`Product "${productToDelete.name}" deleted successfully.`);
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
        } catch (err: any) {
            toast.error(err.message || "Failed to delete product.");
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
        }
    };

    if (isAuthLoading || !user || user.role !== 'Admin') {
        return <div className="container mx-auto py-10 text-center">Loading or authenticating...</div>;
    }

    if (isLoading && products.length === 0) {
        return <div className="container mx-auto py-10 text-center">Loading products...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-10 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-24 sm:py-32">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <AddProductDialog onProductAdded={handleProductAdded} />
                </Dialog>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.categoryName}</TableCell>
                                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{product.stockQuantity}</TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-red-500 focus:text-red-500">
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
                    setSelectedProduct(null);
                }
            }}>
                <EditProductDialog
                    product={selectedProduct}
                    onProductUpdated={handleProductUpdated}
                />
            </Dialog>
            <AlertDialog open={!!productToDelete} onOpenChange={(isOpen) => !isOpen && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            &quot;{productToDelete?.name}&quot;.
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