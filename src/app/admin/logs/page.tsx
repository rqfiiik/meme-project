import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogsClient } from "./LogsClient";

export default async function LogsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    const logs = await prisma.adminLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    return <LogsClient logs={logs} />;
}
