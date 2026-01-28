import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsView } from "./SettingsView";

export default async function ProfilePage() {
    // MOCK DATA FOR SCREENSHOTS
    // const session = await auth();
    // if (!session?.user) redirect ...

    const user = {
        id: "mock-user-id",
        name: "Mock User",
        email: "mockuser@example.com",
        image: null,
        username: "mockuser",
        firstName: "Mock",
        lastName: "User",
        age: 25
    };

    // const user = await prisma.user.findUnique({...});
    // if (!user) ...

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
            <SettingsView user={user} />
        </div>
    );
}
