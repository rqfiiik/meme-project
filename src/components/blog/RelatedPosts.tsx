import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export function RelatedPosts({ posts }: { posts: any[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-16 border-t border-border mt-16 bg-[#0a0a0a]">
            <div className="container max-w-5xl mx-auto px-4">
                <h3 className="text-2xl font-bold text-white mb-8">Recommended from CreateMeme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.id} className="group cursor-pointer">
                            <article className="space-y-3">
                                <div className="relative aspect-[1.6/1] w-full bg-surface-highlight overflow-hidden rounded-lg">
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
                                <div className="flex items-center gap-2">
                                    {post.author?.image && (
                                        <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                            <Image src={post.author.image} alt={post.author.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <span className="text-xs text-text-secondary font-medium">{post.author?.name || 'CreateMeme'}</span>
                                </div>
                                <h4 className="font-bold text-white leading-tight group-hover:text-text-secondary transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <time className="text-xs text-text-muted block">
                                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}
                                </time>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
