'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function WalletSync() {
    const { publicKey } = useWallet();
    const { data: session } = useSession();

    useEffect(() => {
        const syncWallet = async () => {
            if (session?.user && publicKey) {
                try {
                    await fetch('/api/user/wallet', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address: publicKey.toBase58() }),
                    });
                } catch (error) {
                    // console.error("Failed to sync wallet", error);
                }
            }
        };

        // Sync when either session user or wallet public key changes
        if (session?.user && publicKey) {
            syncWallet();
        }
    }, [session, publicKey]);

    return null; // This component renders nothing
}
