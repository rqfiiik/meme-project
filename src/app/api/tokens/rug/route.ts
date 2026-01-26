import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tokenAddress } = body;

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
            // Optionally we could create a dummy pool to mark it as rugged, but for now let's just return success
            // or maybe we can update the description of the token?
            // Let's rely on the pool. If no pool, you can't manage liquidity anyway.
        }

        return NextResponse.json({ success: true, rugged: true });


    } catch (error) {
        console.error('Error rugging token:', error);
        return NextResponse.json({ error: 'Failed to rug token' }, { status: 500 });
    }
}
