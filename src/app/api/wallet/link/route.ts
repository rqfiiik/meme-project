import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { address, signature } = body;

        if (!address) {
            return NextResponse.json({ error: "Address required" }, { status: 400 });
        }

        // TODO: Verify signature here using tweetnacl or @solana/web3.js if strict verification needed
        // For now, we trust the client-side wallet adapter providing the address for the MVP
        // but normally we'd verify the message signature.

        const wallet = await prisma.wallet.upsert({
            where: { address },
            update: {
                status: "active",
                lastSeenAt: new Date(),
                // If it was disconnected, we reactivate it.
                // userId is not updated to prevent stealing wallets if that logic is desired,
                // but usually if a user proves ownership, we might want to check if it belongs to someone else.
                // For now, we assume if it exists, it must match the user or we'd handle conflict.
            },
            create: {
                userId: session.user.id,
                address,
                status: "active",
                label: "Phantom", // Default or passed from body
                connectedAt: new Date(),
                lastSeenAt: new Date(),
            }
        });

        // Basic check: Ensure the wallet belongs to this user
        if (wallet.userId !== session.user.id) {
            return NextResponse.json({ error: "Wallet already linked to another user" }, { status: 409 });
        }

        return NextResponse.json({ success: true, wallet });
    } catch (error: any) {
        console.error("Link Wallet Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
