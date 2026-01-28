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
        const user = await (prisma.user as any).findUnique({
            where: { id: session.user.id },
            select: {
                isCreator: true,
                promoCode: true,
                commissionRate: true,
            }
        });

        if (!user?.isCreator) {
            return NextResponse.json({ error: "Not a creator" }, { status: 403 });
        }

        // Parallel fetch for stats
        const [referralCount, earnings] = await Promise.all([
            (prisma.user as any).count({
                where: { referrerId: session.user.id }
            }),
            (prisma as any).affiliateEarning.findMany({
                where: { creatorId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    amount: true,
                    createdAt: true,
                    transactionId: true,
                }
            })
        ]);

        const totalEarnings = earnings.reduce((acc: number, curr: any) => acc + curr.amount, 0);

        return NextResponse.json({
            user: {
                promoCode: user.promoCode,
                commissionRate: user.commissionRate,
            },
            stats: {
                referrals: referralCount,
                totalEarnings,
            },
            earnings
        });

    } catch (error) {
        console.error("Creator Dashboard fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
