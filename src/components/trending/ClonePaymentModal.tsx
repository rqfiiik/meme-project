'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { EnrichedTokenProfile } from '@/lib/dexscreener';

interface ClonePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: EnrichedTokenProfile;
    targetUrl: string;
}

const CLONE_FEE = 0.5;

export function ClonePaymentModal({ isOpen, onClose, token, targetUrl }: ClonePaymentModalProps) {
    const router = useRouter();

    const handleConfirm = () => {
        // Redirection to wizard - Payment will be handled at deployment step
        const promoInput = document.getElementById('promo-code-input') as HTMLInputElement;
        let finalUrl = targetUrl;

        if (promoInput && promoInput.value.trim()) {
            const separator = finalUrl.includes('?') ? '&' : '?';
            finalUrl = `${finalUrl}${separator}ref=${promoInput.value.trim()}`;
        }

        onClose();
        router.push(finalUrl);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-surface text-white border-border">
                <DialogHeader>
                    <DialogTitle>Clone {token.market?.baseToken?.symbol || "Token"}</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                        You are about to create a replica of this token.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Promo Code Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Creator Promo Code (Optional)</label>
                        <input
                            type="text"
                            placeholder="Enter code (e.g. OGHLO)"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                            id="promo-code-input" // Simple ID access or better state
                        />
                    </div>

                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20">
                        <span className="font-medium text-primary">Service Fee</span>
                        <span className="font-bold text-white text-lg">{CLONE_FEE} SOL</span>
                    </div>
                    <ul className="text-sm text-text-muted space-y-2 list-disc pl-4">
                        <li>Instant parameter replication</li>
                        <li>Token deployment included</li>
                        <li>Authority management included</li>
                    </ul>
                    <p className="text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                        Note: Fee will be collected at the final deployment step.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm}>
                        Proceed to Setup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
