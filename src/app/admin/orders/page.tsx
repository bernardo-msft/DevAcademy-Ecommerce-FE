"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllOrders, updateOrderStatus } from "@/services/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  orderDate: string;
  totalPrice: number;
  status: string; // Changed from number to string
  orderItems: OrderItem[];
}

const orderStatusMap: { [key: number]: string } = {
  0: "Pending",
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

// Create a reverse map from the status name back to its number
const statusNameToValueMap: { [key: string]: number } = Object.fromEntries(
  Object.entries(orderStatusMap).map(([key, value]) => [value, Number(key)])
);

export default function ManageOrdersPage() {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (token) {
      try {
        setIsLoading(true);
        const data = await getAllOrders(token);
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders.");
        toast.error(err.message || "Failed to fetch orders.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || user.role !== "Admin") {
        toast.error("Access Denied");
        router.push("/");
      } else {
        fetchOrders();
      }
    }
  }, [user, isAuthLoading, router, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return;
    const statusValue = parseInt(newStatus, 10);
    try {
      const updatedOrder = await updateOrderStatus(orderId, statusValue, token);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId ? { ...o, status: updatedOrder.status } : o
        )
      );
      toast.success(
        `Order #${orderId.substring(0, 8)} status updated to ${
          orderStatusMap[statusValue]
        }.`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status.");
      fetchOrders();
    }
  };

  const handleViewItemsClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">Loading orders...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Manage All Orders
      </h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {order.userId}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${order.totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      value={statusNameToValueMap[order.status]?.toString()}
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(orderStatusMap).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewItemsClick(order)}
                    >
                      View Items
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setSelectedOrder(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Order Items for #{selectedOrder?.id.substring(0, 8)}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.orderItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}