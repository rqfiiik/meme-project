import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { useState, useEffect } from 'react';

import { CONFIG } from '../lib/config';

const PLATFORM_WALLET = CONFIG.TREASURY_ADDRESS;

export function usePayment() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAdminBypass, setIsAdminBypass] = useState(false);

    // Check for Admin Mode
    useEffect(() => {
        fetch('/api/admin/status')
            .then(res => res.json())
            .then(data => {
                if (data.bypass) setIsAdminBypass(true);
            })
            .catch(err => console.error("Failed to check admin status", err));
    }, []);

    const pay = async (amountSOL: number, type: string, memo?: string) => {
        if (!publicKey && !isAdminBypass) throw new Error("Wallet not connected");

        setIsProcessing(true);
        try {
            // --- ADMIN BYPASS ---
            if (isAdminBypass) {
                console.log("Flux: Bypassing Payment (Admin Mode)");

                const res = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        signature: 'bypass',
                        amount: amountSOL,
                        type,
                        memo
                    }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Admin bypass failed");
                }

                return { success: true, signature: 'bypass' };
            }
            // --------------------

            const recipient = new PublicKey(PLATFORM_WALLET);
            const transaction = new Transaction();

            // 1. Transfer
            if (!publicKey) throw new Error("Wallet not connected"); // Re-check for typescript

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
            // @ts-ignore
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

    return { pay, isProcessing, isAdminBypass };
}
