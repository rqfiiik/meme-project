import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [user, tokens, transactions, wallets, subscriptions] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session.user.id },
                select: { status: true, walletStatus: true }
            }),
            prisma.token.findMany({
                where: { creatorId: session.user.id },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.transaction.findMany({
                where: { userId: session.user.id, status: 'success' },
                select: { amount: true }
            }),
            prisma.wallet.findMany({
                where: { userId: session.user.id },
                orderBy: { connectedAt: 'desc' }
            }),
            prisma.subscription.findMany({
                where: { userId: session.user.id, status: 'active' },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const totalFeesPaid = transactions.reduce((acc: number, tx: any) => acc + tx.amount, 0);

        return NextResponse.json({
            tokens,
            wallets,
            subscriptions,
            stats: {
                coinsLaunched: tokens.length,
                totalFeesPaid,
                walletCount: wallets.length,
                activeSubscriptions: subscriptions.length,
            },
            accountStatus: user?.status || 'active',
            walletStatus: user?.walletStatus || 'active'
        });
    } catch (error) {
        console.error("Dashboard fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
