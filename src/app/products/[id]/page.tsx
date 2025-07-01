"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryName: string;
    imageUrl?: string | null;
}

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart, isLoading: isCartLoading } = useCart();

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    setIsLoading(true);
                    const data = await getProductById(id);
                    setProduct(data);
                } catch (err: any) {
                    setError(err.message || "Failed to fetch product details.");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProduct();
        }
    }, [id]);

    if (isLoading) {
        return <div className="container mx-auto py-10 text-center">Loading product details...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-10 text-center text-red-500">Error: {error}</div>;
    }

    if (!product) {
        return <div className="container mx-auto py-10 text-center">Product not found.</div>;
    }

    const handleAddToCart = () => {
        if (product) {
            addToCart(product.id.toString(), 1);
        }
    };

    return (
        <div className="container mx-auto py-12">
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
            </Link>
            <Card>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6">
                        <div className="bg-muted w-full aspect-square rounded-lg flex items-center justify-center mb-6">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <span className="text-muted-foreground">Product Image</span>
                            )}
                        </div>
                    </div>
                    <div className="p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-3xl">{product.name}</CardTitle>
                            <CardDescription className="text-lg">{product.categoryName}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <p className="text-3xl font-bold mb-4">${product.price.toFixed(2)}</p>
                            <p className="text-muted-foreground mb-6">{product.description}</p>
                            <div className="flex items-center space-x-4 mb-6">
                                <span className={`font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                </span>
                            </div>
                            <Button size="lg" className="w-full" disabled={product.stockQuantity === 0 || isCartLoading} onClick={handleAddToCart}>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {isCartLoading ? 'Adding...' : 'Add to Cart'}
                            </Button>
                        </CardContent>
                    </div>
                </div>
            </Card>
        </div>
    );
}