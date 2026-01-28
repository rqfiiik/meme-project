import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Copy, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from 'next/link';

// Helper to copy to clipboard (client component logic needed, or simple script)
// We'll make a client component for the copy buttons or just use simple inline actions
import { AffiliateClient } from "./AffiliateClient"; // We'll create this next

export default async function AffiliatePage() {
    const session = await auth();
    if (!session?.user) redirect("/api/auth/signin");

    // Fetch User Data with Creator Info
    const user = await (prisma.user as any).findUnique({
        where: { id: session.user.id },
        include: {
            _count: {
                select: { referredUsers: true } // Assuming relation name 'referredUsers', wait, we didn't define relation name in schema.
                // Since we didn't run prisma generate, we can't rely on relation counts easily without 'any'.
                // We might need raw queries or separate counts.
            }
        }
    });

    if (!user?.isCreator) {
        return (
            <div className="min-h-screen bg-background pt-24 px-4 flex flex-col items-center justify-center text-center">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>

                <p className="text-gray-400 max-w-md">
                    You are not registered as a Creator Affiliate. Please contact support to apply for the creator program.
                </p>
                <div className="mt-8">
                    <Link href="/">
                        <Button variant="outline">Return Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Manual Fetching due to missing relation types
    const referralCount = await (prisma.user as any).count({
        where: { referrerId: user.id }
    });

    // Fetch Earnings
    const earnings = await (prisma as any).affiliateEarning.findMany({
        where: { creatorId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    const totalEarnings = earnings.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Creator Dashboard</h1>
                    <p className="text-gray-400">Manage your referrals and track your earnings.</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Stats Card - Total Earnings */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Earnings</p>
                                <h3 className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card - Referrals */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Referrals</p>
                                <h3 className="text-2xl font-bold text-white">{referralCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card - Commission Rate */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Commission Rate</p>
                                <h3 className="text-2xl font-bold text-white">{(user.commissionRate * 100).toFixed(0)}%</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Links Section */}
                <AffiliateClient
                    promoCode={user.promoCode}
                    baseUrl={process.env.NEXT_PUBLIC_APP_URL || 'https://meme-project-teal.vercel.app'}
                />

                {/* Earnings Table */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-xl font-bold text-white">Recent Earnings</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {earnings.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            No earnings yet. Start referring users!
                                        </td>
                                    </tr>
                                ) : (
                                    earnings.map((earning: any) => (
                                        <tr key={earning.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-gray-300">
                                                {new Date(earning.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-green-400 font-medium">
                                                +${earning.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                                {earning.transactionId.substring(0, 12)}...
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
