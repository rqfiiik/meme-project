'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface BlogCardProps {
    post: any;
    index: number;
}

export function BlogCard({ post, index }: BlogCardProps) {
    const postedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group mb-12 border-b border-white/5 pb-10 last:border-0"
        >
            <Link href={`/blog/${post.slug}`} className="flex flex-col md:flex-row gap-6 md:gap-10 hover:no-underline">
                {/* Text Content - Order 2 on mobile (below image), Order 1 on desktop (left) */}
                <div className="flex-1 flex flex-col justify-center order-2 md:order-1">
                    {/* Author Meta */}
                    <div className="flex items-center gap-2 mb-3">
                        {post.author?.image ? (
                            <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                <Image src={post.author.image} alt={post.author.name} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                                {post.author?.name?.[0] || 'A'}
                            </div>
                        )}
                        <span className="text-sm font-medium text-white">{post.author?.name || 'Exit Meme'}</span>
                        <span className="text-text-muted text-[13px]">·</span>
                        <time className="text-[13px] text-text-muted">
                            {format(postedDate, 'MMM d, yyyy')}
                        </time>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-[#e5e5e5] mb-2 leading-tight group-hover:text-white transition-colors">
                        {post.title}
                    </h2>

                    <p className="text-text-secondary text-[15px] leading-relaxed line-clamp-2 md:line-clamp-3 mb-4 font-serif">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center gap-3 mt-auto">
                        <span className="text-xs bg-white/5 text-text-muted px-2 py-1 rounded hover:bg-white/10 transition-colors">
                            {post.categories?.[0]?.name || 'Crypto'}
                        </span>
                        <span className="text-xs text-text-muted">3 min read</span>
                    </div>
                </div>

                {/* Hero Image - Order 1 on mobile, Order 2 on desktop (Right side) */}
                <div className="relative aspect-video md:w-[200px] md:aspect-[1.6/1] shrink-0 bg-surface-highlight overflow-hidden rounded-lg order-1 md:order-2">
                    {post.coverImage ? (
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-muted text-xs">No Image</div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
