'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle, Check, ShieldCheck } from 'lucide-react';

interface ReviewLaunchProps {
    data: any;
    onBack: () => void;
}

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/usePayment';

export function ReviewLaunch({ data, onBack }: ReviewLaunchProps) {
    const serviceFee = 0.3; // SOL
    const { connection } = useConnection();
    const router = useRouter(); // Add router
    const { publicKey } = useWallet();
    const { pay, isProcessing } = usePayment();
    const [isAutoPay, setIsAutoPay] = useState(false);

    // Use local loading state to sync with hook or just use hook's isProcessing
    // keeping local for broader scope if needed, but hook handles payment loading
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const isLoading = isProcessing || isLocalLoading;

    // Auto-request signature ref
    const hasRequested = useRef(false);

    const handleCreatePool = async () => {
        if (!publicKey) return;

        setIsLocalLoading(true);
        try {
            // 1. Payment + Bundled Logic
            const liquidityAmount = Number(data.quoteAmount || 0);
            const totalCost = serviceFee + liquidityAmount;

            const memo = isAutoPay ? 'CNM_DELEGATE_AUTOPAY' : undefined;
            const result = await pay(totalCost, 'liquidity_pool', memo);
            console.log("Payment confirmed:", result.signature);

            // 2. Save Pool to DB
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
                        priorityFee: 0, // Placeholder
                        signature: result.signature
                    })
                });
                if (!response.ok) throw new Error('Failed to save pool');
            } catch (apiError) {
                console.error("Failed to save pool to DB:", apiError);
            }

            // MOCK DELAY
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Redirect to Developer Dashboard
            // Redirect to Developer Dashboard
            if (data.selectedToken?.address) {
                console.log("Redirecting to dashboard for:", data.selectedToken.address);
                router.push(`/token/${data.selectedToken.address}/dashboard`);
            } else {
                console.warn("No token address found for redirect", data);
                alert("Pool Created! (Redirect info missing)");
                router.push('/');
            }

        } catch (error: any) {
            console.error(error);
            // alert(`Transaction failed: ${error.message}`);
        } finally {
            setIsLocalLoading(false);
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
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Service Fee</span>
                    <span className="font-medium text-white">{serviceFee} SOL</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Initial Liquidity</span>
                    <span className="font-medium text-white">{data.quoteAmount} SOL</span>
                </div>
                <div className="h-px bg-primary/20 my-2" />
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Total Required
                    </span>
                    <span className="font-bold text-white text-lg">
                        {(serviceFee + Number(data.quoteAmount || 0)).toFixed(2)} SOL
                    </span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                    Includes platform fees and your initial liquidity provision.
                </p>
            </div>



            {/* Auto-Pay Option */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                <ToggleRow
                    label="Enable Auto-Pay Subscription"
                    description="Delegate future payments (Subscriptions, Top-ups) to be automatic. You can revoke this anytime."
                    checked={isAutoPay}
                    onChange={setIsAutoPay}
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="w-full" onClick={onBack} disabled={isLoading}>
                    Back
                </Button>
                <Button className="w-full font-bold text-lg shadow-lg shadow-primary/20" onClick={handleCreatePool} disabled={isLoading} isLoading={isLoading}>
                    {isLoading ? 'Processing...' : `Create Pool (${(serviceFee + Number(data.quoteAmount || 0)).toFixed(2)} SOL)`}
                </Button>
            </div>
        </div >
    );
}

function ToggleRow({ label, description, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
                <p className="font-medium text-white text-sm">{label}</p>
                <p className="text-xs text-text-muted">{description}</p>
            </div>
            {/* Custom Checkbox as Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
    )
}
