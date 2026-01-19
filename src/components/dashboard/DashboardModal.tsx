'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Rocket, Droplets, Plus, ExternalLink, LayoutDashboard, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface DashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

interface Token {
    id: string;
    name: string;
    symbol: string;
    address: string;
    image: string | null;
    createdAt: Date;
}

export function DashboardModal({ isOpen, onClose, user }: DashboardModalProps) {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchTokens();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            setMounted(false);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fetchTokens = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/dashboard');
            const data = await res.json();
            if (data.tokens) {
                setTokens(data.tokens);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <LayoutDashboard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Dashboard</h2>
                            <p className="text-xs text-text-muted">Welcome back, {user?.name || 'Creator'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-text-muted text-sm font-medium">Coins Launched</span>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Rocket className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{isLoading ? '-' : tokens.length}</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-text-muted text-sm font-medium">Liquidity Pools</span>
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Droplets className="h-4 w-4 text-blue-500" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">0</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-text-muted text-sm font-medium">Profit Made</span>
                                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">$0.00</div>
                        </div>
                    </div>

                    {/* My Coins Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">My Coins</h3>
                            <Link href="/create-token" onClick={onClose}>
                                <button className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">
                                    <Plus className="h-3 w-3" /> New Coin
                                </button>
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="h-32 flex items-center justify-center text-text-muted animate-pulse">
                                Loading coins...
                            </div>
                        ) : tokens.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                    <Rocket className="h-5 w-5 text-text-muted" />
                                </div>
                                <p className="text-text-muted text-sm">No coins launched yet.</p>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-black/20 text-xs uppercase font-semibold text-text-muted">
                                        <tr>
                                            <th className="px-4 py-3">Token</th>
                                            <th className="px-4 py-3 hidden sm:table-cell">Address</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {tokens.map((token) => (
                                            <tr key={token.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {token.image ? (
                                                            <img src={token.image} alt={token.name} className="h-8 w-8 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                                {token.symbol[0]}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-white">{token.name}</div>
                                                            <div className="text-xs text-text-muted">{token.symbol}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-text-secondary hidden sm:table-cell">
                                                    {token.address}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={`https://solscan.io/token/${token.address}`}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                                    >
                                                        View <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
