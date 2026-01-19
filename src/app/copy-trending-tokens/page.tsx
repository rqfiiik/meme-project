import { Header } from '@/components/layout/Header';
import { TokenGrid } from '@/components/trending/TokenGrid';
import { getTrendingTokenProfiles } from '@/lib/dexscreener';

export const revalidate = 60; // Revalidate page every 60s at most

export default async function CopyTrendingPage() {
    const trendingTokens = await getTrendingTokenProfiles();

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Copy Trending Tokens
                        </h1>
                        <p className="text-text-secondary max-w-2xl text-lg">
                            Find successful tokens on Solana and clone their branding instantly.
                        </p>
                    </div>
                </div>

                <TokenGrid initialData={trendingTokens} />
            </main>
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        </div>
    );
}
