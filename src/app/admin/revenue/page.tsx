import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RevenueClient } from "./RevenueClient";

export const dynamic = 'force-dynamic';

export default async function RevenuePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    // Fetch successful transactions
    const transactions = await prisma.transaction.findMany({
        where: { status: 'success' },
        select: {
            amount: true,
            type: true,
            date: true
        },
        orderBy: { date: 'asc' }
    });

    // Simple aggregation
    const totalRevenue = transactions.reduce((acc, tx) => acc + tx.amount, 0);

    // Group by type
    const byType: Record<string, number> = {};
    transactions.forEach(tx => {
        const type = tx.type || 'unknown';
        byType[type] = (byType[type] || 0) + tx.amount;
    });

    const revenueData = {
        total: totalRevenue,
        breakdown: Object.entries(byType).map(([key, value]) => ({
            name: key,
            value: value,
            percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0
        })).sort((a, b) => b.value - a.value),
        transactions: transactions.map(t => ({ ...t, date: t.date.toISOString() }))
    };

    return <RevenueClient data={revenueData} />;
}
