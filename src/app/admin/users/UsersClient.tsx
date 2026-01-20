'use client';

import { useState } from 'react';
import { MoreHorizontal, Shield, ShieldAlert, UserX, CheckCircle } from 'lucide-react';


interface User {
    id: string;
    email: string | null;
    name: string | null;
    username: string | null;
    address: string | null;
    role: string;
    status: string;
    planType: string | null;
    firstSeen: Date;
    _count: {
        wallets: number;
        subscriptions: number;
    };
}

export function UsersClient({ users }: { users: User[] }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">User Management</h1>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Linked</th>
                            <th className="px-6 py-4">Status & Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                            {user.name?.[0] || user.username?.[0] || user.email?.[0] || '?'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-medium text-white truncate">{user.name || user.username || 'Wallet User'}</div>
                                            <div className="text-xs truncate">{user.email || '-'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-white bg-white/5 px-2 py-0.5 rounded w-fit">
                                            💳 {user._count.wallets} Wallets
                                        </span>
                                        <span className="text-xs text-white bg-white/5 px-2 py-0.5 rounded w-fit">
                                            ✨ {user._count.subscriptions} Subs
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'suspended'
                                            ? 'bg-red-500/10 text-red-500'
                                            : 'bg-green-500/10 text-green-500'
                                            }`}>
                                            {user.status === 'suspended' ? <ShieldAlert className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                            {user.status || 'active'}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-text-secondary uppercase">
                                            {user.role}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(user.firstSeen).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <UserActions user={user} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UserActions({ user }: { user: User }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: 'flag' | 'ban' | 'activate') => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        setIsLoading(true);
        try {
            await fetch('/api/admin/user-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, action })
            });
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => handleAction(user.status === 'suspended' ? 'activate' : 'flag')}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${user.status === 'suspended'
                    ? 'hover:bg-green-500/20 text-green-500'
                    : 'hover:bg-yellow-500/20 text-yellow-500'
                    }`}
                title={user.status === 'suspended' ? "Activate" : "Flag"}
            >
                <Shield className="h-4 w-4" />
            </button>
            <button
                onClick={() => handleAction('ban')}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                title="Ban User"
            >
                <UserX className="h-4 w-4" />
            </button>
        </div>
    );
}
