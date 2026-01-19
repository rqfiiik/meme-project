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

    // 4. Mock Data for now
    const totalRevenue = 12500.50;
    const connectedWallets = 42;
    const failedTx = 3;

    return (
        <AdminOverviewClient
            totalUsers={totalUsers}
            totalRevenue={totalRevenue}
            connectedWallets={connectedWallets}
            failedTx={failedTx}
        />
    );
}
