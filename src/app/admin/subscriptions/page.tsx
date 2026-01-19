import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubscriptionsClient } from "./SubscriptionsClient";

export default async function SubscriptionsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    const users = await prisma.user.findMany({
        where: { isAutoPay: true }, // Filter only relevant users
        orderBy: { firstSeen: 'desc' },
        select: {
            id: true,
            email: true,
            name: true,
            isAutoPay: true,
            planType: true,
            subscriptionStatus: true,
            lastPayment: true,
            nextPayment: true,
        }
    });

    return <SubscriptionsClient users={users} />;
}
