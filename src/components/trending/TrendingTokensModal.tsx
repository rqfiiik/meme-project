'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw } from 'lucide-react';
import { TokenGrid } from './TokenGrid';
import { EnrichedTokenProfile } from '@/lib/dexscreener';
import '@/components/auth/SignInModal.css'; // Reusing animations

interface TrendingTokensModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TrendingTokensModal({ isOpen, onClose }: TrendingTokensModalProps) {
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const [tokens, setTokens] = useState<EnrichedTokenProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const fetchTokens = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/trending');
            if (res.ok) {
                const data = await res.json();
                setTokens(data.tokens || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Open/Close
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            fetchTokens(); // Fetch on open

            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Prevent scrolling
    useEffect(() => {
        if (shouldRender) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [shouldRender]);

    if (!mounted || !shouldRender) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center modal-overlay ${isAnimating ? 'open' : 'closing'}`}>
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className={`relative z-10 w-full max-w-7xl h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl modal-content flex flex-col ${isAnimating ? 'open' : 'closing'}`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-8 shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Copy Trending Tokens</h2>
                        <p className="text-text-muted mt-1 max-w-2xl">
                            Find successful tokens on Solana and clone their branding instantly.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    {isLoading && tokens.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        // We override the internal Refresh behavior of TokenGrid by managing data here or just let it render our fresh data
                        // Since TokenGrid has its own state, we might need to pass a key to force re-render if we want it to update from props completely
                        // or better, we update TokenGrid.tsx next to accept "data" and "isLoading" controlled props.
                        // For now, passing initialData is fine as we mount a new instance technically or we key it.
                        // Let's key it with timestamp to force full refresh if needed, or rely on TokenGrid's internal state if we don't change it.
                        <TokenGrid initialData={tokens} onRefresh={fetchTokens} onClone={onClose} />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
