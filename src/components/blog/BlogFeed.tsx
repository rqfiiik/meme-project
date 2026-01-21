'use client';

import { BlogCard } from "./BlogCard";
import { BlogCTA } from "./BlogCTA";
import { AdBanner } from "./AdBanner";
import React from 'react';
import { motion } from 'framer-motion';

interface BlogFeedProps {
    posts: any[];
}

export function BlogFeed({ posts }: BlogFeedProps) {
    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-20 bg-surface/30 rounded-2xl border border-white/5">
                <p className="text-text-muted text-lg">No blog posts found yet.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[720px] mx-auto">
            {posts.map((post, index) => {
                const elements = [];

                // Render the post card
                elements.push(
                    <BlogCard key={post.id} post={post} index={index} />
                );

                // Logic for injecting CTA and Ads
                // 1. CTA after 2nd (index 1) OR if it's the last post and list is short
                if (index === 1) {
                    elements.push(<BlogCTA key="cta-1" />);
                }

                // 2. Ads after 5th (index 4) and 8th (index 7)
                if (index === 4 || index === 7) {
                    elements.push(
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="mb-12"
                            key={`ad-${index}`}
                        >
                            <AdBanner />
                        </motion.div>
                    );
                }

                // 3. CTA at the very end
                if (index === posts.length - 1 && posts.length > 3) {
                    elements.push(<div className="mt-8" key="cta-end"><BlogCTA /></div>);
                }

                return <React.Fragment key={`wrapper-${post.id}`}>{elements}</React.Fragment>;
            })}
        </div>
    );
}
