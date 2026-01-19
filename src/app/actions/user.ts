'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function linkWallet(address: string) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("unauthorized");
    }

    // Check if address is already taken by another user
    const existing = await prisma.user.findUnique({
        where: { address }
    });

    if (existing && existing.email !== session.user.email) {
        throw new Error("Wallet already linked to another account");
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: { address }
    });

    revalidatePath('/profile');
    return { success: true };
}

export async function unlinkWallet() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("unauthorized");
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: { address: null }
    });

    revalidatePath('/profile');
    return { success: true };
}
