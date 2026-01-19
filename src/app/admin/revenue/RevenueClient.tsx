'use client';

import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface RevenueStats {
    totalRevenue: number;
    revenueToday: number;
    revenueThisMont: number;
    totalTransactions: number;
}

export function RevenueClient({ stats }: { stats: RevenueStats }) {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-muted">Total Revenue</span>
                        <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.totalRevenue.toFixed(2)} SOL</div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-muted">Revenue Today</span>
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.revenueToday.toFixed(2)} SOL</div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-muted">Total Transactions</span>
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                            <Calendar className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.totalTransactions}</div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue Sources</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-text-muted">Token Creation Fees (0.1/0.5 SOL)</span>
                            <span className="font-bold text-white">85%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <span className="text-text-muted">Liquidity Pool Fees (0.3 SOL)</span>
                            <span className="font-bold text-white">10%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <span className="text-text-muted">Subscriptions (Auto-Pay)</span>
                            <span className="font-bold text-white">5%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
