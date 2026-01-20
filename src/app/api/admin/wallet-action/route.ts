import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();

        // 1. Check Admin Role
        const adminEmail = "rqfik.lakehal@gmail.com";
        if (session?.user?.email !== adminEmail && session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { walletId, action } = body;

        if (!walletId || !['flag', 'ban', 'unban'].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        if (action === 'request_payment') {
            const signature = `admin_req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            await prisma.transaction.create({
                data: {
                    signature,
                    amount: 0.1,
                    userId: 'admin_action', // Placeholder or fetch user from wallet
                    userAddress: (await prisma.wallet.findUnique({ where: { id: walletId } }))?.address,
                    type: 'subscription',
                    status: 'success'
                }
            });
            return NextResponse.json({ success: true, message: "Payment requested (mock)" });
        }

        // 2. Map action to status
        let newStatus = 'active';
        if (action === 'flag') newStatus = 'flagged';
        if (action === 'ban') newStatus = 'banned';
        if (action === 'unban') newStatus = 'active';
        if (action === 'disconnect') newStatus = 'disconnected';

        // 3. Update Wallet
        const updatedWallet = await prisma.wallet.update({
            where: { id: walletId },
            data: { status: newStatus }
        });

        // 4. Create Audit Log
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: `wallet_${action}`,
                targetId: walletId,
                details: `Status changed to ${newStatus}. IP: ${ip}`
            }
        });

        return NextResponse.json({ success: true, wallet: updatedWallet });

    } catch (error: any) {
        console.error("Admin Wallet Action Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
