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

    const wallets = await prisma.wallet.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            }
        },
        orderBy: { connectedAt: 'desc' }
    });

    // Map to client expected shape
    const sanitizedWallets = wallets.map(w => ({
        id: w.id,
        address: w.address,
        userId: w.userId,
        userName: w.user.name || 'Unknown',
        userEmail: w.user.email,
        userImage: w.user.image,
        status: w.status,
        solBalance: w.solBalance,
        wsolEnabled: w.wsolEnabled,
        connectedAt: w.connectedAt.toISOString(),
        label: w.label
    }));

    return <WalletsClient wallets={sanitizedWallets} />;
}
