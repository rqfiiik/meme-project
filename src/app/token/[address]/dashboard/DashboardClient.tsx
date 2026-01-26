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

    // Initialize rugged state from prop if available (will be handled in effect below/fetching)
    useEffect(() => {
        if (tokenData?.status === 'rugged') {
            setIsRugged(true);
        }
    }, [tokenData?.status]);

    // Reset state when tokenAddress changes to prevent stale data
    useEffect(() => {
        setIsRugged(false);
        setIsLiquidityModalOpen(false);
        setLiveStats({
            price: 0,
            marketCap: 0, // Start at 0
            volume: 0,    // Start fresh volume for new token
            holders: 1
        });
        setTokenData(null);
        setIsLoading(true);
    }, [tokenAddress]);

    const handleRugPull = async () => {
        if (!confirm("Are you sure you want to RUG PULL? This will crash the price to $0.")) return;
        setIsLoading(true);

        try {
            // Calculate profit before crashing the price
            const currentVal = liveStats.marketCap;
            const profit = Math.max(0, currentVal - (tokenData?.liquidity?.rawAmount || 0));
            setProfitAmount(profit);

            // Call API to persist rugged status AND save snapshot
            const response = await fetch('/api/tokens/rug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenAddress,
                    stats: liveStats // Send snapshot of stats
                })
            });

            if (!response.ok) throw new Error('Failed to rug token');

            // Update Local State immediately
            setTokenData((prev: any) => ({ ...prev, status: 'rugged' }));
            setIsRugged(true);

            // Force stats to "Rugged" state
            setLiveStats(prev => ({
                ...prev,
                price: 0,
                marketCap: 0,
                // volume: prev.volume, // Keep existing volume (snapshot logic verified in API)
                holders: 0
            }));

            // Close modal
            setIsLiquidityModalOpen(false);

            // Show Payout Notification after a delay
            setTimeout(() => {
                setShowPayoutNotification(true);
            }, 500);

            alert("RUG PULL SUCCESSFUL. Liquidity drained.");

        } catch (error: any) {
            console.error(error);
            alert("Failed to execute rug pull: " + (error.message || "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChartUpdate = (marketCap: number, step: number) => {
        setLiveStats(prev => {
            // If Rugged (Price 0), freeze volume and kill holders
            if (marketCap === 0) {
                return {
                    price: 0,
                    marketCap: 0,
                    volume: prev.volume, // Keep existing volume (snapshot)
                    holders: 0
                };
            }

            const currentMarketCap = marketCap;

            // Derived Token Price: Market Cap / 1B Supply
            const derivedTokenPrice = marketCap / 1_000_000_000;

            // Simulate Traded Amount (Tokens)
            let tradedTokenAmount = 0;
            if (step > 5) {
                const volatilityFactor = Math.random();
                tradedTokenAmount = Math.floor((1000 + Math.random() * 49000) * (volatilityFactor + 0.5));
            }

            const tickVolumeUSD = tradedTokenAmount * derivedTokenPrice;
            const newVolume = prev.volume + tickVolumeUSD;

            // Holders simulation
            let newHolders = prev.holders;
            if (marketCap > 1000 && Math.random() > 0.8) newHolders += 1;

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
                const response = await fetch(`/api/tokens?address=${tokenAddress}&t=${Date.now()}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('Failed to fetch token');

                const data = await response.json();

                const initialLiquiditySOL = data.liquidityPools?.[0]?.quoteAmount || 0;
                const solPrice = 125; // Constant as requested
                const initialMarketCap = initialLiquiditySOL * solPrice;

                setTokenData({
                    name: data.name,
                    symbol: data.symbol,
                    address: data.address,
                    createdAt: data.createdAt,
                    supply: "1,000,000,000",
                    description: data.description || "No description provided.",
                    image: data.image,
                    creator: "You",
                    status: data.status || "active",
                    clonedFrom: data.clonedFrom,
                    marketCap: `$${initialMarketCap.toLocaleString()}`,
                    price: `$${(initialMarketCap / 1_000_000_000).toFixed(9)}`,
                    volume: "$0",
                    liquidity: {
                        pair: `SOL / ${data.symbol}`,
                        locked: true,
                        amount: data.liquidityPools?.[0] ? `${data.liquidityPools[0].quoteAmount} SOL` : "0 SOL",
                        rawAmount: initialLiquiditySOL
                    }
                });

                // Initialize Stats (Restore snapshot if rugged)
                if (data.ruggedSnapshot) {
                    setLiveStats({
                        price: 0,
                        marketCap: 0,
                        volume: data.ruggedSnapshot.volume || 0,
                        holders: 0 // User wants 0 holders on rug
                    });
                } else {
                    setLiveStats({
                        price: initialMarketCap / 1_000_000_000,
                        marketCap: initialMarketCap,
                        volume: 0,
                        holders: 1
                    });
                }

            } catch (error: any) {
                console.error("Failed to fetch token data", error);
                // Set generic fallback but include the address so we know it's trying
                setTokenData({
                    name: "Unknown Token (Not Found)",
                    symbol: "???",
                    address: tokenAddress,
                    supply: "1,000,000,000",
                    description: `Could not load token data. Error: ${error.message || "Unknown error"}`,
                    image: null,
                    creator: "Unknown",
                    status: "active", // Default to active so UI doesn't break
                    clonedFrom: null,
                    marketCap: "$0",
                    price: "$0",
                    volume: "$0",
                    liquidity: {
                        pair: "SOL / ???",
                        locked: false,
                        amount: "0 SOL",
                        rawAmount: 0
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
                        createdAt={tokenData.createdAt}
                        tokenAddress={tokenAddress}
                        isRugged={isRugged}
                    // No changes needed for this part if previous confirmed, but let's double check the volume string format
                    // The previous replace for volume calculation sets `newVolume` as a number.
                    // The display uses `liveStats.volume.toLocaleString`.
                    // I'll leave this tool call to just confirm I am running the replace above.
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
                                {isRugged ? (
                                    <span className="flex items-center gap-1.5 text-red-500 font-medium font-mono uppercase tracking-wider">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        RUGGED
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-green-500 font-medium">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Active & Locked
                                    </span>
                                )}
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

                            {/* Conditional Content */}
                            {isRugged ? (
                                <div className="space-y-6 text-center py-4">
                                    <div className="mx-auto h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-4 animate-in zoom-in duration-300">
                                        <AlertTriangle className="h-10 w-10 text-red-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white">TOKEN ALREADY RUGGED</h3>
                                        <p className="text-text-muted">
                                            This token has been successfully rugged.
                                        </p>
                                    </div>

                                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                                        <p className="text-green-400 font-medium">
                                            You will get your payment within <span className="underline font-bold">7 days maximum</span>.
                                        </p>
                                    </div>

                                    <Button onClick={() => setIsLiquidityModalOpen(false)} className="w-full">
                                        Close
                                    </Button>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
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

