import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // 1. Security Check (Vercel Cron Secret)
    // In production, configure CRON_SECRET in Vercel env vars
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Find users due for payment
        const now = new Date();
        const dueUsers = await prisma.user.findMany({
            where: {
                isAutoPay: true,
                subscriptionStatus: 'active',
                nextPayment: {
                    lte: now
                }
            }
        });

        const results = [];

        // 3. Process Payments (Simulated)
        for (const user of dueUsers) {
            try {
                // Simulate Transaction
                const amount = 0.5;
                const signature = `cron_tx_${Date.now()}_${user.id.substring(0, 4)}`;

                // Create Transaction Record
                await prisma.transaction.create({
                    data: {
                        signature,
                        amount,
                        userId: user.id
                    }
                });

                // Update User
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        lastPayment: now,
                        nextPayment: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days
                    }
                });

                results.push({ userId: user.id, status: 'success', signature });
            } catch (err: any) {
                console.error(`Failed to process user ${user.id}`, err);
                results.push({ userId: user.id, status: 'failed', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
