'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

interface LiveRevenueChartProps {
    title?: string;
}

export function LiveRevenueChart({ title = "Price Action" }: LiveRevenueChartProps) {
    const [visibleCount, setVisibleCount] = useState(0);

    // Generate static fake data once
    const data = useMemo(() => {
        const points = [];
        let currentValue = 0;
        const target = 15000; // Final target around 15,000
        const steps = 100; // 100 minutes

        for (let i = 0; i <= steps; i++) {
            if (i === 0) {
                points.push({ min: 0, val: 0 });
                currentValue = 0;
            } else if (i <= 10) {
                // First 10 minutes: keep low between 0 and 50
                // Random walk within 0-50 range
                const delta = (Math.random() - 0.5) * 10;
                let nextVal = currentValue + delta;
                if (nextVal < 0) nextVal = 0;
                if (nextVal > 50) nextVal = 50;
                points.push({ min: i, val: nextVal });
                currentValue = nextVal;
            } else {
                // After 10 mins: Grow towards 15000 with volatility
                const percentComplete = (i - 10) / (steps - 10);

                // Base growth curve (exponential-ish for excitement)
                const baseGrowth = currentValue + ((target - currentValue) / (steps - i)) * 1.5;

                // Add significant volatility (ups and downs)
                // Random factor between -10% and +15% of current value for "ups and downs"
                const volatility = (Math.random() * 0.25 - 0.10) * currentValue;

                let stepValue = baseGrowth + volatility;

                // Ensure we don't drop below 0
                if (stepValue < 0) stepValue = 0;

                // Cap at reasonably above target if random spike
                if (stepValue > target * 1.2) stepValue = target * 1.2;

                // Force convergence near the end
                if (i > 95) {
                    stepValue = currentValue + (target - currentValue) * 0.5;
                }

                points.push({ min: i, val: stepValue });
                currentValue = stepValue;
            }
        }
        return points;
    }, []);

    // Animation Tick
    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCount(prev => {
                if (prev < data.length) return prev + 1;
                return prev;
            });
        }, 500); // Faster animation (0.5s per "minute" point)

        return () => clearInterval(interval);
    }, [data.length]);

    // Dimensions
    const width = 600;
    const height = 200;
    const padding = 20;

    // Helper to map data to SVG coordinates
    const maxVal = Math.max(...data.map(d => d.val), 15000) * 1.1; // Dynamic max based on data peak or 15k

    const getX = (min: number) => (min / 100) * (width - padding * 2) + padding;
    const getY = (val: number) => height - padding - (val / maxVal) * (height - padding * 2);

    const visibleData = data.slice(0, visibleCount);

    // Create Path 'd' attribute
    const pathD = visibleData.length > 0
        ? `M ${getX(visibleData[0].min)} ${getY(visibleData[0].val)} ` +
        visibleData.map(p => `L ${getX(p.min)} ${getY(p.val)}`).join(' ')
        : '';

    // Create Area fill 'd' attribute
    const areaD = visibleData.length > 0
        ? `${pathD} L ${getX(visibleData[visibleData.length - 1].min)} ${height} L ${getX(0)} ${height} Z`
        : '';

    const currentVal = visibleData.length > 0 ? visibleData[visibleData.length - 1].val : 0;

    return (
        <div className="w-full rounded-xl border border-border bg-black/40 p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">

            {/* Header */}
            <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary animate-pulse" />
                        {title}
                    </h3>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono text-white tracking-tight">
                        ${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-green-400 font-medium flex items-center justify-end gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +${currentVal.toFixed(2)} (Last 100m)
                    </div>
                </div>
            </div>

            {/* Graph Area */}
            <div className="w-full aspect-[3/1] bg-surface/30 rounded-lg relative overflow-hidden border border-white/5">
                {/* Grid Lines */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/5 border-t border-dashed border-white/10" />

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
                    <defs>
                        <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area Fill */}
                    <motion.path
                        d={areaD}
                        fill="url(#gradientFill)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />

                    {/* Line Stroke */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.1, ease: "linear" }}
                    />

                    {/* Live Dot at tip */}
                    {visibleData.length > 0 && (
                        <circle
                            cx={getX(visibleData[visibleData.length - 1].min)}
                            cy={getY(visibleData[visibleData.length - 1].val)}
                            r="4"
                            fill="white"
                            className="drop-shadow-[0_0_8px_rgba(139,92,246,1)]"
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

        </div>
    );
}
