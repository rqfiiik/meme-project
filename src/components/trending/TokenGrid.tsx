'use client';

import { EnrichedTokenProfile, getTrendingTokenProfiles } from '@/lib/dexscreener';
import { TokenCard } from './TokenCard';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenGridProps {
    initialData: EnrichedTokenProfile[];
    onRefresh?: () => Promise<void>;
}

export function TokenGrid({ initialData, onRefresh }: TokenGridProps) {
    const [tokens, setTokens] = useState<EnrichedTokenProfile[]>(initialData);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with props if initialData changes (e.g. parent re-fetches)
    useEffect(() => {
        setTokens(initialData);
    }, [initialData]);

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            if (onRefresh) {
                await onRefresh();
            } else {
                // Fallback for page-based usage
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 p-1 bg-surface rounded-lg border border-border">
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-primary text-white shadow-sm">
                        Trending Tokens
                    </button>
                    <button className="px-4 py-1.5 rounded-md text-sm font-medium text-text-muted hover:text-white transition-colors">
                        New Tokens
                    </button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className={cn("gap-2", isLoading && "opacity-80")}
                    disabled={isLoading}
                >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    Refresh List
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tokens.map((token, i) => (
                    <TokenCard key={token.tokenAddress + i} profile={token} />
                ))}
            </div>

            <p className="text-center text-xs text-text-muted mt-8">
                Data provided by <a href="https://dexscreener.com" target="_blank" className="underline hover:text-primary">DexScreener API</a>.
                Use at your own risk.
            </p>
        </div>
    );
}
