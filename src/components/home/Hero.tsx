'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Zap, Rocket, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Hero() {
    const [tokenName, setTokenName] = useState('');

    return (
        <section className="relative overflow-hidden py-20 lg:py-32">

            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-accent/20 blur-[100px] rounded-full -z-10" />

            <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">

                {/* Announcement Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent backdrop-blur-sm shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                >
                    <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse" />
                    v2.0 is Live: Create Components Now Open
                </motion.div>

                {/* Main Headlines */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 max-w-4xl"
                >
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
                        Launch Your Own Coin <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">FAST ⚡</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-text-secondary md:text-xl">
                        Launch your own token on Solana in seconds. No coding required.
                        Join 750+ creators who launched with us.
                    </p>
                </motion.div>

                {/* Quick Start Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-md p-6 rounded-2xl border border-border bg-surface/50 backdrop-blur-xl shadow-2xl"
                >
                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium text-text-secondary ml-1">Token Name</label>
                            <input
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                placeholder="e.g. Bonk 2.0"
                                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                            />
                        </div>
                        <Link href={`/create-token?name=${encodeURIComponent(tokenName)}`}>
                            <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25" size="lg">
                                Create Your Token
                                <Rocket className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <p className="text-xs text-text-muted">
                            Cost to deploy: ~0.02 SOL
                        </p>
                    </div>
                </motion.div>

                {/* Trust Metrics */}
                <div className="pt-8 flex items-center justify-center gap-8 text-text-muted grayscale opacity-70">
                    {/* Placeholder logic for trusted logos if needed, for now using text metrics in next component */}
                </div>
            </div>
        </section>
    );
}
