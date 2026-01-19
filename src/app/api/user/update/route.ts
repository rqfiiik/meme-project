import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { username } = await req.json();

        // Simple Validation
        if (!username || username.trim().length < 3) {
            return NextResponse.json({ error: "Username must be at least 3 characters." }, { status: 400 });
        }

        // Check uniqueness
        const existing = await prisma.user.findUnique({
            where: { username }
        });

        if (existing && existing.id !== session.user.id) {
            return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
        }

        // Update User
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { username }
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
