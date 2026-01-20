'use client';

import { useState } from 'react';
import { RefreshCw, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface Subscription {
    id: string;
    userId: string;
    userName: string;
    userEmail: string | null;
    walletAddress: string;
    planType: string;
    status: string;
    lastPayment: string | null;
    nextPayment: string | null;
    createdAt: string;
}

export function SubscriptionsClient({ subscriptions }: { subscriptions: Subscription[] }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Subscription Manager</h1>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Wallet</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Billing Cycle</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {subscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{sub.userName}</div>
                                    <div className="text-xs text-text-muted">{sub.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-text-secondary truncate max-w-[150px]">
                                    {sub.walletAddress}
                                </td>
                                <td className="px-6 py-4 capitalize text-white">
                                    {sub.planType} Plan
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={sub.status} />
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    <div className="flex flex-col">
                                        <span>Next: {sub.nextPayment ? new Date(sub.nextPayment).toLocaleDateString() : 'N/A'}</span>
                                        <span className="text-text-muted">Last: {sub.lastPayment ? new Date(sub.lastPayment).toLocaleDateString() : 'Never'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <SubscriptionActions subscription={sub} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subscriptions.length === 0 && (
                    <div className="p-8 text-center text-text-muted">No active subscriptions found.</div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isActive = status === 'active';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isActive ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            <span className="capitalize">{status}</span>
        </span>
    );
}

function SubscriptionActions({ subscription }: { subscription: Subscription }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleManualCharge = async () => {
        if (!confirm(`Attempt manual charge using connected wallet?`)) return;
        setIsLoading(true);
        // Placeholder for future manual charge logic calling an API
        await new Promise(r => setTimeout(r, 1000));
        alert("Charge request sent (Simulation)");
        setIsLoading(false);
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={handleManualCharge}
                disabled={isLoading || subscription.status !== 'active'}
                className="p-1.5 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 disabled:opacity-50"
                title="Attempt Auto-Pay Now"
            >
                <RefreshCw className="h-4 w-4" />
            </button>
            <button
                disabled
                className="p-1.5 rounded bg-white/5 text-text-muted cursor-not-allowed"
                title="Manage Card (Unavailable)"
            >
                <CreditCard className="h-4 w-4" />
            </button>
        </div>
    );
}
