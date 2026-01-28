import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { code } = await req.json();
        if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user?.referrerId) {
            return NextResponse.json({ error: "Referrer already set" }, { status: 400 });
        }

        const referrer = await prisma.user.findUnique({ where: { promoCode: code } });
        if (!referrer || !referrer.isCreator) {
            return NextResponse.json({ error: "Invalid Creator Code" }, { status: 404 });
        }

        if (referrer.id === session.user.id) {
            return NextResponse.json({ error: "Cannot refer self" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { referrerId: referrer.id }
        });

        return NextResponse.json({ success: true, referrerName: referrer.name });

    } catch (error) {
        return NextResponse.json({ error: "Failed to set referrer" }, { status: 500 });
    }
}
