'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

export function LiveRevenueChart() {
    const [visibleCount, setVisibleCount] = useState(0);

    // Generate static fake data once
    const data = useMemo(() => {
        const points = [];
        let currentValue = 0;
        const target = Math.floor(Math.random() * (10000 - 2000) + 2000); // 2k to 10k
        const steps = 30;

        // Simple linear interpolation with random noise
        for (let i = 0; i <= steps; i++) {
            if (i === 0) {
                points.push({ min: 0, val: 0 });
            } else {
                // Growth trend
                const percentComplete = i / steps;

                // Add some organic randomness (some small drops, mostly gains)
                const noise = (Math.random() - 0.3) * (target / steps) * 2;
                let stepValue = currentValue + (target / steps) + noise;

                // Ensure non-negative and eventual fit (roughly)
                if (stepValue < 0) stepValue = 0;

                // Force close to target at end
                if (i === steps) stepValue = target;

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
        }, 1000); // 1 point per second

        return () => clearInterval(interval);
    }, [data.length]);

    // Dimensions
    const width = 600;
    const height = 200;
    const padding = 20;

    // Helper to map data to SVG coordinates
    const getX = (min: number) => (min / 30) * (width - padding * 2) + padding;
    const getY = (val: number) => height - padding - (val / 10000) * (height - padding * 2);

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
                        Live Revenue (Simulation)
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 uppercase font-mono tracking-wider">
                            Demo Mode
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono text-white tracking-tight">
                        ${currentVal.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-400 font-medium flex items-center justify-end gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +${currentVal.toFixed(2)} (Last 30m)
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
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.2, ease: "linear" }}
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
                <span>15m</span>
                <span>30m</span>
            </div>

        </div>
    );
}
