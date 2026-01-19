import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.user.delete({
            where: { id: session.user.id }
        });

        return NextResponse.json({ success: true, message: "Account deleted successfully." });

    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
