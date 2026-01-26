'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Rocket, Droplets, Plus, ExternalLink, LayoutDashboard, DollarSign } from 'lucide-react';
import Link from 'next/link';
import '@/components/auth/SignInModal.css';

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
    status?: string;
}

export function DashboardModal({ isOpen, onClose, user }: DashboardModalProps) {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        coinsLaunched: 0,
        totalFeesPaid: 0,
        walletCount: 0,
        activeSubscriptions: 0
    });
    const [accountStatus, setAccountStatus] = useState('active');

    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchDashboardData();
            setShouldRender(true);
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/dashboard');
            const data = await res.json();

            if (data.tokens) setTokens(data.tokens);
            if (data.wallets) setWallets(data.wallets);
            if (data.subscriptions) setSubscriptions(data.subscriptions);
            if (data.stats) setStats(data.stats);
            if (data.accountStatus) setAccountStatus(data.accountStatus);

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted || !shouldRender) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center modal-overlay ${isAnimating ? 'open' : 'closing pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative z-10 w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] modal-content ${isAnimating ? 'open' : 'closing'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <LayoutDashboard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">Dashboard</h2>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${accountStatus === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {accountStatus}
                                </span>
                            </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Launched</span>
                                <Rocket className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-2xl font-bold text-white">{isLoading ? '-' : stats.coinsLaunched}</div>
                            <div className="text-xs text-text-muted mt-1">Total Coins</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Fees Paid</span>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="text-2xl font-bold text-white">{isLoading ? '-' : `${stats.totalFeesPaid.toFixed(2)} SOL`}</div>
                            <div className="text-xs text-text-muted mt-1">Lifetime</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Wallets</span>
                                <div className="h-4 w-4 text-purple-500">💳</div>
                            </div>
                            <div className="text-2xl font-bold text-white">{isLoading ? '-' : stats.walletCount}</div>
                            <div className="text-xs text-text-muted mt-1">Linked</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Subscription</span>
                                <div className="h-4 w-4 text-blue-500">✨</div>
                            </div>
                            <div className="text-2xl font-bold text-white">{isLoading ? '-' : stats.activeSubscriptions}</div>
                            <div className="text-xs text-text-muted mt-1">Active Plans</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* My Coins Table */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">My Coins</h3>
                                <Link href="/create-token" onClick={onClose}>
                                    <button className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">
                                        <Plus className="h-3 w-3" /> New
                                    </button>
                                </Link>
                            </div>

                            {isLoading ? (
                                <div className="h-32 flex items-center justify-center text-text-muted animate-pulse border border-white/5 rounded-xl">
                                    Loading...
                                </div>
                            ) : tokens.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                    <p className="text-text-muted text-sm">No coins launched yet.</p>
                                </div>
                            ) : (
                                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden max-h-[300px] overflow-y-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-black/20 text-xs uppercase font-semibold text-text-muted sticky top-0 backdrop-blur-md">
                                            <tr>
                                                <th className="px-4 py-3">Token</th>
                                                <th className="px-4 py-3 text-right">Action</th>
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
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-medium text-white">{token.name}</div>
                                                                    {token.status === 'rugged' && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold tracking-wider">
                                                                            Rugged
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-text-muted">{token.symbol}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link
                                                            href={`/token/${token.address}/dashboard`}
                                                            onClick={onClose}
                                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                                        >
                                                            Manage <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Wallets & Subs Column */}
                        <div className="space-y-6">
                            {/* Wallets */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Linked Wallets</h3>
                                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                    {wallets.length === 0 ? (
                                        <div className="p-4 text-center text-text-muted text-sm">No wallets linked.</div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {wallets.map((w: any) => (
                                                <div key={w.id} className="flex justify-between items-center p-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                                        <span className="font-mono text-text-secondary">{w.address.slice(0, 4)}...{w.address.slice(-4)}</span>
                                                        {w.label && <span className="text-[10px] bg-white/10 px-1.5 rounded">{w.label}</span>}
                                                    </div>
                                                    <span className="text-xs text-text-muted">{w.solBalance.toFixed(2)} SOL</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subscriptions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Subscriptions</h3>
                                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                    {subscriptions.length === 0 ? (
                                        <div className="p-4 text-center text-text-muted text-sm">No active subscriptions.</div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {subscriptions.map((s: any) => (
                                                <div key={s.id} className="p-3 text-sm flex justify-between items-center">
                                                    <div>
                                                        <div className="font-bold text-white capitalize">{s.planType} Plan</div>
                                                        <div className="text-xs text-text-muted">Next billing: {s.nextPayment ? new Date(s.nextPayment).toLocaleDateString() : 'N/A'}</div>
                                                    </div>
                                                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">Active</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
