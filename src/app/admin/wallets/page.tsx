import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WalletsClient } from "./WalletsClient";

export const dynamic = 'force-dynamic';

export default async function WalletsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    const wallets = await prisma.user.findMany({
        where: { address: { not: null } },
        orderBy: { firstSeen: 'desc' },
        select: {
            id: true,
            address: true,
            name: true,
            username: true,
            walletStatus: true,
            firstSeen: true,
        }
    });

    const sanitizedWallets = wallets.map(w => ({
        ...w,
        walletStatus: w.walletStatus || 'active'
    }));

    return <WalletsClient wallets={sanitizedWallets} />;
}
