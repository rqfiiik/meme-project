'use client';

import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef } from "react";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const { disconnect, connected, publicKey, signMessage } = useWallet();
    const wasAuthenticated = useRef(false);
    const lastConnectedAddress = useRef<string | null>(null);

    // 1. Handle Logout -> Disconnect Wallet
    useEffect(() => {
        if (status === "authenticated") {
            wasAuthenticated.current = true;
        } else if (status === "unauthenticated" && wasAuthenticated.current) {
            if (connected) {
                console.log("User logged out, isolating wallet...");
                disconnect().catch(console.error);
            }
            wasAuthenticated.current = false;
        }
    }, [status, connected, disconnect]);

    // 2. Handle Wallet Connection State Sync
    useEffect(() => {
        const syncWallet = async () => {
            if (connected && publicKey) {
                const address = publicKey.toBase58();
                if (lastConnectedAddress.current !== address) {
                    console.log("Linking wallet:", address);
                    // Optimistic update
                    lastConnectedAddress.current = address;

                    try {
                        await fetch('/api/wallet/link', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address })
                        });
                    } catch (e) {
                        console.error("Failed to link wallet:", e);
                    }
                }
            } else if (!connected && lastConnectedAddress.current) {
                // Wallet just disconnected
                console.log("Disconnecting wallet:", lastConnectedAddress.current);
                const addressToDisconnect = lastConnectedAddress.current;
                lastConnectedAddress.current = null;

                try {
                    await fetch('/api/wallet/disconnect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address: addressToDisconnect })
                    });
                } catch (e) {
                    console.error("Failed to sync disconnect:", e);
                }
            }
        };

        syncWallet();
    }, [connected, publicKey]);

    return <>{children}</>;
}
