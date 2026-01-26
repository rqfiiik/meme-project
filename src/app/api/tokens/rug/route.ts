import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tokenAddress } = body;

        if (!tokenAddress) {
            return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
        }

        // Update Token Status to 'rugged'
        const updatedToken = await prisma.token.update({
            where: { address: tokenAddress },
            data: { status: 'rugged' }
        });

        // Also update Liquidity Pool status if exists
        // (Optional, but good for consistency)
        // We find the pool first
        const pool = await prisma.liquidityPool.findFirst({
            where: { token: { address: tokenAddress } }
        });

        if (pool) {
            await prisma.liquidityPool.update({
                where: { id: pool.id },
                data: { status: 'rugged' }
            });
        }

        return NextResponse.json({ success: true, token: updatedToken });
    } catch (error) {
        console.error('Error rugging token:', error);
        return NextResponse.json({ error: 'Failed to rug token' }, { status: 500 });
    }
}
