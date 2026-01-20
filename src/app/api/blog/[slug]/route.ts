import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        const slug = params.slug;
        const { searchParams } = new URL(req.url);
        // We might add specific logic for previewing drafts here

        const post = await prisma.blogPost.findUnique({
            where: { slug },
            include: {
                author: { select: { name: true, image: true, username: true } },
                categories: true,
                tags: true
            }
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Increment view count (simple implementation, ideally use Redis or separate analytics table)
        // We do this async and don't await to not block response? Or safe await.
        // await prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
        // NOTE: Updating on GET requires Write access which might be heavy. 
        // Better to use a separate /api/blog/[slug]/view endpoint or just ignore for strict read.

        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const slug = params.slug;
        const body = await req.json();

        // Prevent update of ID or Author (unless specific transfer logic)
        delete body.id;
        delete body.authorId;

        // If publishing, set publishedAt
        if (body.published === true) {
            // Check if it was already published to avoid overwriting date?
            // Or just allow updating date.
            const current = await prisma.blogPost.findUnique({ where: { slug }, select: { published: true } });
            if (!current?.published) {
                body.publishedAt = new Date();
            }
        } else if (body.published === false) {
            body.publishedAt = null;
        }

        const post = await prisma.blogPost.update({
            where: { slug },
            data: {
                ...body,
                categories: body.categoryIds ? { set: body.categoryIds.map((id: string) => ({ id })) } : undefined,
                tags: body.tagIds ? { set: body.tagIds.map((id: string) => ({ id })) } : undefined,
            }
        });

        return NextResponse.json({ success: true, post });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.blogPost.delete({ where: { slug: params.slug } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
