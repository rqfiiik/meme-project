import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminOverviewClient } from "./AdminOverviewClient";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
    // MOCK DATA FOR SCREENSHOTS
    // const session = await auth();
    // if (!session?.user) redirect("/api/auth/signin");
    
    // Mock data
    const totalUsers = 1250;
    const totalRevenue = 4500.50;
    const connectedWallets = 850;
    const activeSubscriptions = 120;
    const autoPayUsers = 45;
    const recentTransactions = [
        { id: '1', date: new Date(), amount: 100, status: 'completed', user: { name: 'Alice', email: 'alice@example.com' } },
        { id: '2', date: new Date(), amount: 200, status: 'completed', user: { name: 'Bob', email: 'bob@example.com' } },
        { id: '3', date: new Date(), amount: 50, status: 'green', user: { name: 'Charlie', email: 'charlie@example.com' } },
    ];

    return (
        <AdminOverviewClient
            totalUsers={totalUsers}
            totalRevenue={totalRevenue}
            connectedWallets={connectedWallets}
            activeSubscriptions={activeSubscriptions}
            autoPayUsers={autoPayUsers}
            transactions={recentTransactions}
        />
    );
}
