'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Shield, ShieldOff, CheckCircle, Ban, Flag, RotateCcw } from 'lucide-react';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/Button';

// Use a single shared connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

interface WalletData {
    id: string;
    address: string;
    userId: string;
    userName: string;
    userEmail?: string | null;
    userImage?: string | null;
    status: string;
    solBalance: number;
    connectedAt: string;
    label?: string | null;
    wsolEnabled: boolean;
}

export function WalletsClient({ wallets }: { wallets: WalletData[] }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Wallet Management</h1>

            <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-text-muted">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">Address</th>
                            <th className="px-6 py-4">Linked User</th>
                            <th className="px-6 py-4">Balance / WSOL</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Connected</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {wallets.map((wallet) => (
                            <tr key={wallet.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate" title={wallet.address}>
                                    {wallet.address}
                                    {wallet.label && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">{wallet.label}</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{wallet.userName}</div>
                                    <div className="text-xs text-text-muted">{wallet.userEmail}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-text-muted">DB: {wallet.solBalance.toFixed(2)} SOL</div>
                                    <div className="text-primary font-mono"><WalletBalance address={wallet.address} /></div>
                                    {wallet.wsolEnabled && <span className="text-[10px] text-green-400 font-bold">WSOL ACTIVE</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={wallet.status} />
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(wallet.connectedAt).toLocaleDateString()}
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

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: 'bg-green-500/10 text-green-500',
        flagged: 'bg-yellow-500/10 text-yellow-500',
        banned: 'bg-red-500/10 text-red-500',
        disconnected: 'bg-gray-500/10 text-gray-500',
    }[status] || 'bg-gray-500/10 text-gray-500';

    const Icon = {
        active: CheckCircle,
        flagged: Flag,
        banned: Ban,
        disconnected: ShieldOff,
    }[status] || AlertCircle;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
            <Icon className="h-3 w-3" />
            <span className="capitalize">{status}</span>
        </span>
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
    return <span>{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} SOL</span>;
}

function WalletActions({ wallet }: { wallet: WalletData }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: 'flag' | 'ban' | 'unban' | 'disconnect' | 'request_payment') => {
        const msg = action === 'request_payment' ? "Request 0.1 SOL payment?" : `Are you sure you want to ${action} this wallet?`;
        if (!confirm(msg)) return;
        setIsLoading(true);
        try {
            await fetch('/api/admin/wallet-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletId: wallet.id, action })
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
                onClick={() => handleAction('request_payment')}
                disabled={isLoading}
                className="p-1.5 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                title="Request Payment (Mock)"
            >
                <div className="text-[10px] font-bold">$</div>
            </button>
            {wallet.status === 'active' && (
                <button
                    onClick={() => handleAction('disconnect')}
                    disabled={isLoading}
                    className="p-1.5 rounded bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                    title="Disconnect"
                >
                    <ShieldOff className="h-4 w-4" />
                </button>
            )}
            {wallet.status !== 'active' && wallet.status !== 'disconnected' && (
                <button
                    onClick={() => handleAction('unban')}
                    disabled={isLoading}
                    className="p-1.5 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    title="Restore to Active"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            )}
            {wallet.status !== 'flagged' && wallet.status !== 'banned' && (
                <button
                    onClick={() => handleAction('flag')}
                    disabled={isLoading}
                    className="p-1.5 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                    title="Flag Wallet"
                >
                    <Flag className="h-4 w-4" />
                </button>
            )}
            {wallet.status !== 'banned' && (
                <button
                    onClick={() => handleAction('ban')}
                    disabled={isLoading}
                    className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    title="Ban Wallet"
                >
                    <Ban className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
