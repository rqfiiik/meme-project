import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { ShieldAlert, Rocket, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createPayAndSubscribeTransaction } from '@/lib/solana/subscription';
import { usePayment } from '@/hooks/usePayment';
import { useRouter } from 'next/navigation';

interface ReviewDeployProps {
    data: any;
    onBack: () => void;
}

export function ReviewDeploy({ data, onBack }: ReviewDeployProps) {
    const { connection } = useConnection();
    const router = useRouter();
    const { publicKey, sendTransaction } = useWallet();
    const [revokeMint, setRevokeMint] = useState(false);
    const [revokeFreeze, setRevokeFreeze] = useState(false);
    const [revokeUpdate, setRevokeUpdate] = useState(false);
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
        try {
            const fee = data.isClone ? 0.5 : 0.2; // Platform fee 0.2 SOL

            // 1. Perform Payment
            const memo = 'CNM_DELEGATE_AUTOPAY';
            const paymentResult = await pay(fee, 'token_launch', memo);
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
                        checked={revokeMint}
                        onChange={setRevokeMint}
                    />
                    <div className="h-px bg-border/50" />
                    <ToggleRow
                        label="Revoke Freeze Authority"
                        description="Prevents you from freezing holder accounts. Required for many DEX listings."
                        checked={revokeFreeze}
                        onChange={setRevokeFreeze}
                    />
                    <div className="h-px bg-border/50" />
                    <ToggleRow
                        label="Revoke Update Authority"
                        description="Prevents changing metadata (image, name) later. Makes token immutable."
                        checked={revokeUpdate}
                        onChange={setRevokeUpdate}
                    />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 text-orange-400 text-xs">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Revoking authorities is permanent and cannot be undone. Ensure your token is configured correctly.</p>
                </div>
            </div>




            {/* Fees Section */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Service Fee
                    </span>
                    <span className="font-bold text-white">{data.isClone ? '0.5' : '0.2'} SOL</span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                    {data.isClone
                        ? "Includes generic cloning fee, token minting, and authority management."
                        : "Includes token minting, metadata creation, and authority management."}
                </p>
            </div>

            <div className="flex gap-4">
                <Button variant="ghost" className="flex-1" onClick={onBack} disabled={isLoading}>
                    Back
                </Button>
                <Button className="flex-1" size="lg" onClick={handleDeploy} disabled={isLoading} isLoading={isLoading}>
                    {isLoading ? 'Deploying...' : `Deploy Token (${data.isClone ? '0.5' : '0.2'} SOL)`}
                    {!isLoading && <Rocket className="ml-2 h-4 w-4" />}
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
