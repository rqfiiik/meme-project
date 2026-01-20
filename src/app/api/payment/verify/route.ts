import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

// TODO: Move to env
const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "CNM...DEVNET_ADDRESS";
const RPC_URL = "https://api.devnet.solana.com"; // Use env in prod

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { signature, amount, type, memo } = body;

        if (!signature || !amount || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify Transaction on Chain
        const connection = new Connection(RPC_URL, "confirmed");
        const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });

        if (!tx) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // 2. record transaction in DB
        // In a real app, we would parse 'tx' deeply to verify recipient and exact logic
        // For MVP, if we found the signature and the client says it's for X amount, we log it.
        // SECURITY NOTE: In production, MUST verify `tx.transaction.message.instructions` contains
        // transfer to PLATFORM_WALLET >= amount.

        // Log to DB
        // First check if user or wallet is banned
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { wallets: true }
        });

        // Assuming the transaction sender is one of the user's wallets. 
        // We can match by who sent the tx (tx.transaction.message.accountKeys[0].pubkey)
        // For simplified flow, we check if the USER is banned.
        if (user?.status === 'banned' || user?.status === 'suspended') {
            return NextResponse.json({ error: "Account suspended. Payment processed on-chain but not credited." }, { status: 403 });
        }

        // Check if specific wallet is banned if we can match it
        // (Skipping complex tx parsing for exact wallet matching in this step, relying on user ban)

        await prisma.transaction.create({
            data: {
                signature,
                amount: parseFloat(amount),
                userId: session.user.id,
                status: "success",
                // type: type // if we add type to schema later
            }
        });

        // 3. Handle Auto-Pay / Subscription logic
        // Verify Memo if provided
        if (memo) {
            const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb";

            // In production: tx.transaction.message.instructions.find(ix => ix.programId.toString() === MEMO_PROGRAM_ID)
            // For now, we trust the signature is valid and if the client sent "memo", we assume it was in the tx or we just simulate the check.
            // But correct way is to parse 'tx' from getParsedTransaction.

            const hasMemo = tx.transaction.message.instructions.some((ix: any) => {
                // Check if it's the memo program. 'ix' structure depends on 'getParsedTransaction'.
                // ParsedInstruction usually has programId.
                return ix.programId.toString() === MEMO_PROGRAM_ID || ix.program === 'spl-memo';
            });

            if (hasMemo && memo === 'CNM_DELEGATE_AUTOPAY') {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { isAutoPay: true }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Payment Verification Error:", error);

        // Handle Prisma Unique Constraint Violation (P2002) for signature
        if (error.code === 'P2002' && error.meta?.target?.includes('signature')) {
            return NextResponse.json({ error: "Transaction already processed" }, { status: 409 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
