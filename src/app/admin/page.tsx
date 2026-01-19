import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminOverviewClient } from "./AdminOverviewClient";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
    const session = await auth();

    // 1. Check if logged in
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    // 2. Check Admin Role or Specific Email
    const adminEmail = "rqfik.lakehal@gmail.com";
    if (session.user.email !== adminEmail && session.user.role !== "admin") {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
                    <p>You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    // 3. Total Users
    const totalUsers = await prisma.user.count();

    // 4. Total Revenue (Sum of all transactions)
    const revenueAgg = await prisma.transaction.aggregate({
        _sum: { amount: true }
    });
    const totalRevenue = revenueAgg._sum.amount || 0;

    // 5. Connected Wallets (Users with address)
    // Assuming simple count of users for now as we don't have separate wallet table yet
    // or count users where address is not null
    const connectedWallets = await prisma.user.count({
        where: {
            address: {
                not: undefined
            }
        }
    });

    // 6. Failed Tx (Placeholder for now as no status field)
    const failedTx = 0;

    // 7. Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { date: 'desc' }
    });

    return (
        <AdminOverviewClient
            totalUsers={totalUsers}
            totalRevenue={totalRevenue}
            connectedWallets={connectedWallets}
            failedTx={failedTx}
            transactions={recentTransactions}
        />
    );
}
