'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, TrendingUp, Wallet, CheckCircle, LayoutDashboard, CreditCard, FileText } from 'lucide-react';
import '@/components/auth/SignInModal.css'; // Reusing the same animations
import { UsersClient } from '@/app/admin/users/UsersClient';
import { TransactionsClient } from '@/app/admin/transactions/TransactionsClient';
import { RevenueClient } from '@/app/admin/revenue/RevenueClient';
import { SubscriptionsClient } from '@/app/admin/subscriptions/SubscriptionsClient';
import { WalletsClient } from '@/app/admin/wallets/WalletsClient';
import { LogsClient } from '@/app/admin/logs/LogsClient';
import { AdminBlogClient } from '@/app/admin/blog/AdminBlogClient';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data state
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [revenueStats, setRevenueStats] = useState<any>(null);

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
                    setUsers(data.users || []);
                    setLogs(data.logs || []);

                    // Calculate Revenue Stats Client-side
                    const allTx = data.transactions || [];
                    const today = new Date();
                    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                    const revenueToday = allTx
                        .filter((tx: any) => new Date(tx.date) >= startOfDay)
                        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

                    const revenueThisMonth = allTx
                        .filter((tx: any) => new Date(tx.date) >= startOfMonth)
                        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

                    setRevenueStats({
                        total: data.stats?.totalRevenue || 0,
                        transactions: allTx,
                        breakdown: [
                            { name: 'token_launch', value: data.stats?.totalRevenue || 0, percentage: 100 } // simplified for now
                        ]
                    });
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

            <div className={`relative z-10 w-full max-w-7xl h-[90vh] overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl modal-content flex ${isAnimating ? 'open' : 'closing'}`}>

                {/* Sidebar */}
                <div className="w-64 border-r border-white/10 bg-surface/50 p-6 flex flex-col shrink-0">
                    <h2 className="text-xl font-bold text-white mb-8 px-2">Admin Panel</h2>
                    <nav className="space-y-1 flex-1 overflow-y-auto">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <Users className="h-4 w-4" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <CreditCard className="h-4 w-4" />
                            Transactions
                        </button>
                        <div className="h-px bg-white/5 my-2 mx-2" />
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'subscriptions' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Subscriptions
                        </button>
                        <button
                            onClick={() => setActiveTab('wallets')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'wallets' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <Wallet className="h-4 w-4" />
                            Wallets
                        </button>
                        <button
                            onClick={() => setActiveTab('revenue')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'revenue' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Revenue
                        </button>
                        <button
                            onClick={() => setActiveTab('blog')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'blog' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <FileText className="h-4 w-4" />
                            Blog
                        </button>
                        <div className="h-px bg-white/5 my-2 mx-2" />
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <FileText className="h-4 w-4" />
                            Logs
                        </button>
                    </nav>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-sm text-text-muted hover:text-white mt-auto px-2"
                    >
                        <X className="h-4 w-4" />
                        Close
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-background p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="h-full">
                            {activeTab === 'dashboard' && (
                                <div className="space-y-8">
                                    <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
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
                                            title="Auto-Pay Users"
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

                                    {/* Recent Transactions Preview */}
                                    <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                                            <button onClick={() => setActiveTab('transactions')} className="text-sm text-primary hover:underline">View All</button>
                                        </div>
                                        <div className="space-y-4">
                                            {transactions.slice(0, 5).map((tx) => (
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
                                                                {new Date(tx.date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-green-400">+{tx.amount} SOL</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && <UsersClient users={users} />}
                            {activeTab === 'transactions' && <TransactionsClient transactions={transactions} />}
                            {activeTab === 'subscriptions' && <SubscriptionsClient subscriptions={users as any[]} />}
                            {activeTab === 'wallets' && <WalletsClient wallets={users as any[]} />}
                            {activeTab === 'revenue' && revenueStats && <RevenueClient data={revenueStats} />}
                            {activeTab === 'blog' && <AdminBlogClient />}
                            {activeTab === 'logs' && <LogsClient logs={logs} />}
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
