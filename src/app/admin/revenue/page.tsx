import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RevenueClient } from "./RevenueClient";

export default async function RevenuePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    // Calculate revenue
    const allTx = await prisma.transaction.findMany({
        select: { amount: true, date: true } // Assuming 'amount' is in SOL
    });

    const totalRevenue = allTx.reduce((acc, tx) => acc + tx.amount, 0);
    const totalTransactions = allTx.length;

    // Today's Revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const revenueToday = allTx
        .filter(tx => new Date(tx.date) >= today)
        .reduce((acc, tx) => acc + tx.amount, 0);

    const stats = {
        totalRevenue,
        revenueToday,
        revenueThisMont: 0, // Placeholder
        totalTransactions
    };

    return <RevenueClient stats={stats} />;
}
