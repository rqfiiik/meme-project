'use client';

import { useState } from 'react';
import { Search, Filter, Receipt, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
    id: string;
    signature: string;
    amount: number;
    date: string;
    userId: string | null;
    userName: string;
    userEmail: string | null;
    userAddress: string | null;
    type: string;
    status: string;
}

export function TransactionsClient({ transactions }: { transactions: Transaction[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch =
            tx.signature.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.userAddress && tx.userAddress.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filterType === 'all' || tx.type === filterType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Transactions History</h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search hash, user, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-text-muted" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-[#0a0a0a] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="all">All Types</option>
                        <option value="token_creation">Token Creation</option>
                        <option value="liquidity_pool">Liquidity Pool</option>
                        <option value="subscription">Subscription</option>
                        <option value="copy_coin">Copy Coin</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-text-muted">
                        <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                            <tr>
                                <th className="px-6 py-4">Signature</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs max-w-[150px] truncate" title={tx.signature}>
                                        {tx.signature}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{tx.userName}</div>
                                        {tx.userAddress && <div className="text-[10px] font-mono text-primary/80 truncate max-w-[150px]">{tx.userAddress}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        {tx.amount} SOL
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="capitalize px-2 py-0.5 rounded bg-white/10 text-xs">
                                            {tx.type || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`capitalize px-2 py-0.5 rounded text-xs font-bold ${tx.status === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(tx.date).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                                        >
                                            View <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredTransactions.length === 0 && (
                    <div className="p-8 text-center text-text-muted">No transactions found.</div>
                )}
            </div>
        </div>
    );
}
