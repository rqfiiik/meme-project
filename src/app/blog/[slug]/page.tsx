import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { AdBanner } from "@/components/blog/AdBanner";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import React from "react";

// Force dynamic if we want live draft previews
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
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

// Simple ad injection utility
// Splits content by </p> and inserts ad HTML after every few paragraphs
function injectAds(htmlContent: string) {
    if (!htmlContent) return [];

    // We can't render the React Component directly into the HTML string easily without ReactDOMServer
    // So we'll split the content into chunks and render them interspersed with the Ad Component in the JSX return.

    // Split by closing paragraph tag
    const paragraphs = htmlContent.split('</p>');
    return paragraphs.map((p, i) => {
        // Add the closing tag back if it's not the last empty split
        const content = p.trim() ? `${p}</p>` : '';
        return content;
    }).filter(Boolean);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    if (!resolvedParams?.slug) notFound();

    const post = await prisma.blogPost.findUnique({
        where: { slug: resolvedParams.slug },
        include: {
            author: true,
            categories: true,
            tags: true
        }
    });

    if (!post || (!post.published && true)) {
        notFound();
    }

    // Fetch Related Posts (Simple logic: Same category, not this post)
    const categoryIds = post.categories.map((c: any) => c.id);
    const relatedPosts = await prisma.blogPost.findMany({
        where: {
            published: true,
            id: { not: post.id },
            categories: { some: { id: { in: categoryIds } } }
        },
        include: { author: true },
        take: 3,
        orderBy: { viewCount: 'desc' } // show popular ones
    });

    // Fallback if no related posts in category, just get latest
    if (relatedPosts.length < 3) {
        const morePosts = await prisma.blogPost.findMany({
            where: {
                published: true,
                id: { not: post.id, notIn: relatedPosts.map((p: any) => p.id) }
            },
            include: { author: true },
            take: 3 - relatedPosts.length,
            orderBy: { publishedAt: 'desc' }
        });
        relatedPosts.push(...morePosts);
    }

    const postedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
    const authorName = post.author?.name || 'Unknown Author';
    const authorImage = post.author?.image;

    // Content Processing for Ads
    const contentChunks = injectAds(post.content);

    // JSON-LD
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
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            <Header />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="pb-20">
                {/* Medium-style Header: Centered, Clean */}
                <div className="container max-w-[680px] mx-auto px-4 pt-12 md:pt-20">
                    <h1 className="text-4xl md:text-[42px] font-bold leading-[1.2] tracking-tight text-[#e5e5e5] mb-6 font-serif">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <h2 className="text-xl md:text-2xl text-text-secondary leading-snug mb-8 font-sans">
                            {post.excerpt}
                        </h2>
                    )}

                    {/* Author / Meta Row */}
                    <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
                        <div className="flex items-center gap-4">
                            {authorImage ? (
                                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/10">
                                    <Image src={authorImage} alt={authorName} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {authorName[0]}
                                </div>
                            )}
                            <div>
                                <div className="font-medium text-white text-[15px]">{authorName}</div>
                                <div className="flex items-center gap-2 text-text-muted text-[13px]">
                                    {/* <span className="hover:text-white cursor-pointer transition-colors">Follow</span>
                                    <span>·</span> */}
                                    <time>{post.publishedAt ? format(postedDate, 'MMM d, yyyy') : 'Draft'}</time>
                                    <span>·</span>
                                    <span>5 min read</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-text-muted">
                            <button className="hover:text-white transition-colors"><Share2 className="h-5 w-5" /></button>
                            <button className="hover:text-white transition-colors"><Bookmark className="h-5 w-5" /></button>
                            <button className="hover:text-white transition-colors"><MoreHorizontal className="h-5 w-5" /></button>
                        </div>
                    </div>
                </div>

                {/* Hero Image - Wide but not full screen */}
                {post.coverImage && (
                    <div className="container max-w-[900px] mx-auto px-4 mb-4">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm">
                            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
                        </div>
                        <div className="text-center mt-3 text-sm text-text-muted">
                            Image by <span className="underline decoration-1 underline-offset-2">CreateMeme.io</span>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="container max-w-[680px] mx-auto px-4 mt-12">
                    <div className="prose prose-invert prose-lg max-w-none prose-p:text-[20px] prose-p:leading-[32px] prose-p:font-serif prose-headings:font-sans prose-a:text-primary prose-imgs:rounded-lg">
                        {contentChunks.map((chunk, index) => (
                            <React.Fragment key={index}>
                                <div dangerouslySetInnerHTML={{ __html: chunk }} />
                                {/* Inject Ad after 2nd and 5th paragraphs approx */}
                                {(index === 1 || index === 4 || index === 8) && (
                                    <div className="not-prose">
                                        <AdBanner />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                        <div className="mt-16 pt-8">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag: any) => (
                                    <span key={tag.id} className="bg-[#f2f2f21a] px-4 py-2 rounded-full text-sm text-text-secondary hover:text-white transition-colors cursor-pointer">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interaction Footer */}
                    <div className="mt-12 py-8 border-t border-b border-white/10 flex items-center justify-between text-text-muted">
                        <div className="flex items-center gap-6">
                            {/* Claps/Likes could go here */}
                            <span className="text-sm">500 claps</span>
                            <span className="text-sm">12 comments</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Share2 className="h-5 w-5 cursor-pointer hover:text-white" />
                            <Bookmark className="h-5 w-5 cursor-pointer hover:text-white" />
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                <RelatedPosts posts={relatedPosts} />

            </article>
        </div>
    );
}
