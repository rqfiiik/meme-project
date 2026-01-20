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
        onClose();
        router.push(targetUrl);
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
