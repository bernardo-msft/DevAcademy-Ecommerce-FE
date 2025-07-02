"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { logoutUserApi } from "@/services/api";
import { ShoppingCart, Package, Info, Mountain, LayoutGrid, ShieldCheck, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../theme-toggle";
import { toast } from "sonner";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";

export function Navbar() {
  const { user, logout, token, isLoading } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
      if (token) {
          try {
              await logoutUserApi(token); // Call backend logout
          } catch (error) {
              // Error is already logged in api.ts, client-side logout will proceed
          }
      }
      logout(); // Clears local token and user
      toast("You have been logged out.");
      router.push("/login");
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', searchQuery.trim());
      router.push(`/?${params.toString()}`);
      setSearchQuery(""); // Clear the input field after search
    }
  };

  if (isLoading) {
        return (
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold text-primary">
                        Ecommerce
                    </Link>
                    <div>Loading...</div>
                </div>
            </nav>
        );
    }

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-6xl">
      <div className="bg-card border rounded-full shadow-xl">
        <div className="flex h-16 items-center px-6">
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Mountain className="h-6 w-6" />
              <span className="hidden sm:inline-block">Ecommerce</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>
          </nav>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="relative">
                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                      <Link href="/cart">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                      </Link>
                    </Button>
                    {itemCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  {user.role === "Admin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="rounded-full cursor-pointer">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          <span>Manage</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/admin/products">Products</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/categories">Categories</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/orders">Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/reports">Reports</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full cursor-pointer">
                        <User className="h-5 w-5" />
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                      <Link href="/cart">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                      </Link>
                    </Button>
                    {itemCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </>
              )}
              < ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}