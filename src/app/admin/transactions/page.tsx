import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransactionsClient } from "./TransactionsClient";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    const transactions = await prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 100,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });

    const sanitizedTransactions = transactions.map(tx => ({
        id: tx.id,
        signature: tx.signature,
        amount: tx.amount,
        date: tx.date.toISOString(),
        userId: tx.userId,
        userName: tx.user?.name || 'Unknown',
        userEmail: tx.user?.email || null,
        userAddress: tx.userAddress,
        type: tx.type,
        status: tx.status
    }));

    return <TransactionsClient transactions={sanitizedTransactions} />;
}
