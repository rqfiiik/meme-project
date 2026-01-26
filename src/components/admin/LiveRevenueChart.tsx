'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

interface LiveRevenueChartProps {
    title?: string;
    onUpdate?: (price: number, step: number) => void;
    createdAt?: string | Date;
    tokenAddress?: string;
    isRugged?: boolean;
    initialValue?: number; // New prop
}

// Simple seeded random function (Linear Congruential Generator)
function createSeededRandom(seed: number) {
    let m = 0x80000000;
    let a = 1103515245;
    let c = 12345;
    let state = seed ? seed : Math.random() * m;

    return () => {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}

// Convert address to numeric seed
function stringToSeed(str: string): number {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}



export function LiveRevenueChart({ title = "Price Action", onUpdate, createdAt, tokenAddress, isRugged = false, initialValue = 0 }: LiveRevenueChartProps) {
    const [visibleCount, setVisibleCount] = useState(0);

    // Generate accurate volatile data DETERMINISTICALLY
    const data = useMemo(() => {
        const seedValue = tokenAddress ? stringToSeed(tokenAddress) : 12345;
        const random = createSeededRandom(seedValue);

        const points = [];
        const target = 15000 + initialValue; // Target grows from initial
        const steps = 100; // 100 minutes
        let currentValue = initialValue;

        for (let i = 0; i <= steps; i++) {
            if (i < 5) {
                // First 5 minutes: Flat at initial value
                points.push({ min: i, val: initialValue });
                currentValue = initialValue;
            } else if (i <= 15) {
                // 5-15 mins: Waking up from initial
                const wakeUp = initialValue + (random() * 10 * (i - 5));
                points.push({ min: i, val: wakeUp });
                currentValue = wakeUp;
            } else {
                // 15+ mins: Volatile growth
                const progress = (i - 15) / (steps - 15);
                const base = initialValue + (progress * (target - initialValue));

                // HIGH Volatility
                const randomSwing = (random() - 0.5) * 2;
                const volatilityMagnitude = base * 0.3;

                let val = base + (randomSwing * volatilityMagnitude);

                if (random() > 0.9) val *= 1.5; // Pump
                if (random() < 0.1) val *= 0.7; // Dump

                if (val < 0) val = 0;
                points.push({ min: i, val });
                currentValue = val;
            }
        }
        return points;
    }, [tokenAddress, initialValue]);

    // Initial Time Sync
    useEffect(() => {
        if (!createdAt) return;

        const start = new Date(createdAt).getTime();
        const now = Date.now();
        const diffMs = now - start;
        const diffMinutes = Math.floor(diffMs / 60000); // 1 Real Minute = 1 Chart Step

        // If newly created, might be < 0 or 0
        let initialStep = Math.max(0, diffMinutes);

        // Cap at max steps
        if (initialStep > 100) initialStep = 100;

        setVisibleCount(initialStep);

        // Trigger immediate update for stats
        if (data[initialStep] && onUpdate && !isRugged) {
            onUpdate(data[initialStep].val, data[initialStep].min);
        }

    }, [createdAt, onUpdate, data, isRugged]);

    // Animation Tick - Real-time (approximate)
    useEffect(() => {
        if (isRugged) return; // Stop animation if rugged

        const interval = setInterval(() => {
            setVisibleCount(prev => {
                if (!createdAt) return prev + 1; // Fallback

                const start = new Date(createdAt).getTime();
                const now = Date.now();
                const diffMs = now - start;
                const targetStep = Math.floor(diffMs / 60000);

                const next = Math.min(targetStep, 100);

                if (next < prev) return prev;

                if (next > prev || next === prev) {
                    const point = data[next];
                    if (point && onUpdate) {
                        onUpdate(point.val, point.min);
                    }
                }
                return next;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [data, onUpdate, createdAt, isRugged]);

    // Dimensions
    const width = 600;
    const height = 200;
    const padding = 20;

    // Helper to map data to SVG coordinates
    const currentMax = useMemo(() => {
        const sliced = data.slice(0, Math.max(visibleCount, 10));
        const maxInView = Math.max(...sliced.map(d => d.val));
        return Math.max(maxInView * 1.2, 100);
    }, [visibleCount, data]);

    const getX = (min: number) => (min / 100) * (width - padding * 2) + padding;
    const getY = (val: number) => height - padding - (val / currentMax) * (height - padding * 2);

    // Data manipulation for RUG PULL
    let visibleData = data.slice(0, visibleCount + 1);
    let currentVal = visibleData.length > 0 ? visibleData[visibleData.length - 1].val : 0;

    if (isRugged) {
        // If rugged, we effectively want to show a sharp drop to 0 from the last point
        // We append a point that is [current_min + 1, 0]
        if (visibleData.length > 0) {
            const last = visibleData[visibleData.length - 1];
            visibleData = [
                ...visibleData,
                { min: last.min + 1, val: 0 } // Drop to zero
            ];
            currentVal = 0;
        }
    }

    // Side Effect for Rug Pull Sync
    useEffect(() => {
        if (isRugged && onUpdate) {
            onUpdate(0, visibleCount + 1);
        }
    }, [isRugged, onUpdate, visibleCount]);

    // Create Path 'd' attribute
    const pathD = visibleData.length > 0
        ? `M ${getX(visibleData[0].min)} ${getY(visibleData[0].val)} ` +
        visibleData.map(p => `L ${getX(p.min)} ${getY(p.val)}`).join(' ')
        : '';

    // Create Area fill 'd' attribute
    const areaD = visibleData.length > 0
        ? `${pathD} L ${getX(visibleData[visibleData.length - 1].min)} ${visibleData[visibleData.length - 1].val === 0 ? height : height} L ${getX(0)} ${height} Z`
        : '';

    // Calculate simulated 30m change
    const start30mIndex = Math.max(0, visibleCount - 30);
    const val30mAgo = data[start30mIndex]?.val || 0;
    const change = currentVal - val30mAgo;
    const isPositive = !isRugged && change >= 0;

    return (
        <div className={`w-full rounded-xl border ${isRugged ? 'border-red-500/50 bg-red-900/10' : 'border-border bg-black/40'} p-6 shadow-xl backdrop-blur-md relative overflow-hidden group transition-all duration-1000`}>

            {/* Header */}
            <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isRugged ? 'text-red-500' : 'text-white'}`}>
                        <Activity className={`h-5 w-5 ${isRugged ? 'text-red-500 animate-bounce' : 'text-primary animate-pulse'}`} />
                        {title}
                    </h3>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-bold font-mono tracking-tight ${isRugged ? 'text-red-500' : 'text-white'}`}>
                        ${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {isRugged ? (
                        <div className="text-sm text-red-500 font-bold flex items-center justify-end gap-1 uppercase">
                            <TrendingUp className="h-3 w-3 rotate-180" />
                            RUG PULL DETECTED
                        </div>
                    ) : (
                        <div className={`text-sm font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            <TrendingUp className={`h-3 w-3 ${!isPositive && 'rotate-180'}`} />
                            {isPositive ? '+' : ''}${Math.abs(change).toFixed(2)} (Last 30m)
                        </div>
                    )}
                </div>
            </div>

            {/* Graph Area */}
            <div className={`w-full aspect-[3/1] bg-surface/30 rounded-lg relative overflow-hidden border ${isRugged ? 'border-red-500/30' : 'border-white/5'}`}>
                {/* Grid Lines */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/5 border-t border-dashed border-white/10" />

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
                    <defs>
                        <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area Fill */}
                    <motion.path
                        d={areaD}
                        fill={isRugged ? "url(#gradientRed)" : "url(#gradientFill)"}
                        animate={{ d: areaD }}
                        transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                    />

                    {/* Line Stroke */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke={isRugged ? "#ef4444" : (isPositive ? "#4ade80" : "#f87171")}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{ d: pathD }}
                        transition={{ type: "tween", ease: "linear", duration: 0.5 }}
                    />

                    {/* Live Dot */}
                    {visibleData.length > 0 && (
                        <circle
                            cx={getX(visibleData[visibleData.length - 1].min)}
                            cy={getY(visibleData[visibleData.length - 1].val)}
                            r="4"
                            fill={isRugged ? "#ef4444" : "white"}
                            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        />
                    )}
                </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 text-xs text-text-muted font-mono px-1">
                <span>0m</span>
                <span>50m</span>
                <span>100m</span>
            </div>

            <div className="absolute bottom-4 right-4 text-[10px] text-white/10 pointer-events-none uppercase tracking-[0.2em] font-bold">
                {isRugged ? 'CRASHED' : (visibleCount < 5 ? 'Waiting for Volume' : 'Live Trading')}
            </div>

        </div>
    );
}
