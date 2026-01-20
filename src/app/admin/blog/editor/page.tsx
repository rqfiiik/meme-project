'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Globe } from 'lucide-react';
import Image from 'next/image';

// Basic Editor Component
// In production, use Tiptap, Quill, or a Markdown editor lib.
// For now, a clean textarea with preview side-by-side or simple text.

export default function BlogEditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editSlug = searchParams.get('slug');

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!!editSlug);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '', // Markdown or HTML
        coverImage: '',
        seoTitle: '',
        seoDescription: '',
        published: false
    });

    // Fetch existing post if editing
    useEffect(() => {
        if (!editSlug) return;

        async function fetchPost() {
            try {
                const res = await fetch(`/api/blog/${editSlug}`);
                if (!res.ok) throw new Error("Failed to load");
                const data = await res.json();
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    excerpt: data.excerpt || '',
                    content: data.content,
                    coverImage: data.coverImage || '',
                    seoTitle: data.seoTitle || '',
                    seoDescription: data.seoDescription || '',
                    published: data.published
                });
            } catch (err) {
                console.error(err);
                alert("Could not load article");
            } finally {
                setIsFetching(false);
            }
        }
        fetchPost();
    }, [editSlug]);

    const handleSave = async () => {
        if (!formData.title || !formData.slug || !formData.content) {
            alert("Title, Slug, and Content are required.");
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = editSlug ? `/api/blog/${editSlug}` : '/api/blog';
            const method = editSlug ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save");
            }

            const result = await res.json();
            alert("Saved successfully!");

            if (!editSlug) {
                // Redirect to edit mode or list
                router.push('/admin/blog');
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="p-12 text-white">Loading Editor...</div>;

    return (
        <div className="min-h-screen bg-background text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold">{editSlug ? 'Edit Article' : 'New Article'}</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setFormData(p => ({ ...p, published: !p.published }))}
                    >
                        {formData.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? 'Saving...' : 'Save Article'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Article Title</label>
                        <input
                            type="text"
                            className="w-full bg-surface border border-border rounded-lg p-3 text-lg font-bold text-white focus:outline-none focus:border-primary"
                            placeholder="Enter title..."
                            value={formData.title}
                            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Content (Markdown/HTML)</label>
                        <textarea
                            className="w-full h-[600px] bg-surface border border-border rounded-lg p-4 font-mono text-sm text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="# Write your article content here..."
                            value={formData.content}
                            onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Sidebar Options */}
                <div className="space-y-6">
                    {/* Slug */}
                    <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
                        <h3 className="font-semibold text-white">SEO & URL</h3>
                        <div className="space-y-2">
                            <label className="text-xs text-text-secondary">URL Slug</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-border rounded p-2 text-sm text-white"
                                placeholder="my-article-slug"
                                value={formData.slug}
                                onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-text-secondary">SEO Title (Meta)</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-border rounded p-2 text-sm text-white"
                                placeholder="Optional custom meta title"
                                value={formData.seoTitle}
                                onChange={(e) => setFormData(p => ({ ...p, seoTitle: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-text-secondary">Meta Description</label>
                            <textarea
                                className="w-full bg-background border border-border rounded p-2 text-sm text-white h-24 resize-none"
                                placeholder="Summary for search engines..."
                                value={formData.seoDescription}
                                onChange={(e) => setFormData(p => ({ ...p, seoDescription: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
                        <h3 className="font-semibold text-white">Media</h3>
                        <div className="space-y-2">
                            <label className="text-xs text-text-secondary">Cover Image URL</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-border rounded p-2 text-sm text-white"
                                placeholder="https://..."
                                value={formData.coverImage}
                                onChange={(e) => setFormData(p => ({ ...p, coverImage: e.target.value }))}
                            />
                        </div>
                        {formData.coverImage && (
                            <div className="relative aspect-video w-full rounded overflow-hidden border border-border">
                                <Image src={formData.coverImage} fill alt="Preview" className="object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Excerpt */}
                    <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
                        <h3 className="font-semibold text-white">Excerpt</h3>
                        <textarea
                            className="w-full bg-background border border-border rounded p-2 text-sm text-white h-24 resize-none"
                            placeholder="Short summary for card previews..."
                            value={formData.excerpt}
                            onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
