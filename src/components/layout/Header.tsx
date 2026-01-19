'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { WalletConnectButton } from './WalletButton';
import { Rocket } from 'lucide-react';
import Image from 'next/image';
import { AuthButton } from './AuthButton';
import { useState } from 'react';
import { TrendingTokensModal } from '@/components/trending/TrendingTokensModal';

export function Header() {
    const [isTrendingOpen, setIsTrendingOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/20 p-1.5">
                        <Rocket className="h-full w-full text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">CreateMeme.io</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/create-token" className="text-sm font-medium text-text-secondary transition-colors hover:text-white">
                        Create Coin
                    </Link>
                    <Link href="/create-liquidity-pool" className="text-sm font-medium text-text-secondary transition-colors hover:text-white">
                        Manage Liquidity
                    </Link>
                    <button
                        onClick={() => setIsTrendingOpen(true)}
                        className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-white group"
                    >
                        Copy Trending Coins
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary transition-colors group-hover:bg-primary group-hover:text-white">New</span>
                    </button>
                </nav>

                <div className="flex items-center gap-4">
                    <AuthButton />
                    <WalletConnectButton />
                </div>
            </div>
            <TrendingTokensModal isOpen={isTrendingOpen} onClose={() => setIsTrendingOpen(false)} />
        </header >
    );
}
