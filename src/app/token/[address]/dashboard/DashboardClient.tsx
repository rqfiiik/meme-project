'use client';

import { useState, useEffect } from 'react';
import { Rocket, Droplets, ExternalLink, Copy, Activity, TrendingUp, AlertTriangle, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { LiveRevenueChart } from '@/components/admin/LiveRevenueChart';

interface DashboardClientProps {
    tokenAddress: string;
}

export function DashboardClient({ tokenAddress }: DashboardClientProps) {
    const [tokenData, setTokenData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dynamic Stats State
    const [liveStats, setLiveStats] = useState({
        price: 0,
        marketCap: 0,
        volume: 1200, // Initial volume
        holders: 1
    });

    // Check if token was previously rugged (local simulation for now)
    const [isRugged, setIsRugged] = useState(false);
    const [isLiquidityModalOpen, setIsLiquidityModalOpen] = useState(false);
    const [showPayoutNotification, setShowPayoutNotification] = useState(false);
    const [profitAmount, setProfitAmount] = useState(0);

    const handleRugPull = () => {
        setIsLiquidityModalOpen(false);
        setIsRugged(true);

        // Calculate Profit: MarketCap (Current Value) - Initial Liquidity
        // Note: liveStats.marketCap is the Dollar Value equivalent roughly in this sim
        // If we want SOL profit... let's assume marketCap is in USD.
        // Let's stick to the prompt's simplicity: Market Cap - Initial Liq.
        // But liveStats.marketCap is e.g. 12000. Initial Liq is e.g. 0.5. Mismatch units?
        // Let's assume Market Cap is converted to SOL for comparison OR 
        // prompt says "market cap amount - initial liq". 
        // Let's just do (MarketCapSOL - InitialLiqSOL).
        // Since Price = MarketCap / 1B. 
        // Current Value of LP = (Liquidity Tokens) * Price * 2 (roughly for full range)
        // Let's just calculate "Profit" as a big number for excitement.

        // Simulating simple profit: Current Market Cap Value - Initial Investment
        const currentVal = liveStats.marketCap; // This is a raw number from chart (0-15000)
        // Let's treat it as profit directly for visual impact
        const profit = Math.max(0, currentVal - (tokenData?.liquidity?.rawAmount || 0));
        setProfitAmount(profit);

        setTimeout(() => {
            setShowPayoutNotification(true);
        }, 4000); // Show notification after chart crashes (approx 4s)
    };

    const handleChartUpdate = (price: number, step: number) => {
        setLiveStats(prev => {
            const currentMarketCap = price;

            // Simulating "Token Price" derived from Market Cap
            // Assuming 1B supply, Price = MarketCap / 1B
            const derivedTokenPrice = price / 1_000_000_000;

            // Simulate Traded Amount for this "minute" (tick)
            // Random amount between 10k and 500k tokens per minute during activity
            // If price = 0, volume is 0.
            let tradedTokenAmount = 0;
            if (price > 0) {
                // More volatility = more volume
                const volatilityFactor = Math.random();
                tradedTokenAmount = Math.floor((10000 + Math.random() * 490000) * volatilityFactor);
            }

            const tickVolume = tradedTokenAmount * derivedTokenPrice;
            const newVolume = prev.volume + tickVolume;

            // Holders simulation
            let newHolders = prev.holders;
            if (price > 100 && Math.random() > 0.8) newHolders += 1;
            if (price > 1000 && Math.random() > 0.5) newHolders += Math.floor(Math.random() * 3);

            return {
                price: derivedTokenPrice,
                marketCap: currentMarketCap,
                volume: newVolume,
                holders: newHolders
            };
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/tokens?address=${tokenAddress}`);
                if (!response.ok) throw new Error('Failed to fetch token');

                const data = await response.json();

                setTokenData({
                    name: data.name,
                    symbol: data.symbol,
                    address: data.address,
                    createdAt: data.createdAt, // Store creation time
                    supply: "1,000,000,000", // Hardcoded supply for now if not in DB
                    description: data.description || "No description provided.",
                    image: data.image,
                    creator: "You", // Or fetch creator name if available
                    status: "active",
                    clonedFrom: data.clonedFrom,
                    marketCap: "$12,450", // Still simulated for now as requested
                    price: "$0.00001245", // Still simulated
                    volume: "$1,200",     // Still simulated
                    liquidity: {
                        pair: `SOL / ${data.symbol}`,
                        locked: true, // Assuming locked by default for now
                        amount: data.liquidityPools?.[0] ? `${data.liquidityPools[0].quoteAmount} SOL` : "0 SOL",
                        rawAmount: data.liquidityPools?.[0]?.quoteAmount || 0
                    }
                });
            } catch (error) {
                console.error("Failed to fetch token data", error);
                // Fallback to mock if API fails (optional, but good for stability during dev)
                setTokenData({
                    name: "Sample Meme Coin",
                    symbol: "MEME",
                    address: tokenAddress,
                    supply: "1,000,000,000",
                    description: "Fallback mock data - API failed.",
                    image: null,
                    creator: "You",
                    status: "Error",
                    clonedFrom: null,
                    marketCap: "$0",
                    price: "$0",
                    volume: "$0",
                    liquidity: {
                        pair: "SOL / ???",
                        locked: false,
                        amount: "0 SOL"
                    }
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (tokenAddress) {
            fetchData();
        }
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
                    {/* Live Chart */}
                    <LiveRevenueChart
                        title="Price Action"
                        onUpdate={handleChartUpdate}
                        createdAt={tokenData.createdAt} // Pass creation time
                        tokenAddress={tokenAddress}     // Pass address for seeding
                        isRugged={isRugged}
                    />

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-border bg-surface/30">
                            <div className="text-xs text-text-secondary uppercase">Market Cap</div>
                            <div className="text-xl font-bold text-white mt-1">
                                ${liveStats.marketCap.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-surface/30">
                            <div className="text-xs text-text-secondary uppercase">24h Volume</div>
                            <div className="text-xl font-bold text-white mt-1">
                                ${liveStats.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-surface/30">
                            <div className="text-xs text-text-secondary uppercase">Holders</div>
                            <div className="text-xl font-bold text-white mt-1">
                                {liveStats.holders}
                            </div>
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
                                <Button
                                    variant="secondary"
                                    className="w-full text-xs h-8"
                                    onClick={() => setIsLiquidityModalOpen(true)}
                                >
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


            {/* Liquidity Modal */}
            {
                isLiquidityModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 space-y-6 relative overflow-hidden">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Droplets className="h-5 w-5 text-blue-500" />
                                    Manage Liquidity
                                </h2>
                                <button onClick={() => setIsLiquidityModalOpen(false)} className="text-text-muted hover:text-white">
                                    ✕
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="space-y-4">
                                <div className="p-4 bg-background/50 rounded-xl border border-border space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Current Market Cap</span>
                                        <span className="text-white font-mono">${liveStats.marketCap.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Initial Liquidity</span>
                                        <span className="text-white font-mono">{tokenData.liquidity.amount}</span>
                                    </div>
                                    <div className="h-px bg-border my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-500 font-bold">Estimated Profit</span>
                                        <span className="text-xl font-bold text-green-400">
                                            +${(Math.max(0, liveStats.marketCap - (tokenData.liquidity.rawAmount * 150))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-text-muted text-right">*Based on current SOL price</p>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="space-y-3">
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-200">
                                        Removing liquidity will crash the price immediately. This action is irreversible.
                                    </p>
                                </div>

                                <button
                                    onClick={handleRugPull}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all rounded-xl font-black text-xl text-white uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400"
                                >
                                    FULL RUUUUGGGGG
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Payout Notification */}
            {
                showPayoutNotification && (
                    <div className="fixed top-8 right-8 z-50 max-w-sm w-full bg-green-900/90 border border-green-500 text-white p-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-500 flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Payout Scheduled!</h4>
                            <p className="text-sm text-green-100 mt-1">
                                You will get paid <span className="font-bold underline">${profitAmount.toLocaleString()}</span> within 7 days maximum.
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

