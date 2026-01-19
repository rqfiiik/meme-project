import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            tokenAddress, // Used to find the token
            quoteToken,
            baseAmount,
            quoteAmount,
            startTime,
            userAddress,
            priorityFee
        } = body;

        if (!tokenAddress || !baseAmount || !quoteAmount || !userAddress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Ensure User Exists
        const user = await prisma.user.upsert({
            where: { address: userAddress },
            update: {},
            create: {
                address: userAddress,
            },
        });

        // 2. Find the Token
        const token = await prisma.token.findUnique({
            where: { address: tokenAddress }
        });

        if (!token) {
            return NextResponse.json({ error: 'Token not found. Please create token first.' }, { status: 404 });
        }

        // 3. Create Pool Record
        const pool = await prisma.liquidityPool.create({
            data: {
                tokenId: token.id,
                quoteToken,
                baseAmount: parseFloat(baseAmount),
                quoteAmount: parseFloat(quoteAmount),
                startTime: startTime === 'now' ? new Date() : new Date(startTime), // Handle 'now'
                creatorId: user.id,
                status: 'pending'
            },
        });

        return NextResponse.json({ success: true, pool });
    } catch (error) {
        console.error('Error creating pool:', error);
        return NextResponse.json({ error: 'Failed to create pool' }, { status: 500 });
    }
}
