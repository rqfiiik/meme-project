'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { DollarSign, ExternalLink, RefreshCw, CheckCircle, Wallet, User as UserIcon } from 'lucide-react';

interface Creator {
    id: string;
    name: string | null;
    email: string | null;
    walletAddress: string | null;
    promoCode: string | null;
    referredCount: number;
    expectedPayment: number;
}

export default function AdminCreatorsPage() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            const res = await fetch('/api/admin/creators');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCreators(data);
            }
        } catch (error) {
            console.error("Failed to fetch creators", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkPaid = async (creatorId: string) => {
        if (!confirm("Are you sure you want to mark these earnings as PAID? This will reset the expected payment amount.")) return;

        setProcessingId(creatorId);
        try {
            const res = await fetch('/api/admin/creators/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorId })
            });

            if (res.ok) {
                // Refresh list or optimistic update
                setCreators(prev => prev.map(c =>
                    c.id === creatorId ? { ...c, expectedPayment: 0 } : c
                ));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            alert("Error processing request");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Creators Management</h1>
                    <p className="text-text-muted mt-2">Manage affiliate creators and payouts.</p>
                </div>
                <Button variant="ghost" onClick={fetchCreators} disabled={isLoading} className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-xs uppercase font-bold text-text-muted">
                            <tr>
                                <th className="px-6 py-4">Creator</th>
                                <th className="px-6 py-4">Promo Code</th>
                                <th className="px-6 py-4">Wallet Address</th>
                                <th className="px-6 py-4 text-center">Referrals</th>
                                <th className="px-6 py-4 text-right">Unpaid Earnings</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {creators.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        No creators found.
                                    </td>
                                </tr>
                            ) : (
                                creators.map((creator) => (
                                    <tr key={creator.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    <UserIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{creator.name || 'Unknown'}</div>
                                                    <div className="text-xs text-text-muted">{creator.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {creator.promoCode ? (
                                                <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-mono font-bold tracking-wider border border-purple-500/20">
                                                    {creator.promoCode}
                                                </span>
                                            ) : (
                                                <span className="text-text-muted italic">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                                            {creator.walletAddress ? (
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="h-3 w-3 text-text-muted" />
                                                    {creator.walletAddress}
                                                </div>
                                            ) : (
                                                <span className="text-text-muted">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-white">
                                            {creator.referredCount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-lg font-bold ${creator.expectedPayment > 0 ? 'text-green-400' : 'text-text-muted'}`}>
                                                {creator.expectedPayment.toFixed(2)} SOL
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={creator.expectedPayment <= 0 || processingId === creator.id}
                                                onClick={() => handleMarkPaid(creator.id)}
                                                className={`
                                                    ${creator.expectedPayment > 0
                                                        ? 'border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50'
                                                        : 'opacity-50 cursor-not-allowed'}
                                                `}
                                            >
                                                {processingId === creator.id ? 'Processing...' : (
                                                    <span className="flex items-center gap-2">
                                                        <CheckCircle className="h-3 w-3" /> Mark Paid
                                                    </span>
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
