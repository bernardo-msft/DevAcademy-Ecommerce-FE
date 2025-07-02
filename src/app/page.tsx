"use client";

import { useState, useEffect, Suspense, MouseEvent as ReactMouseEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, searchProducts, getCategories } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { CategoryList } from "@/components/categories/CategoryList";
import { useCart } from "@/contexts/CartContext";

interface Product {
    id: number;
    name: string;
    price: number;
    categoryName: string;
    stockQuantity: number;
    imageUrl?: string | null;
}

interface Category {
    id: number;
    name: string;
}

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const { addToCart, isLoading: isCartLoading } = useCart();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("Our Products");

    const handleAddToCart = (e: ReactMouseEvent<HTMLButtonElement>, productId: number) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(productId.toString(), 1);
    };

    useEffect(() => {
        const fetchProductsAndTitle = async () => {
            try {
                setIsLoading(true);
                setError(null);
                let data;
                let pageTitle = "Our Products";

                if (searchQuery) {
                    data = await searchProducts(searchQuery, categoryId);
                    pageTitle = `Search results for "${searchQuery}"`;
                } else {
                    data = await getProducts(categoryId);
                }

                if (categoryId) {
                    const categories: Category[] = await getCategories();
                    const category = categories.find(c => c.id === parseInt(categoryId));
                    if (category) {
                        if (searchQuery) {
                            pageTitle += ` in ${category.name}`;
                        } else {
                            pageTitle = `Products in ${category.name}`;
                        }
                    }
                }
                
                setTitle(pageTitle);
                setProducts(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch products.");
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductsAndTitle();
    }, [searchQuery, categoryId]);

    const handleSelectCategory = (selectedCategoryId: number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedCategoryId !== null) {
            params.set('categoryId', String(selectedCategoryId));
        } else {
            params.delete('categoryId');
        }
        router.push(`/?${params.toString()}`);
    };

    if (isLoading) {
        return <div className="container mx-auto py-10 text-center">Loading products...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-10 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-24 sm:py-32">
            <CategoryList 
                onSelectCategory={handleSelectCategory}
                selectedCategoryId={categoryId ? parseInt(categoryId, 10) : null}
            />
            <h1 className="text-3xl font-bold tracking-tight mb-8">{title}</h1>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="flex">
                            <Card className="flex flex-col w-full hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle>{product.name}</CardTitle>
                                    <CardDescription>{product.categoryName}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="bg-muted w-full h-40 rounded-md mb-4 flex items-center justify-center">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" />
                                            ) : (
                                                <span className="text-muted-foreground">No Image</span>
                                            )}
                                        </div>
                                        <p className="text-xl font-semibold mb-4">${product.price.toFixed(2)}</p>
                                    </div>
                                    <Button 
                                        className="w-full mt-auto" 
                                        onClick={(e) => handleAddToCart(e, product.id)}
                                        disabled={isCartLoading || product.stockQuantity === 0}
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        {isCartLoading ? 'Adding...' : (product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No products found.</p>
                </div>
            )}
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-10 text-center">Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}