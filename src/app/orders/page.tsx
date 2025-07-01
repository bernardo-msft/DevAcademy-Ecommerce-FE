"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders } from "@/services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderDate: string;
  totalPrice: number;
  status: number;
  orderItems: OrderItem[];
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return "Pending";
    case 1: return "Processing";
    case 2: return "Shipped";
    default: return "Unknown";
  }
};

export default function OrdersPage() {
  const { token, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login?redirect=/orders");
      return;
    }

    const fetchOrders = async () => {
      if (token) {
        try {
          setIsLoading(true);
          const data = await getOrders(token);
          setOrders(data);
        } catch (err: any) {
          setError(err.message || "Failed to fetch orders.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
  }, [token, user, isAuthLoading, router]);

  if (isLoading || isAuthLoading) {
    return <div className="container mx-auto py-10 text-center">Loading your orders...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.orderDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold">${order.totalPrice.toFixed(2)}</p>
                     <Badge>{getStatusText(order.status)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="my-4" />
                <h3 className="font-semibold mb-4">Items</h3>
                <ul className="space-y-4">
                  {order.orderItems.map((item) => (
                    <li key={item.productId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}