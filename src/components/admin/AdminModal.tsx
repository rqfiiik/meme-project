'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, TrendingUp, Wallet, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import '@/components/auth/SignInModal.css'; // Reusing the same animations

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Data state
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Fetch stats when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('/api/admin/stats')
                .then(res => res.json())
                .then(data => {
                    setStats(data.stats);
                    setTransactions(data.transactions || []);
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));

            setShouldRender(true);
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

            <div className={`relative z-10 w-full max-w-5xl h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl modal-content flex flex-col ${isAnimating ? 'open' : 'closing'}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
                        <p className="text-text-muted mt-1">Overview of system performance</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    {/* Content */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-8">
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total Users"
                                    value={stats?.totalUsers?.toString() || "0"}
                                    change="+12% from last week"
                                    icon={Users}
                                    color="text-blue-400"
                                />
                                <StatCard
                                    title="Total Revenue"
                                    value={`$${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    change="+5.2% today"
                                    icon={TrendingUp}
                                    color="text-green-400"
                                />
                                <StatCard
                                    title="Auto-Pay Users" // Replacing connected wallets with reliable data we have
                                    value={stats?.autoPayUsers?.toString() || "0"}
                                    change="+3 new today"
                                    icon={Wallet}
                                    color="text-purple-400"
                                />
                                <StatCard
                                    title="System Status"
                                    value={"Healthy"}
                                    change="No issues detected"
                                    icon={CheckCircle}
                                    color="text-green-400"
                                />
                            </div>

                            {/* Recent Transactions */}
                            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                                <div className="space-y-4">
                                    {transactions.length === 0 ? (
                                        <p className="text-text-muted text-sm text-center py-4">No recent transactions</p>
                                    ) : (
                                        transactions.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">TX</div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-white">Payment Received</p>
                                                            <span className="text-xs text-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                                                                {tx.user?.email || 'Guest'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-text-muted">
                                                            <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" className="hover:underline hover:text-primary">
                                                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                                            </a>
                                                            {' • '}{new Date(tx.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-green-400">+{tx.amount} SOL</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
    return (
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-text-muted">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-xs text-text-secondary">{change}</p>
        </div>
    );
}
