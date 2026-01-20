'use client';

import { TrendingUp, DollarSign, PieChart, Info } from 'lucide-react';

interface RevenueData {
    total: number;
    breakdown: {
        name: string;
        value: number;
        percentage: number;
    }[];
    transactions: any[];
}

export function RevenueClient({ data }: { data: RevenueData }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-text-muted text-sm font-medium">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-white mt-1">
                                {data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} SOL
                            </h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                    <div className="text-sm text-green-500 font-medium">
                        Based on {data.transactions.length} successful transactions
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold text-white">Revenue Sources</h2>
                    </div>

                    <div className="space-y-6">
                        {data.breakdown.map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white capitalize font-medium">{item.name.replace('_', ' ')}</span>
                                    <span className="text-white font-mono">{item.value.toFixed(2)} SOL ({item.percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary/80 rounded-full transition-all duration-500"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {data.breakdown.length === 0 && (
                            <div className="text-center text-text-muted py-8">No revenue data available yet.</div>
                        )}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="h-5 w-5 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Insights</h2>
                    </div>
                    <div className="text-text-muted space-y-4">
                        <p>
                            Revenue is generated from multiple sources including Token Creation fees, Liquidity Pool setup fees, coin copying fees, and recurring usage subscriptions.
                        </p>
                        <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            <h4 className="text-white font-medium mb-2">Top Performer</h4>
                            {data.breakdown.length > 0 ? (
                                <p className="text-sm">
                                    <span className="text-primary font-bold capitalize">{data.breakdown[0].name.replace('_', ' ')}</span> is currently the leading revenue source, contributing <span className="text-white">{data.breakdown[0].percentage.toFixed(1)}%</span> of total income.
                                </p>
                            ) : (
                                <p className="text-sm">Not enough data to generate insights.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
