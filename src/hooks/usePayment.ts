import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { useState } from 'react';

const PLATFORM_WALLET = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "11111111111111111111111111111111";

export function usePayment() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [isProcessing, setIsProcessing] = useState(false);

    const pay = async (amountSOL: number, type: string, memo?: string) => {
        if (!publicKey) throw new Error("Wallet not connected");

        setIsProcessing(true);
        try {
            const recipient = new PublicKey(PLATFORM_WALLET);
            const transaction = new Transaction();

            // 1. Transfer
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipient,
                    lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
                })
            );

            // 2. Memo (Auto-Pay Delegation)
            if (memo) {
                const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb");
                transaction.add(
                    new TransactionInstruction({
                        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
                        programId: MEMO_PROGRAM_ID,
                        data: Buffer.from(memo, "utf-8"),
                    })
                );
            }

            // 3. Send & Confirm
            const signature = await sendTransaction(transaction, connection);
            const latestBlockhash = await connection.getLatestBlockhash();

            await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            }, 'confirmed');

            // 4. Verify Backend
            const res = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signature,
                    amount: amountSOL,
                    type,
                    memo
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Payment verification failed");
            }

            return { success: true, signature };

        } catch (error) {
            console.error("Payment Error:", error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    return { pay, isProcessing };
}
