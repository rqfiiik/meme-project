export interface TokenProfile {
    url: string;
    chainId: string;
    tokenAddress: string;
    icon?: string;
    header?: string;
    description?: string;
    links?: {
        type?: string;
        label?: string;
        url: string;
    }[];
}

export interface TokenMarketData {
    priceUsd?: string;
    liquidity?: {
        usd?: number;
    };
    fdv?: number;
    volume?: {
        h24?: number;
    };
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
}

export interface EnrichedTokenProfile extends TokenProfile {
    market?: TokenMarketData;
}

export async function getTrendingTokenProfiles(): Promise<EnrichedTokenProfile[]> {
    try {
        console.log('Fetching trending profiles...');
        const profilesRes = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', {
            next: { revalidate: 60 }
        });

        if (!profilesRes.ok) throw new Error('Failed to fetch trending profiles');

        const profiles: TokenProfile[] = await profilesRes.json();
        if (!Array.isArray(profiles)) return [];

        // Reduce to 15 to keep URL short and safe
        const activeProfiles = profiles.slice(0, 15);
        if (activeProfiles.length === 0) return [];

        const addresses = activeProfiles.map(p => p.tokenAddress).join(',');
        console.log(`Fetching market data for ${activeProfiles.length} tokens...`);

        const marketRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`, {
            next: { revalidate: 60 }
        });

        if (!marketRes.ok) {
            console.error('Market data fetch failed');
            return activeProfiles;
        }

        const marketData = await marketRes.json();
        const pairs = marketData.pairs as any[];

        // Map address -> best pair (highest liquidity)
        const bestPairs = new Map<string, TokenMarketData>();

        if (Array.isArray(pairs)) {
            pairs.forEach(pair => {
                const Addr = pair.baseToken.address.toLowerCase();
                const existing = bestPairs.get(Addr);
                // Simple logic: keep pair with higher liquidity
                if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
                    bestPairs.set(Addr, {
                        priceUsd: pair.priceUsd,
                        liquidity: pair.liquidity,
                        fdv: pair.fdv,
                        volume: pair.volume,
                        baseToken: pair.baseToken
                    });
                }
            });
        }

        console.log(`Merged ${bestPairs.size} market data entries.`);

        const enriched = activeProfiles.map(p => {
            const market = bestPairs.get(p.tokenAddress.toLowerCase());
            return {
                ...p,
                market
            };
        });

        return enriched;

    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        return [];
    }
}
