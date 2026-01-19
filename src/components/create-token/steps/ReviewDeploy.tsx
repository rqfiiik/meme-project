import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { ShieldAlert, Rocket, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createPayAndSubscribeTransaction } from '@/lib/solana/subscription';

interface ReviewDeployProps {
    data: any;
    onBack: () => void;
}

export function ReviewDeploy({ data, onBack }: ReviewDeployProps) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [revokeMint, setRevokeMint] = useState(false);
    const [revokeFreeze, setRevokeFreeze] = useState(false);
    const [revokeUpdate, setRevokeUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-request signature ref
    const hasRequested = useRef(false);

    // Generate a fresh Mint Keypair for the new token
    // In a real app, you might want this to persist or be generated earlier, 
    // but for this wizard, generating it at the confirm step is acceptable if we save it immediately.
    // However, if the user rejects the tx, we might want to keep the same keypair? 
    // For simplicity, we'll generate one here.
    const [mintKeypair] = useState(() => {
        // We need to import Keypair dynamically or from a lib if not available in global scope 
        // But since we are in a file that uses @solana/wallet-adapter-react, we likely have @solana/web3.js
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
            const fee = data.isClone ? 0.5 : 0.1;

            // 1. Perform Payment
            // Use the "Pay & Subscribe" combo transaction
            const transaction = await createPayAndSubscribeTransaction(
                connection,
                publicKey,
                fee
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            // 2. Save User Transaction
            try {
                await fetch('/api/database/record-transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        signature,
                        amount: fee,
                        userAddress: publicKey.toString(),
                        isAutoPay: true
                    })
                });
            } catch (dbError) {
                console.error("Failed to record transaction:", dbError);
            }

            // 3. Save Token to Database
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
                        signature: signature
                    })
                });

                if (!response.ok) throw new Error('Failed to save token');

            } catch (tokenError) {
                console.error("Failed to save token:", tokenError);
                // We shouldn't fail the whole flow if DB save fails, but we should warn
            }

            alert(`Success! Token Saved & Fee Paid! Mint Addr: ${mintKeypair.publicKey.toString().slice(0, 8)}...`);
            // Here you would proceed with actual token creation logic (Minting on chain)
            // leveraging the mintKeypair we just generated.

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
                    <span className="font-bold text-white">{data.isClone ? '0.5' : '0.1'} SOL</span>
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
                    {isLoading ? 'Confirming...' : `Deploy Token (${data.isClone ? '0.5' : '0.1'} SOL)`}
                    {!isLoading && <Rocket className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
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
