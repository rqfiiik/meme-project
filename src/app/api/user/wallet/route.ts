import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { address } = await req.json();

        if (!address) {
            return new NextResponse("Address required", { status: 400 });
        }

        // Update user with wallet address (Primary)
        await prisma.user.update({
            where: { id: session.user.id },
            data: { address: address }
        });

        // Upsert Wallet record for multi-wallet support
        await prisma.wallet.upsert({
            where: { address: address },
            update: {
                userId: session.user.id,
                lastSeenAt: new Date(),
                status: 'active'
            },
            create: {
                userId: session.user.id,
                address: address,
                label: 'Phantom', // Default label
                status: 'active',
                isPrimary: true // Default to primary if it's the one being synced
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error syncing wallet:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
