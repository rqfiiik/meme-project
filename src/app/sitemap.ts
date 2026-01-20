import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatememe.io';

    // 1. Static Routes
    const routes = [
        '',
        '/blog',
        '/create-token',
        '/create-liquidity-pool',
        '/copy-trending-tokens',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Blog Posts
    const posts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
    });

    const blogRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...blogRoutes];
}
