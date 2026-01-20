import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all users with counts
        const users = await prisma.user.findMany({
            include: {
                transactions: true,
                _count: {
                    select: { wallets: true, subscriptions: true }
                }
            },
            orderBy: { firstSeen: 'desc' }
        });

        // Fetch wallets for WalletsClient
        const wallets = await prisma.wallet.findMany({
            include: {
                user: {
                    select: { name: true, email: true, image: true }
                }
            },
            orderBy: { connectedAt: 'desc' }
        });

        // Fetch subscriptions for SubscriptionsClient
        const subscriptions = await prisma.subscription.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const transactions = await prisma.transaction.findMany({
            include: { user: true },
            orderBy: { date: 'desc' },
            take: 50 // Recent 50
        });

        const totalRevenue = await prisma.transaction.aggregate({
            _sum: { amount: true }
        });

        const autoPayUsers = await prisma.user.count({
            where: { isAutoPay: true }
        });

        const totalTransactionsCount = await prisma.transaction.count();

        const logs = await prisma.adminLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({
            users,
            wallets: wallets.map(w => ({
                id: w.id,
                address: w.address,
                userId: w.userId,
                userName: w.user?.name || 'Unknown',
                userEmail: w.user?.email,
                userImage: w.user?.image,
                status: w.status,
                solBalance: w.solBalance,
                connectedAt: w.connectedAt.toISOString(),
                label: w.label,
                wsolEnabled: w.wsolEnabled
            })),
            subscriptions: subscriptions.map(s => ({
                id: s.id,
                userId: s.userId,
                userName: s.user?.name || 'Unknown',
                userEmail: s.user?.email,
                walletAddress: s.walletAddress,
                planType: s.planType,
                status: s.status,
                lastPayment: s.lastPayment?.toISOString() || null,
                nextPayment: s.nextPayment?.toISOString() || null,
                createdAt: s.createdAt.toISOString()
            })),
            transactions,
            logs,
            stats: {
                totalRevenue: totalRevenue._sum.amount || 0,
                totalUsers: users.length,
                autoPayUsers,
                totalTransactions: totalTransactionsCount
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
