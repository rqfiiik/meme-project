'use client';

import { Shield, Clock } from 'lucide-react';

interface AdminLog {
    id: string;
    adminId: string;
    action: string;
    targetId: string | null;
    details: string | null;
    createdAt: Date;
}

export function LogsClient({ logs }: { logs: AdminLog[] }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Security & Audit Logs</h1>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Target</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-3 w-3 text-primary" />
                                        <span className="text-white font-medium">{log.adminId}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex px-2 py-1 rounded bg-white/10 text-xs font-mono text-white">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                                    {log.targetId || '-'}
                                </td>
                                <td className="px-6 py-4 max-w-[300px] truncate" title={log.details || ''}>
                                    {log.details || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
