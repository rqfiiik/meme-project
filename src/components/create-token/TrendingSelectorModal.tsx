'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Search, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';
import { EnrichedTokenProfile } from '@/lib/dexscreener';

interface TrendingSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (token: EnrichedTokenProfile) => void;
}

export function TrendingSelectorModal({ isOpen, onClose, onSelect }: TrendingSelectorModalProps) {
    const [tokens, setTokens] = useState<EnrichedTokenProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen && tokens.length === 0) {
            fetchTokens();
        }
    }, [isOpen]);

    const fetchTokens = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/trending');
            const data = await res.json();
            if (data.tokens) {
                setTokens(data.tokens);
            }
        } catch (error) {
            console.error("Failed to fetch trending tokens", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTokens = tokens.filter(t =>
        t.market?.baseToken?.name.toLowerCase().includes(search.toLowerCase()) ||
        t.market?.baseToken?.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-[#0a0a0a] border-white/10 text-white max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select a Trending Coin to Clone</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or symbol..."
                        className="w-full bg-surface/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mt-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredTokens.length > 0 ? (
                        filteredTokens.map((token) => (
                            <div
                                key={token.tokenAddress}
                                onClick={() => {
                                    onSelect(token);
                                    onClose();
                                }}
                                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/30 cursor-pointer group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-black border border-white/10">
                                        {token.icon ? (
                                            <Image src={token.icon} alt={token.market?.baseToken?.symbol || 'Token'} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-text-muted">?</div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{token.market?.baseToken?.name}</h4>
                                        <span className="text-xs text-text-secondary">{token.market?.baseToken?.symbol}</span>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Clone
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-text-muted text-sm">
                            No tokens found.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
