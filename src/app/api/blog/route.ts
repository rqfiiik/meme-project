import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const publishedOnly = searchParams.get("preview") !== "true";
        const category = searchParams.get("category");
        const tag = searchParams.get("tag");

        const where: any = {};

        // Filter by Published status unless preview is requested (and maybe add admin check later)
        if (publishedOnly) {
            where.published = true;
        }

        if (category) {
            where.categories = { some: { slug: category } };
        }

        if (tag) {
            where.tags = { some: { slug: tag } };
        }

        // Pagination
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                include: {
                    author: { select: { name: true, image: true } },
                    categories: true,
                    tags: true
                },
                orderBy: { publishedAt: 'desc' }, // or createdAt
                skip,
                take: limit
            }),
            prisma.blogPost.count({ where })
        ]);

        return NextResponse.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error("Fetch Blog Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { title, slug, content, excerpt, coverImage, seoTitle, seoDescription, categoryIds, tagIds } = body;

        // Validation for Slug uniqueness
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                coverImage,
                seoTitle,
                seoDescription,
                authorId: session.user.id,
                published: false, // Default to draft
                categories: categoryIds ? { connect: categoryIds.map((id: string) => ({ id })) } : undefined,
                tags: tagIds ? { connect: tagIds.map((id: string) => ({ id })) } : undefined,
            }
        });

        return NextResponse.json({ success: true, post });

    } catch (error: any) {
        console.error("Create Blog Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
