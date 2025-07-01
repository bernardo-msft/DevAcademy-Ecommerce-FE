"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user, isLoading, token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login?redirect=/dashboard"); // Redirect to login if not authenticated
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return <div className="text-center py-10">Loading or Redirecting...</div>;
    }

    // Fetch dashboard specific data using the token
    // useEffect(() => {
    //     if (token) {
    //         // fetchDashboardData(token).then(...)
    //     }
    // }, [token]);

    return (
        <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome to your protected dashboard, {user.name}!</p>
            {/* Dashboard content */}
        </div>
    );
}