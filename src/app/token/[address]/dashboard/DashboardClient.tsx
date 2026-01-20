'use client';

import { useState, useEffect } from 'react';
import { Rocket, Droplets, ExternalLink, Copy, Activity, TrendingUp, AlertTriangle, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface DashboardClientProps {
    tokenAddress: string;
}

export function DashboardClient({ tokenAddress }: DashboardClientProps) {
    const [tokenData, setTokenData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock Data Fetching - simulating API response including clonedFrom
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await new Promise(r => setTimeout(r, 1000));

                setTokenData({
                    name: "Sample Meme Coin",
                    symbol: "MEME",
                    address: tokenAddress,
                    supply: "1,000,000,000",
                    description: "This is a sample meme coin created on the platform.",
                    image: null,
                    creator: "You",
                    status: "active",
                    clonedFrom: "8r4r...k9s2", // Example mock data
                    marketCap: "$12,450",
                    price: "$0.00001245",
                    volume: "$1,200",
                    liquidity: {
                        pair: "SOL / MEME",
                        locked: true,
                        amount: "50 SOL"
                    }
                });
            } catch (error) {
                console.error("Failed to fetch token data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [tokenAddress]);

    if (isLoading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-text-muted">Loading Dashboard...</div>;
    }

    if (!tokenData) return <div>Failed to load token data.</div>;

    return (
        <div className="container py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        {tokenData.name} <span className="text-text-muted text-xl">({tokenData.symbol})</span>
                        <div className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
                            Active
                        </div>
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-text-secondary text-sm font-mono bg-surface p-1.5 rounded-lg border border-border w-fit">
                        <span>{tokenData.address}</span>
                        <button className="hover:text-white transition-colors"><Copy className="h-3 w-3" /></button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" /> View on Solscan
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Rocket className="h-4 w-4" /> Marketing (Coming Soon)
                    </Button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart Area (Left - 2cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Simulated Chart */}
                    <div className="rounded-xl border border-border bg-surface/50 p-6 h-[400px] flex flex-col relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" /> Price Action
                            </h3>
                            <div className="text-right">
                                <div className="text-2xl font-mono text-white font-bold">{tokenData.price}</div>
                                <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                                    <TrendingUp className="h-3 w-3" /> +12.5%
                                </div>
                            </div>
                        </div>

                        {/* Fake Chart Visualization */}
                        <div className="flex-1 w-full bg-black/20 rounded-lg relative flex items-end px-4 pb-4 gap-2">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-primary/20 hover:bg-primary transition-all duration-300 rounded-t-sm"
                                    style={{ height: `${20 + Math.random() * 60}%` }}
                                />
                            ))}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="px-3 py-1 bg-black/50 backdrop-blur rounded-full text-xs text-text-muted">Simulated Live Data</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-border bg-surface/30">
                            <div className="text-xs text-text-secondary uppercase">Market Cap</div>
                            <div className="text-xl font-bold text-white mt-1">{tokenData.marketCap}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-surface/30">
                            <div className="text-xs text-text-secondary uppercase">24h Volume</div>
                            <div className="text-xl font-bold text-white mt-1">{tokenData.volume}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-surface/30">
                            <div className="text-xs text-text-secondary uppercase">Holders</div>
                            <div className="text-xl font-bold text-white mt-1">1</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right - 1col) */}
                <div className="space-y-6">
                    {/* Cloned From Info */}
                    {tokenData.clonedFrom && (
                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 flex gap-3 items-center">
                            <GitFork className="h-5 w-5 text-violet-400 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-violet-200">Cloned Token</h4>
                                <p className="text-xs text-violet-300/80">
                                    Replicated from <span className="font-mono bg-black/20 px-1 rounded">{tokenData.clonedFrom}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Liquidity Info */}
                    <div className="rounded-xl border border-border bg-surface/50 p-6">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                            <Droplets className="h-5 w-5 text-blue-500" /> Liquidity Pool
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Pair</span>
                                <span className="text-white font-medium">{tokenData.liquidity.pair}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Initial Liq</span>
                                <span className="text-white font-medium">{tokenData.liquidity.amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Status</span>
                                <span className="flex items-center gap-1.5 text-green-500 font-medium">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Active & Locked
                                </span>
                            </div>
                            <div className="pt-4 border-t border-border/50">
                                <Button variant="secondary" className="w-full text-xs h-8">
                                    Manage Liquidity
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Token Info */}
                    <div className="rounded-xl border border-border bg-surface/50 p-6">
                        <h3 className="font-bold text-white mb-4">Token Info</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="block text-text-secondary text-xs">Total Supply</span>
                                <span className="text-white font-mono">{tokenData.supply}</span>
                            </div>
                            <div>
                                <span className="block text-text-secondary text-xs">Creator</span>
                                <span className="text-white truncate block">{tokenData.creator}</span>
                            </div>
                            <div>
                                <span className="block text-text-secondary text-xs">Description</span>
                                <p className="text-text-muted mt-1 leading-relaxed text-xs">
                                    {tokenData.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Alert */}
                    <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-orange-400">Trading Caution</h4>
                            <p className="text-xs text-orange-500/80">Make sure to verify all authorities before promoting your token.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
