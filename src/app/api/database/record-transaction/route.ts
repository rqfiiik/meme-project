import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { signature, amount, userAddress, isAutoPay } = body;

        // Check for affiliate cookie
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const refCode = cookieStore.get("affiliate_ref")?.value;
        let referrerId = null;

        if (refCode) {
            const referrer = await (prisma.user as any).findUnique({ where: { promoCode: refCode } });
            if (referrer) referrerId = referrer.id;
        }

        if (!signature || !amount || !userAddress) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Upsert User (Create if new, update auto-pay status if exists)
        // Use any cast to allow referrerId in create
        const user = await (prisma.user as any).upsert({
            where: { address: userAddress },
            update: { isAutoPay: isAutoPay || false },
            create: {
                address: userAddress,
                isAutoPay: isAutoPay || false,
                referrerId: referrerId // Link referrer on creation
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

        // 3. Commission Logic
        if (user.referrerId) {
            const referrer = await (prisma.user as any).findUnique({ where: { id: user.referrerId } });
            if (referrer && referrer.isCreator) {
                const rate = referrer.commissionRate || 0.5;
                const commission = parseFloat(amount) * rate;

                // Record Earning
                await (prisma as any).affiliateEarning.create({
                    data: {
                        creatorId: referrer.id,
                        referredUserId: user.id,
                        transactionId: transaction.id,
                        amount: commission
                    }
                });
                console.log(`[Affiliate] Recorded commission: ${commission} for creator ${referrer.id}`);
            }
        }

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Database failed' }, { status: 500 });
    }
}
