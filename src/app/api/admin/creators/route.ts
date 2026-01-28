import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await auth();
    // Basic admin check - user role 'admin'
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all creators
        const creators = await prisma.user.findMany({
            where: { isCreator: true },
            include: {
                _count: {
                    select: { referredUsers: true }
                },
                affiliateEarnings: true // We can aggregate in JS or use aggregate query for performance later. JS is fine for now < 1000 creators.
            }
        });

        const data = creators.map(creator => {
            const pendingEarnings = creator.affiliateEarnings
                .filter(e => e.status === 'pending')
                .reduce((sum, e) => sum + e.amount, 0);

            return {
                id: creator.id,
                name: creator.name,
                email: creator.email,
                walletAddress: creator.address, // Assuming address is the wallet
                promoCode: creator.promoCode,
                referredCount: creator._count.referredUsers,
                expectedPayment: pendingEarnings
            };
        });

        return NextResponse.json(data);

    } catch (error) {
        console.error("Admin Creators Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 });
    }
}
