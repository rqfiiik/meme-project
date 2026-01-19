import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { firstName, lastName, age, image } = body;

        // Validation (Basic)
        if (age && (isNaN(age) || age < 13 || age > 120)) {
            return NextResponse.json({ error: "Invalid age provided." }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName,
                lastName,
                age: age ? parseInt(age) : null,
                image
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
