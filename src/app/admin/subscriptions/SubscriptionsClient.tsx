'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { requestAutoPayment } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface SubUser {
    id: string;
    email: string | null;
    name: string | null;
    isAutoPay: boolean;
    planType: string | null;
    subscriptionStatus: string | null;
    lastPayment: Date | null;
    nextPayment: Date | null;
}

export function SubscriptionsClient({ users }: { users: SubUser[] }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Auto-Pay Manager</h1>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Payment</th>
                            <th className="px-6 py-4">Next Payment</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{user.name || 'Unknown'}</div>
                                    <div className="text-xs">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-xs font-bold uppercase text-white">
                                        {user.planType || 'Basic'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={user.subscriptionStatus} isAutoPay={user.isAutoPay} />
                                </td>
                                <td className="px-6 py-4">
                                    {user.lastPayment ? new Date(user.lastPayment).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="px-6 py-4">
                                    {user.nextPayment ? new Date(user.nextPayment).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    {user.isAutoPay && <AutoPayAction user={user} />}
                                    {user.subscriptionStatus === 'active' && <CancelAction user={user} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status, isAutoPay }: { status: string | null, isAutoPay: boolean }) {
    if (!isAutoPay) return <span className="text-text-muted italic">Disabled</span>;

    if (status === 'active') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                <CheckCircle className="h-3 w-3" /> Active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
            <RefreshCw className="h-3 w-3" /> PENDING
        </span>
    );
}

function AutoPayAction({ user }: { user: SubUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRequest = async () => {
        const amountStr = prompt(`Enter amount (SOL) to request from ${user.email}:`, "0.5");
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Invalid amount");
            return;
        }

        if (!confirm(`CONFIRM: Request ${amount} SOL Auto-Payment from ${user.email}?\n\nThis will trigger a blockchain transaction request.`)) {
            return;
        }

        setIsLoading(true);
        try {
            await requestAutoPayment(user.id, amount);
            alert("Payment Requested Successfully! (Simulated)");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to request payment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRequest}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
            {isLoading ? 'Processing...' : 'Request Payment'}
        </button>
    );
}

function CancelAction({ user }: { user: SubUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm(`CONFIRM: Cancel subscription for ${user.email}?\n\nThis will stop auto-pay.`)) {
            return;
        }

        setIsLoading(true);
        try {
            // Dynamically import to avoid circular dep if needed, or just import at top
            const { cancelSubscription } = await import('@/app/actions/admin');
            await cancelSubscription(user.id);
            alert("Subscription Canceled.");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to cancel subscription");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleCancel}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-all border border-red-500/20 disabled:opacity-50"
        >
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
            {isLoading ? 'Canceling...' : 'Cancel'}
        </button>
    );
}
