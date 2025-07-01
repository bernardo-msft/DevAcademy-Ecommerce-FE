"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addItemToCart, updateItemQuantity, removeItemFromCart } from '@/services/api';
import { toast } from 'sonner';

interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
}

interface Cart {
    id: string;
    items: CartItem[];
    totalPrice: number;
}

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    itemCount: number;
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        try {
            const cartData = await getCart(token);
            setCart(cartData);
        } catch (error) {
            // It's okay if fetching a cart fails (e.g., 404 for new users)
            // We'll just start with an empty cart.
            setCart({ id: '', items: [], totalPrice: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId: string, quantity: number) => {
        try {
            const updatedCart = await addItemToCart(productId, quantity, token);
            setCart(updatedCart);
            toast.success("Item added to cart!");
        } catch (error: any) {
            toast.error(error.message || "Failed to add item to cart.");
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            const updatedCart = await updateItemQuantity(productId, quantity, token);
            setCart(updatedCart);
            toast.success("Cart updated.");
        } catch (error: any) {
            toast.error(error.message || "Failed to update cart.");
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            const updatedCart = await removeItemFromCart(productId, token);
            setCart(updatedCart);
            toast.success("Item removed from cart.");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove item.");
        }
    };
    
    const clearCart = () => {
        setCart(null);
    };

    const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return (
        <CartContext.Provider value={{ cart, isLoading, itemCount, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};