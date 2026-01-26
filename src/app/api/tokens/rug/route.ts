import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await auth();
        const body = await req.json();
        const { tokenAddress, stats } = body;

        if (!tokenAddress) {
            return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
        }

        // Update Liquidity Pool status to 'rugged' (Using LP status as proxy since Token.status schema update failed)
        const pool = await prisma.liquidityPool.findFirst({
            where: { token: { address: tokenAddress } }
        });

        if (pool) {
            await prisma.liquidityPool.update({
                where: { id: pool.id },
                data: { status: 'rugged' }
            });
        } else {
            console.warn("Attempted to rug token without liquidity pool:", tokenAddress);
        }

        // --- SAVE SNAPSHOT ---
        // Store the final stats (Volume, Holders, etc.) in AdminLog to persist them
        if (session?.user?.id && stats) {
            await prisma.adminLog.create({
                data: {
                    adminId: session.user.id,
                    action: 'RUG_SNAPSHOT',
                    targetId: tokenAddress,
                    details: JSON.stringify(stats)
                }
            });
        }

        return NextResponse.json({ success: true, rugged: true });

    } catch (error) {
        console.error('Error rugging token:', error);
        return NextResponse.json({ error: 'Failed to rug token' }, { status: 500 });
    }
}
