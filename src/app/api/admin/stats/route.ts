import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all users and transactions
        const users = await prisma.user.findMany({
            include: { transactions: true },
            orderBy: { firstSeen: 'desc' }
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
