'use client';

import { useState, useEffect } from 'react';
import { Rocket, Users, DollarSign, RefreshCw } from 'lucide-react';

export default function AdminDashboardClient() {
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-text-muted mt-1">Track revenue, users, and subscriptions.</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="p-2 bg-surface border border-border rounded-lg hover:bg-surface/80 transition-colors"
                    >
                        <RefreshCw className="h-5 w-5 text-primary" />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={`${stats?.totalRevenue.toFixed(2) || 0} SOL`}
                        icon={<DollarSign className="h-6 w-6 text-green-400" />}
                    />
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={<Users className="h-6 w-6 text-blue-400" />}
                    />
                    <StatCard
                        title="Auto-Pay Enabled"
                        value={stats?.autoPayUsers || 0}
                        icon={<Rocket className="h-6 w-6 text-yellow-400" />}
                    />
                    {/* The "Dashboard Coin" - All Tokens View Placeholder/Stat */}
                    <StatCard
                        title="Total Tokens"
                        value={transactions.length} // Proxy for now
                        icon={<div className="font-bold text-xs">ALL</div>}
                    />
                </div>

                {/* Recent Transactions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Recent Transactions</h2>
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="p-4 font-medium text-text-secondary">Signature</th>
                                    <th className="p-4 font-medium text-text-secondary">Amount</th>
                                    <th className="p-4 font-medium text-text-secondary">User</th>
                                    <th className="p-4 font-medium text-text-secondary">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-xs text-primary truncate max-w-[150px]">
                                            <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noreferrer" className="hover:underline">
                                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                                            </a>
                                        </td>
                                        <td className="p-4 font-bold text-white">{tx.amount} SOL</td>
                                        <td className="p-4 font-mono text-xs text-text-muted">{tx.user?.address?.slice(0, 6)}...</td>
                                        <td className="p-4 text-text-muted">{new Date(tx.date).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-text-muted">No transactions yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: any) {
    return (
        <div className="bg-surface border border-border p-6 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-sm text-text-muted font-medium uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white">
                {icon}
            </div>
        </div>
    );
}
