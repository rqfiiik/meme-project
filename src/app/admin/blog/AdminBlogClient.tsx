'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Pencil, Plus, Eye, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminBlogClient() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            // Fetch with preview=true to get drafts too
            const res = await fetch('/api/blog?preview=true&limit=50');
            if (!res.ok) throw new Error('Failed to fetch posts');
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Blog Management</h2>
                <Link href="/admin/blog/editor" onClick={() => {
                    // Force navigation to close modal if needed, or link just works naturally 
                    // However, we are inside a Modal (AdminModal). 
                    // Navigating to a new page works fine in Next.js, it might unmount the modal.
                }}>
                    <Button><Plus className="mr-2 h-4 w-4" /> New Article</Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-text-muted font-semibold">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Author</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium max-w-[200px] truncate" title={post.title}>{post.title}</td>
                                    <td className="p-4 text-text-secondary max-w-[150px] truncate">{post.slug}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-text-secondary">{post.author?.name}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/blog/${post.slug}`} target="_blank">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/blog/editor?slug=${post.slug}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {posts.length === 0 && (
                        <div className="p-12 text-center text-text-muted">
                            No articles found. Create your first one!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
