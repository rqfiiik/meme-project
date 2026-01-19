import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { signature, amount, userAddress, isAutoPay } = body;

        if (!signature || !amount || !userAddress) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Upsert User (Create if new, update auto-pay status if exists)
        const user = await prisma.user.upsert({
            where: { address: userAddress },
            update: { isAutoPay: isAutoPay || false },
            create: {
                address: userAddress,
                isAutoPay: isAutoPay || false,
            },
        });

        // 2. Create Transaction
        const transaction = await prisma.transaction.create({
            data: {
                signature,
                amount: parseFloat(amount),
                userId: user.id,
            },
        });

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Database failed' }, { status: 500 });
    }
}
