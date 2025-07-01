"use client";

import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { placeOrder } from "@/services/api";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { cart, isLoading, updateQuantity, removeFromCart, itemCount, clearCart } = useCart();
    const { token } = useAuth();
    const router = useRouter();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    if (isLoading) {
        return <div className="container mx-auto py-10 text-center">Loading your cart...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto py-24 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild>
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        );
    }

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        // The API removes the item if the quantity is set to 0 or less.
        if (newQuantity > 0) {
            updateQuantity(productId, newQuantity);
        } else {
            removeFromCart(productId);
        }
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            toast.error("You must be logged in to place an order.");
            router.push("/login");
            return;
        }
        setIsPlacingOrder(true);
        try {
            await placeOrder(token);
            toast.success("Order placed successfully!");
            clearCart();
            router.push("/orders");
        } catch (error: any) {
            toast.error(error.message || "Failed to place order.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Your Shopping Cart ({itemCount} items)</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {cart.items.map((item) => (
                                    <li key={item.productId} className="flex items-center p-6 space-x-6">
                                        <div className="w-24 h-24 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                                            <span className="text-muted-foreground text-xs">Product Image</span>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg">{item.productName}</h3>
                                            <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                type="number"
                                                className="w-16 h-8 text-center"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 0)}
                                                min="0"
                                            />
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.productId)}>
                                            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${cart.totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${cart.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button size="lg" className="w-full mt-6" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}