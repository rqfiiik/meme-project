'use client';

import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Transaction {
    id: string;
    signature: string;
    amount: number;
    date: Date;
    user: {
        email: string | null;
        name: string | null;
    } | null;
    status?: string; // Mock status since schema doesn't have it yet, or derive it
}

export function TransactionsClient({ transactions }: { transactions: Transaction[] }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Transactions</h1>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">Signature / ID</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-primary">
                                    <a
                                        href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline flex items-center gap-2"
                                    >
                                        {tx.signature ? `${tx.signature.slice(0, 16)}...` : tx.id.slice(0, 8)}
                                    </a>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{tx.user?.name || 'Unknown User'}</div>
                                    <div className="text-xs">{tx.user?.email || 'No Email'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(tx.date).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-bold text-white">
                                    {tx.amount} SOL
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <StatusBadge status="success" />
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'success') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                <CheckCircle className="h-3 w-3" /> Success
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
            <XCircle className="h-3 w-3" /> Failed
        </span>
    );
}
