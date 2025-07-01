"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string | number; // Role might be a number (enum value) or string if configured
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    setUserAndToken: (userData: User | null, token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start true

    const loginAndRefetchCart = (newToken: string, userData: User, fetchCart: () => void) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        fetchCart(); // Fetch cart after user is set
    };

    const logoutAndClearCart = (clearCart: () => void) => {
        const currentToken = localStorage.getItem('authToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        clearCart(); // Clear cart on logout

        if (currentToken) {
             fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${currentToken}` }
             }).catch(err => console.warn("Backend logout call failed:", err));
        }
    };

    useEffect(() => {
        const attemptAutoLogin = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                try {
                    // Optional: Verify token with backend /me endpoint
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    });
                    if (response.ok) {
                        const userData: User = await response.json(); // Expect camelCase from /me endpoint too
                        setToken(storedToken);
                        setUser(userData);
                        localStorage.setItem('authUser', JSON.stringify(userData)); // Update stored user
                    } else {
                        // Token is invalid or expired
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('authUser');
                    }
                } catch (error) {
                    console.error("Auto-login failed:", error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                }
            }
            setIsLoading(false);
        };
        attemptAutoLogin();
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        // After login, the cart will be fetched automatically by CartProvider's useEffect
    };

    const logout = () => {
        const currentToken = localStorage.getItem('authToken'); // Get token before removing
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);

        if (currentToken) {
             fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${currentToken}` }
             }).catch(err => console.warn("Backend logout call failed:", err));
        }
    };

    const setUserAndToken = (userData: User | null, newToken: string | null) => {
        if (userData && newToken) {
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
        }
    };


    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUserAndToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};