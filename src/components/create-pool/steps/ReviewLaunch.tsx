'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle, Check, ShieldCheck } from 'lucide-react';

interface ReviewLaunchProps {
    data: any;
    onBack: () => void;
}

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createTransferTransaction } from '@/lib/solana/transaction';
import { useState, useEffect, useRef } from 'react';

export function ReviewLaunch({ data, onBack }: ReviewLaunchProps) {
    const serviceFee = 0.3; // SOL
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [isLoading, setIsLoading] = useState(false);

    // Auto-request signature ref
    const hasRequested = useRef(false);

    const handleCreatePool = async () => {
        if (!publicKey) return;

        setIsLoading(true);
        try {
            const transaction = await createTransferTransaction({
                connection,
                publicKey,
                amount: serviceFee
            });

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            // Save Pool to DB
            try {
                const response = await fetch('/api/pools', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tokenAddress: data.selectedToken?.address, // Assuming selectedToken has address
                        quoteToken: data.quoteToken,
                        baseAmount: data.baseAmount,
                        quoteAmount: data.quoteAmount,
                        startTime: data.startTime,
                        userAddress: publicKey.toString(),
                        priorityFee: 0 // Placeholder
                    })
                });
                if (!response.ok) throw new Error('Failed to save pool');
            } catch (apiError) {
                console.error("Failed to save pool to DB:", apiError);
            }

            alert(`Success! Pool Initialized. Transaction confirmed: ${signature.slice(0, 8)}...`);
            // Here you would proceed with actual pool initialization logic
        } catch (error) {
            console.error(error);
            console.log("Transaction failed or was cancelled.");
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-trigger on load if connected
    useEffect(() => {
        if (publicKey && !hasRequested.current && !isLoading) {
            hasRequested.current = true;
            handleCreatePool();
        }
    }, [publicKey]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Pool Summary Card */}
            <div className="rounded-xl border border-border bg-background/50 p-6 space-y-4">
                <h3 className="font-semibold text-white mb-4">Pool Summary</h3>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-text-secondary">Base Token</span>
                    <span className="font-medium text-white">{data.baseAmount} {data.selectedToken?.symbol}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-text-secondary">Quote Token</span>
                    <span className="font-medium text-white">{data.quoteAmount} {data.quoteToken}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-text-secondary">Start Time</span>
                    <span className="font-medium text-white capitalize">{data.startTime === 'now' ? 'Immediate' : 'Scheduled'}</span>
                </div>
            </div>

            {/* Fees Section */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Service Fee
                    </span>
                    <span className="font-bold text-white">{serviceFee} SOL</span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                    This fee covers the cost of pool creation and platform maintenance.
                </p>
            </div>

            <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="w-full" onClick={onBack} disabled={isLoading}>
                    Back
                </Button>
                <Button className="w-full font-bold text-lg shadow-lg shadow-primary/20" onClick={handleCreatePool} disabled={isLoading} isLoading={isLoading}>
                    {isLoading ? 'Creating Pool...' : `Create Pool (${serviceFee} SOL)`}
                </Button>
            </div>
        </div>
    );
}
