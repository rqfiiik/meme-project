import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./components/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Protect Admin Route
    if (!session?.user || session.user.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-black text-white pt-16">
            <AdminSidebar />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
