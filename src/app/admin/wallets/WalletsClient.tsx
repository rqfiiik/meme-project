'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Shield, ShieldOff, CheckCircle } from 'lucide-react';
import { toggleWalletStatus } from '@/app/actions/admin';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Use a single shared connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

interface WalletUser {
    id: string;
    address: string | null;
    name: string | null;
    walletStatus: string;
    firstSeen: Date;
}

export function WalletsClient({ wallets }: { wallets: WalletUser[] }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Wallet Management</h1>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">Address</th>
                            <th className="px-6 py-4">Linked User</th>
                            <th className="px-6 py-4">Balance (SOL)</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Connected</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {wallets.map((wallet) => (
                            <tr key={wallet.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate" title={wallet.address || ''}>
                                    {wallet.address || 'No Address'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{wallet.name || (wallet as any).username || 'Unknown User'}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-white">
                                    {wallet.address ? <WalletBalance address={wallet.address} /> : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${wallet.walletStatus === 'blacklisted'
                                        ? 'bg-red-500/10 text-red-500'
                                        : wallet.walletStatus === 'flagged'
                                            ? 'bg-yellow-500/10 text-yellow-500'
                                            : 'bg-green-500/10 text-green-500'
                                        }`}>
                                        {wallet.walletStatus === 'active' && <CheckCircle className="h-3 w-3" />}
                                        {wallet.walletStatus === 'flagged' && <AlertCircle className="h-3 w-3" />}
                                        {wallet.walletStatus === 'blacklisted' && <ShieldOff className="h-3 w-3" />}
                                        <span className="capitalize">{wallet.walletStatus}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(wallet.firstSeen).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <WalletActions wallet={wallet} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function WalletBalance({ address }: { address: string }) {
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchBalance = async () => {
            try {
                const pubKey = new PublicKey(address);
                const lamports = await connection.getBalance(pubKey);
                if (isMounted) setBalance(lamports / LAMPORTS_PER_SOL);
            } catch (e) {
                // console.error(e);
            }
        };
        fetchBalance();
        return () => { isMounted = false; };
    }, [address]);

    if (balance === null) return <span className="text-text-muted animate-pulse">...</span>;
    return <span>{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>;
}

function WalletActions({ wallet }: { wallet: WalletUser }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        await toggleWalletStatus(wallet.id, wallet.walletStatus || 'active');
        setIsLoading(false);
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors"
                title="Cycle Status: Active -> Flagged -> Blacklisted"
            >
                {isLoading ? '...' : 'Change Status'}
            </button>
        </div>
    );
}
