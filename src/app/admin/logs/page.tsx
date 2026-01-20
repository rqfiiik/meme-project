import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogsClient } from "./LogsClient";

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    // Fetch logs
    const logs = await prisma.adminLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    // Fetch admin attributes to map names
    // We get unique adminIds from logs to minimize fetch, or just fetch all admins if few
    const adminIds = Array.from(new Set(logs.map(l => l.adminId)));
    const admins = await prisma.user.findMany({
        where: { id: { in: adminIds } },
        select: { id: true, name: true, email: true }
    });

    const adminMap = new Map(admins.map((a: { id: string; name: string | null; email: string | null }) => [a.id, a]));

    const sanitizedLogs = logs.map((log: { id: string; adminId: string; action: string; targetId: string | null; details: string | null; createdAt: Date }) => {
        const adminUser = adminMap.get(log.adminId);
        return {
            id: log.id,
            adminName: adminUser?.name || 'System / Unknown',
            adminEmail: adminUser?.email || 'N/A',
            action: log.action,
            targetId: log.targetId || '-',
            details: log.details,
            createdAt: log.createdAt.toISOString()
        };
    });

    return <LogsClient logs={sanitizedLogs} />;
}
