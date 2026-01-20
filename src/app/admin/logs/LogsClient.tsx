'use client';

import { useState } from 'react';
import { Search, ShieldAlert, FileText, User } from 'lucide-react';

interface Log {
    id: string;
    adminName: string;
    adminEmail: string;
    action: string;
    targetId: string;
    details: string | null;
    createdAt: string;
}

export function LogsClient({ logs }: { logs: Log[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetId.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Security & Audit Logs</h1>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50"
                />
            </div>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Target ID</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-text-secondary whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{log.adminName}</span>
                                            <span className="text-[10px] text-text-muted">{log.adminEmail}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-xs font-mono text-blue-300 border border-white/10">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs max-w-[150px] truncate" title={log.targetId}>
                                    {log.targetId}
                                </td>
                                <td className="px-6 py-4 text-white/80 max-w-[300px] truncate" title={log.details || ''}>
                                    {log.details || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className="p-8 text-center text-text-muted">No logs found matching your search.</div>
                )}
            </div>
        </div>
    );
}
