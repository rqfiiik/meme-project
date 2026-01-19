'use client';

import { Users, TrendingUp, Wallet, AlertTriangle } from 'lucide-react';

interface AdminOverviewClientProps {
    totalUsers: number;
    totalRevenue: number;
    connectedWallets: number;
    failedTx: number;
}

export function AdminOverviewClient({ totalUsers, totalRevenue, connectedWallets, failedTx }: AdminOverviewClientProps) {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={totalUsers.toString()}
                    change="+12% from last week"
                    icon={Users}
                    color="text-blue-400"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    change="+5.2% today"
                    icon={TrendingUp}
                    color="text-green-400"
                />
                <StatCard
                    title="Connected Wallets"
                    value={connectedWallets.toString()}
                    change="+3 new today"
                    icon={Wallet}
                    color="text-purple-400"
                />
                <StatCard
                    title="Failed Transactions"
                    value={failedTx.toString()}
                    change="Needs attention"
                    icon={AlertTriangle}
                    color="text-red-400"
                />
            </div>

            {/* Chart / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 h-80 flex flex-col justify-center items-center text-text-muted">
                    <p>Revenue Chart Placeholder</p>
                    <span className="text-xs">(Requires chart library)</span>
                </div>
                <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">TX</div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Payment Received</p>
                                        <p className="text-xs text-text-muted">0x...1234 • 2 mins ago</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-green-400">+0.5 SOL</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
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
