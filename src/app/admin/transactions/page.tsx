import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransactionsClient } from "./TransactionsClient";

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
                }
            }
        }
    });

    return <TransactionsClient transactions={transactions} />;
}
