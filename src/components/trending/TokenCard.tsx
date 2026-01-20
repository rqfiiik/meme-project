'use client';

import { Button } from '@/components/ui/Button';
import { EnrichedTokenProfile } from '@/lib/dexscreener';
import { Copy, Rocket, ExternalLink, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TokenCardProps {
    profile: EnrichedTokenProfile;
}

function formatVolume(vol?: number) {
    if (!vol) return '$0';
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
}

function spoofSymbol(symbol: string) {
    // Simple leet speak spoofer
    if (!symbol) return 'UNKNOWN';
    return symbol
        .replace(/O/g, '0')
        .replace(/o/g, '0')
        .replace(/I/g, '1')
        .replace(/E/g, '3')
        .replace(/A/g, '4')
        .replace(/S/g, '5');
}

import { useState } from 'react';

export function TokenCard({ profile }: TokenCardProps) {
    if (!profile) return null;
    const market = profile.market;
    // Prefer market name, fallback to slice of address
    const name = market?.baseToken?.name || profile.tokenAddress.slice(0, 8);
    const symbol = market?.baseToken?.symbol || 'UNKNOWN';
    const volume = market?.volume?.h24;

    // Smart Clone Params: Exact name, Spoofed symbol, Exact Icon, Socials
    const cloneName = name;
    const cloneSymbol = spoofSymbol(symbol);
    const cloneImage = profile.icon || '';

    // Extract Socials
    const website = profile.links?.find(l => l.type === 'website' || l.label === 'Website')?.url || '';
    const twitter = profile.links?.find(l => l.type === 'twitter' || l.label === 'Twitter')?.url || '';
    const telegram = profile.links?.find(l => l.type === 'telegram' || l.label === 'Telegram')?.url || '';

    const cloneUrl = `/create-token?name=${encodeURIComponent(cloneName)}&symbol=${encodeURIComponent(cloneSymbol)}&image=${encodeURIComponent(cloneImage)}&website=${encodeURIComponent(website)}&twitter=${encodeURIComponent(twitter)}&telegram=${encodeURIComponent(telegram)}&clone=true&clonedFrom=${profile.tokenAddress}`;

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl px-5 pt-5 pb-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_-10px_rgba(124,58,237,0.5)]">

            {/* Header / Banner */}
            {profile.header && (
                <div className="absolute inset-x-0 top-0 h-24 w-full opacity-20 transition-opacity group-hover:opacity-40">
                    <Image src={profile.header} alt="Banner" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/50" />
                </div>
            )}

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/40 shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        {profile.icon ? (
                            <Image src={profile.icon} alt="Token Icon" fill className="object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                                ?
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-white line-clamp-1 break-all text-sm md:text-base capitalize">
                            {name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-text-muted bg-surface-hover px-1.5 py-0.5 rounded uppercase">
                                {symbol}
                            </span>
                            {volume !== undefined && (
                                <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    {formatVolume(volume)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-4 grow space-y-3">
                <p className="text-xs text-text-secondary line-clamp-3 min-h-[3rem]">
                    {profile.description || "No description provided for this token."}
                </p>

                {/* Links */}
                <div className="flex items-center gap-2">
                    {profile.links?.slice(0, 3).map((link, i) => (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-background text-text-muted hover:text-white hover:bg-primary/20 transition-colors"
                            title={link.label || link.type}
                        >
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ))}
                    <a
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        View on DexScreener
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </div>

            <div className="relative z-10 mt-5 pt-4 border-t border-border/50">
                <Link href={cloneUrl} className="w-full">
                    <Button
                        className="w-full gap-2 font-semibold shadow-lg shadow-primary/10 group-hover:shadow-primary/25"
                        size="sm"
                    >
                        <Copy className="h-4 w-4" />
                        Clone Information
                    </Button>
                </Link>
            </div>
        </div>

    );
}
