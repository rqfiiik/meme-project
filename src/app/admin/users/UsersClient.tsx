'use client';

import { useState } from 'react';
import { MoreHorizontal, Shield, ShieldAlert, UserX, CheckCircle } from 'lucide-react';
import { toggleUserStatus, deleteUser } from '@/app/actions/admin';

interface User {
    id: string;
    email: string | null;
    name: string | null;
    role: string;
    status: string; // "active" | "suspended"
    firstSeen: Date;
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
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {user.name?.[0] || user.email?.[0] || '?'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.name || 'Unknown'}</div>
                                            <div className="text-xs">{user.email}</div>
                                            <div className="text-[10px] text-text-secondary font-mono">{user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'suspended'
                                            ? 'bg-red-500/10 text-red-500'
                                            : 'bg-green-500/10 text-green-500'
                                        }`}>
                                        {user.status === 'suspended' ? <ShieldAlert className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                        {user.status || 'Active'}
                                    </span>
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

    const handleToggle = async () => {
        if (confirm(`Are you sure you want to ${user.status === 'suspended' ? 'activate' : 'suspend'} this user?`)) {
            setIsLoading(true);
            await toggleUserStatus(user.id, user.status || 'active');
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to DELETE this user? This cannot be undone.`)) {
            setIsLoading(true);
            await deleteUser(user.id);
            setIsLoading(false);
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${user.status === 'suspended'
                        ? 'hover:bg-green-500/20 text-green-500'
                        : 'hover:bg-yellow-500/20 text-yellow-500'
                    }`}
                title={user.status === 'suspended' ? "Activate" : "Suspend"}
            >
                <Shield className="h-4 w-4" />
            </button>
            <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                title="Delete User"
            >
                <UserX className="h-4 w-4" />
            </button>
        </div>
    );
}
