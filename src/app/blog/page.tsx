import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { Metadata } from 'next';
import { BlogFeed } from "@/components/blog/BlogFeed";

// Force regular revalidation or dynamic
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Blog | CreateMeme.io',
    description: 'Insights, tutorials, and ecosystem updates for Solana meme coin creators.',
};

async function getPosts() {
    // Robust Fetching
    const posts = await prisma.blogPost.findMany({
        where: { published: true },
        include: {
            author: { select: { name: true, image: true } },
            categories: true
        },
        orderBy: { publishedAt: 'desc' },
        take: 20 // Fetch decent chunk for scrolling
    });
    return posts;
}

export default async function BlogListingPage() {
    const posts = await getPosts();

    // Featured Post (First one) - Optional, for now just pass all to feed
    // But typically Medium has a "Featured" big card at top. 
    // Let's pass all to the feed to keep the requested "Card style" consistent for now.

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            <Header />

            <main className="container pb-24">
                {/* Hero Section */}
                <div className="py-20 md:py-28 text-center border-b border-white/5 mb-16 relative">
                    <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
                            The <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Hub</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-text-secondary leading-relaxed font-light">
                            News, strategies, and guides for the next generation of token creators.
                        </p>
                    </div>

                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />
                </div>

                {/* Main Feed */}
                <BlogFeed posts={posts} />

            </main>
        </div>
    );
}
