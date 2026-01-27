import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UsersClient } from "./UsersClient";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    const users = await (prisma.user as any).findMany({
        orderBy: { firstSeen: 'desc' },
        take: 50,
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            address: true,
            planType: true,
            role: true,
            status: true,
            firstSeen: true,
            isCreator: true,
            promoCode: true,
            commissionRate: true,
            _count: {
                select: {
                    wallets: true,
                    subscriptions: true
                }
            }
        }
    });

    // Ensure status is stringent (it might be null in DB if old records)
    const sanitizedUsers = users.map(u => ({
        ...u,
        status: u.status || 'active'
    }));

    return <UsersClient users={sanitizedUsers} />;
}
