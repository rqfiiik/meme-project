import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsView } from "./SettingsView";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    // Fetch full user data including new fields
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
            firstName: true,
            lastName: true,
            age: true,
            // Don't leak password
        }
    });

    if (!user) {
        // Handle edge case where session exists but db user is gone (deleted?)
        redirect("/api/auth/signin");
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
            <SettingsView user={user} />
        </div>
    );
}
