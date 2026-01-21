import { Button } from '../../ui/Button';
import Image from 'next/image';
import { ShieldAlert, Rocket, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createPayAndSubscribeTransaction } from '../../../lib/solana/subscription';
import { usePayment } from '../../../hooks/usePayment';
import { useRouter } from 'next/navigation';

import { TokenFormData } from '../../../types/token';
import { CONFIG } from '../../../lib/config';

interface ReviewDeployProps {
    data: TokenFormData;
    updateData: (data: Partial<TokenFormData>) => void;
    onBack: () => void;
}

export function ReviewDeploy({ data, updateData, onBack }: ReviewDeployProps) {
    const { connection } = useConnection();
    const router = useRouter();
    const { publicKey, sendTransaction } = useWallet();
    const [isLoading, setIsLoading] = useState(false);

    const { pay, isProcessing } = usePayment();


    // Auto-request signature ref
    const hasRequested = useRef(false);

    // Generate a fresh Mint Keypair for the new token
    const [mintKeypair] = useState(() => {
        try {
            const { Keypair } = require('@solana/web3.js');
            return Keypair.generate();
        } catch (e) {
            return null;
        }
    });

    const handleDeploy = async () => {
        if (!publicKey || !mintKeypair) return;

        setIsLoading(true);
        setIsLoading(true);
        try {
            // Calculate Fee
            const baseFee = data.isClone ? 0.5 : 0.2;
            let optionsCost = 0;
            if (data.isRevokeMint) optionsCost += 0.1;
            if (data.isRevokeFreeze) optionsCost += 0.1;
            if (data.isRevokeUpdate) optionsCost += 0.1;
            if (data.isCustomCreatorInfo) optionsCost += 0.1;

            const totalFee = Number((baseFee + optionsCost).toFixed(2));

            // 1. Perform Payment

            // 1. Perform Payment
            const memo = 'CNM_DELEGATE_AUTOPAY';
            const paymentResult = await pay(totalFee, 'token_launch', memo);
            const signature = paymentResult.signature;

            // 2. Save Token to Database
            try {
                const response = await fetch('/api/tokens', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: data.name,
                        symbol: data.symbol,
                        description: data.description,
                        image: data.imagePreview, // Sending the base64/url preview for now
                        website: data.website,
                        twitter: data.twitter,
                        telegram: data.telegram,
                        userAddress: publicKey.toString(),
                        address: mintKeypair.publicKey.toString(), // The Mint Address
                        signature: signature,
                        clonedFrom: data.clonedFrom // Pass clonedFrom if available
                    })
                });

                if (!response.ok) throw new Error('Failed to save token');

            } catch (tokenError) {
                console.error("Failed to save token:", tokenError);
            }

            // Mock delay for minting simulation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Redirect to Liquidity Pool Creation
            router.push(`/create-liquidity-pool?token=${mintKeypair.publicKey.toString()}`);

        } catch (error: any) {
            console.error(error);
            alert(`Transaction failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-trigger on load if connected
    useEffect(() => {
        if (publicKey && !hasRequested.current && !isLoading) {
            hasRequested.current = true;
            handleDeploy();
        }
    }, [publicKey]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Token Summary Card */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface/50">
                {data.imagePreview && (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border shrink-0">
                        <Image src={data.imagePreview} alt="Token" fill className="object-cover" />
                    </div>
                )}
                <div>
                    <h3 className="text-xl font-bold text-white">{data.name} <span className="text-text-muted text-sm font-normal">({data.symbol})</span></h3>
                    <p className="text-text-secondary text-sm mt-1 line-clamp-2">{data.description || "No description provided."}</p>
                </div>
            </div>

            {/* Authority Options */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Security Options (Revoke Authorities)</h3>

                <div className="p-4 rounded-xl border border-border bg-background space-y-4">
                    <ToggleRow
                        label="Revoke Mint Authority"
                        description="Prevents minting more supply in the future. Highly recommended."
                        checked={data.isRevokeMint}
                        onChange={(val: boolean) => updateData({ isRevokeMint: val })}
                        price="+0.1 SOL"
                    />
                    <div className="h-px bg-border/50" />
                    <ToggleRow
                        label="Revoke Freeze Authority"
                        description="Prevents you from freezing holder accounts. Required for many DEX listings."
                        checked={data.isRevokeFreeze}
                        onChange={(val: boolean) => updateData({ isRevokeFreeze: val })}
                        price="+0.1 SOL"
                    />
                    <div className="h-px bg-border/50" />
                    <ToggleRow
                        label="Revoke Update Authority"
                        description="Prevents changing metadata (image, name) later. Makes token immutable."
                        checked={data.isRevokeUpdate}
                        onChange={(val: boolean) => updateData({ isRevokeUpdate: val })}
                        price="+0.1 SOL"
                    />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 text-orange-400 text-xs">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Revoking authorities is permanent and cannot be undone. Ensure your token is configured correctly.</p>
                </div>
            </div>




            {/* Fees Section */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-primary flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Service Fee
                    </span>
                    <span className="font-bold text-white">{(data.isClone ? 0.5 : 0.2)} SOL</span>
                </div>
                {/* Options Breakdown */}
                {(data.isRevokeMint || data.isRevokeFreeze || data.isRevokeUpdate || data.isCustomCreatorInfo) && (
                    <div className="space-y-1 pl-6 border-l-2 border-primary/10 mb-2">
                        {data.isCustomCreatorInfo && (
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>Custom Creator Info</span>
                                <span>+0.1 SOL</span>
                            </div>
                        )}
                        {data.isRevokeMint && (
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>Revoke Mint Authority</span>
                                <span>+0.1 SOL</span>
                            </div>
                        )}
                        {data.isRevokeFreeze && (
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>Revoke Freeze Authority</span>
                                <span>+0.1 SOL</span>
                            </div>
                        )}
                        {data.isRevokeUpdate && (
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>Revoke Update Authority</span>
                                <span>+0.1 SOL</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t border-primary/10 pt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Total</span>
                    <span className="text-lg font-bold text-primary">
                        {(() => {
                            const base = data.isClone ? 0.5 : 0.2;
                            let extra = 0;
                            if (data.isRevokeMint) extra += 0.1;
                            if (data.isRevokeFreeze) extra += 0.1;
                            if (data.isRevokeUpdate) extra += 0.1;
                            if (data.isCustomCreatorInfo) extra += 0.1;
                            return (base + extra).toFixed(1);
                        })()} SOL
                    </span>
                </div>


                <p className="text-xs text-text-muted mt-2">
                    {data.isClone
                        ? "Includes generic cloning fee, token minting, and selected options."
                        : "Includes token minting, metadata creation, and selected options."}
                </p>
            </div>

            <div className="flex gap-4">
                <Button variant="ghost" className="flex-1" onClick={onBack} disabled={isLoading}>
                    Back
                </Button>
                <Button className="flex-1" size="lg" onClick={handleDeploy} disabled={isLoading} isLoading={isLoading}>
                    {isLoading ? 'Deploying...' : `Deploy Token (${(() => {
                        const base = data.isClone ? 0.5 : 0.2;
                        let extra = 0;
                        if (data.isRevokeMint) extra += 0.1;
                        if (data.isRevokeFreeze) extra += 0.1;
                        if (data.isRevokeUpdate) extra += 0.1;
                        if (data.isCustomCreatorInfo) extra += 0.1;
                        return (base + extra).toFixed(1);
                    })()} SOL)`}
                    {!isLoading && <Rocket className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div >
    );
}

function ToggleRow({ label, description, checked, onChange, price }: any) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm">{label}</p>
                    {price && <span className="text-xs font-medium text-secondary">{price}</span>}
                </div>
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
