import { Header } from "@/components/layout/Header";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | CreateMeme.io',
    description: 'Latest news, guides, and updates from the CreateMeme platform.',
};

async function getPosts() {
    // In a server component, we can call DB directly if we want, 
    // OR call our own API via absolute URL if hosted, OR just stick to prisma directly for best perf.
    // "Fast loading, server-side rendered or statically generated" -> Prisma Direct is best for Server Components.

    // However, if we want to use the API logic (reusability), we need absolute URL.
    // Let's use Prisma directly in Server Component for "SSG/SSR" feel without API overhead.

    // Note: importing prisma in Client Component is forbidden, but this is a Server Component (default)
    const { prisma } = await import('@/lib/prisma');

    const posts = await prisma.blogPost.findMany({
        where: { published: true },
        include: {
            author: { select: { name: true, image: true } },
            categories: true
        },
        orderBy: { publishedAt: 'desc' },
        take: 10
    });
    return posts;
}

export default async function BlogListingPage() {
    const posts = await getPosts();

    return (
        <div className="min-h-screen bg-background text-white">
            <Header />

            <main className="container py-12">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        CreateMeme Blog
                    </h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        Insights, tutorials, and ecosystem updates for the next generation of meme coin creators.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* {posts.length > 0 ? (
                        posts.map((post: any) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="group hover:no-underline">
                                <article className="h-full bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                                    <div className="relative aspect-video w-full bg-surface-highlight overflow-hidden">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-text-muted">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="flex gap-2">
                                            {post.categories.map((cat: any) => (
                                                <span key={cat.id} className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>

                                        <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>

                                        <p className="text-text-secondary text-sm line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="pt-4 flex items-center justify-between border-t border-border/50">
                                            <div className="flex items-center gap-2">
                                                {post.author.image && (
                                                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                                        <Image src={post.author.image} alt={post.author.name} fill className="object-cover" />
                                                    </div>
                                                )}
                                                <span className="text-xs text-text-muted">{post.author.name}</span>
                                            </div>
                                            <time className="text-xs text-text-muted">
                                                {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}
                                            </time>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <p className="text-text-muted text-lg">No blog posts found. Check back later!</p>
                        </div>
                    )} */}
                    <div className="col-span-full text-center py-20 text-white">Debug: Posts rendering disabled</div>
                </div>
            </main>
        </div>
    );
}
