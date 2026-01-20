import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubscriptionsClient } from "./SubscriptionsClient";

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    const subscriptions = await prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                    username: true
                }
            }
        }
    });

    const sanitizedSubscriptions = subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        userName: sub.user.name || sub.user.username || 'Unknown',
        userEmail: sub.user.email,
        walletAddress: sub.walletAddress,
        planType: sub.planType,
        status: sub.status,
        lastPayment: sub.lastPayment ? sub.lastPayment.toISOString() : null,
        nextPayment: sub.nextPayment ? sub.nextPayment.toISOString() : null,
        createdAt: sub.createdAt.toISOString()
    }));

    return <SubscriptionsClient subscriptions={sanitizedSubscriptions} />;
}
