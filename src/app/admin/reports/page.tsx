"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getMonthlySalesReport, getPopularProductsReport, getTopCustomersReport } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, DollarSign, Users } from "lucide-react";

interface MonthlySale {
    year: number;
    month: number;
    totalSales: number;
}

interface PopularProduct {
    productId: string;
    productName: string;
    totalQuantitySold: number;
}

interface TopCustomer {
    userId: string;
    customerName: string;
    totalPurchaseAmount: number;
}

export default function ReportsPage() {
    const { user, token, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
    const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

    const [year, setYear] = useState(new Date().getFullYear());
    const [productCount, setProductCount] = useState(5);
    const [customerCount, setCustomerCount] = useState(5);

    const [isLoading, setIsLoading] = useState(true);

    const fetchAllReports = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [salesData, productsData, customersData] = await Promise.all([
                getMonthlySalesReport(year, token),
                getPopularProductsReport(productCount, token),
                getTopCustomersReport(customerCount, token)
            ]);
            setMonthlySales(salesData);
            setPopularProducts(productsData);
            setTopCustomers(customersData);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch reports.");
        } finally {
            setIsLoading(false);
        }
    }, [token, year, productCount, customerCount]);

    useEffect(() => {
        if (!isAuthLoading) {
            if (!user || user.role !== 'Admin') {
                toast.error("Access Denied");
                router.push('/');
            } else {
                fetchAllReports();
            }
        }
    }, [user, token, isAuthLoading, router, fetchAllReports]);

    const handleFetchReports = () => {
        fetchAllReports();
    };
    
    const getMonthName = (monthNumber: number) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('en-US', { month: 'long' });
    }

    if (isAuthLoading || isLoading) {
        return <div className="container mx-auto py-10 text-center">Loading reports...</div>;
    }

    return (
        <div className="container mx-auto py-12 sm:py-24">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Sales & Analytics</h1>
                <Button onClick={handleFetchReports}>Refresh Reports</Button>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <CardTitle>Monthly Sales Report</CardTitle>
                                <CardDescription>Total sales revenue per month for the selected year.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(5)].map((_, i) => {
                                        const y = new Date().getFullYear() - i;
                                        return <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-right">Total Sales</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlySales.length > 0 ? monthlySales.map((sale) => (
                                    <TableRow key={sale.month}>
                                        <TableCell className="font-medium">{getMonthName(sale.month)}</TableCell>
                                        <TableCell className="text-right">${sale.totalSales.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">No sales data for this year.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <BarChart className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <CardTitle>Top Selling Products</CardTitle>
                                <CardDescription>The most popular products by quantity sold.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center space-x-2 mb-4">
                            <Input
                                type="number"
                                value={productCount}
                                onChange={(e) => setProductCount(Number(e.target.value))}
                                className="w-24"
                                min="1"
                            />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity Sold</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {popularProducts.length > 0 ? popularProducts.map((prod) => (
                                    <TableRow key={prod.productId}>
                                        <TableCell className="font-medium">{prod.productName}</TableCell>
                                        <TableCell className="text-right">{prod.totalQuantitySold}</TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">No product data available.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <CardTitle>Top Customers</CardTitle>
                                <CardDescription>Customers with the highest total purchase amount.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <Input
                                type="number"
                                value={customerCount}
                                onChange={(e) => setCustomerCount(Number(e.target.value))}
                                className="w-24"
                                min="1"
                            />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Total Spent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topCustomers.length > 0 ? topCustomers.map((cust) => (
                                    <TableRow key={cust.userId}>
                                        <TableCell className="font-medium">{cust.customerName}</TableCell>
                                        <TableCell className="text-right">${cust.totalPurchaseAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">No customer data available.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}