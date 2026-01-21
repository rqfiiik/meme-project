import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Force dynamic if we want live draft previews, otherwise 'force-static' for high perf
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;

    // Safety check for slug
    if (!resolvedParams?.slug) return { title: 'Not Found' };

    const post = await prisma.blogPost.findUnique({
        where: { slug: resolvedParams.slug },
    });

    if (!post) return { title: 'Not Found' };

    return {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        openGraph: {
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt || undefined,
            images: post.coverImage ? [post.coverImage] : [],
            type: 'article',
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;

    // Safety check for slug
    if (!resolvedParams?.slug) notFound();

    const post = await prisma.blogPost.findUnique({
        where: { slug: resolvedParams.slug },
        include: {
            author: true,
            categories: true,
            tags: true
        }
    });

    if (!post || (!post.published && true /* checkAdminHereIfDetails */)) {
        notFound();
    }

    const postedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
    const authorName = post.author?.name || 'Unknown Author';
    const authorImage = post.author?.image;

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.coverImage ? [post.coverImage] : [],
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: [{
            '@type': 'Person',
            name: authorName,
        }]
    };

    return (
        <div className="min-h-screen bg-background text-white">
            <Header />

            {/* Inject JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="container max-w-4xl py-12">
                <Link href="/blog" className="inline-flex items-center text-text-secondary hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                </Link>

                <header className="mb-12 text-center space-y-6">
                    {/* Categories */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        {post.categories?.map((cat: any) => (
                            <span key={cat.id} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black leading-tight break-words">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-text-secondary">
                        <div className="flex items-center gap-2">
                            {authorImage && (
                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                    <Image src={authorImage} alt={authorName} fill className="object-cover" />
                                </div>
                            )}
                            <span className="font-medium text-white">{authorName}</span>
                        </div>
                        <span>•</span>
                        <time>
                            {post.publishedAt ? format(postedDate, 'MMMM d, yyyy') : 'Draft'}
                        </time>
                    </div>
                </header>

                {post.coverImage && (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 shadow-2xl shadow-primary/10 border border-border">
                        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
                    </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none mx-auto bg-transparent">
                    {/* 
                        Ideally use a markdown renderer here like 'react-markdown' or 'remark'.
                        For now, assuming safe HTML or raw text.
                        If raw HTML from DB:
                    */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {/* Tags Footer */}
                {post.tags?.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-border">
                        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag: any) => (
                                <span key={tag.id} className="bg-surface border border-border px-3 py-1 rounded-lg text-sm text-text-secondary hover:text-white hover:border-primary transition-colors cursor-pointer">
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            </article>
        </div>
    );
}
