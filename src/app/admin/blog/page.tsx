import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Pencil, FileText, Globe, Plus, Trash2, Eye } from 'lucide-react';
import { format } from "date-fns";
import { redirect } from 'next/navigation';

// Admin Blog Dashboard
export default async function AdminBlogPage() {
    const session = await auth();
    if (session?.user?.role !== "admin") redirect("/");

    const posts = await prisma.blogPost.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { author: true }
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Blog Management</h1>
                <Link href="/admin/blog/editor">
                    <Button><Plus className="mr-2 h-4 w-4" /> New Article</Button>
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-surface overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-surface-highlight text-text-secondary text-sm font-semibold">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Author</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-white">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-surface-highlight/50 transition-colors">
                                <td className="p-4 font-medium">{post.title}</td>
                                <td className="p-4 text-text-secondary text-sm">{post.slug}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">{post.author.name}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                                        </Link>
                                        <Link href={`/admin/blog/editor?slug=${post.slug}`}>
                                            <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                                        </Link>
                                        {/* Delete Button (can be client component or simple action) */}
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
        </div>
    );
}
