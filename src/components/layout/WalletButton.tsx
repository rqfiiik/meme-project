'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SignInModal } from '@/components/auth/SignInModal';

export function WalletConnectButton() {
    const { data: session } = useSession();
    const [isSignInOpen, setIsSignInOpen] = useState(false);

    if (!session) {
        return (
            <>
                <Button
                    onClick={() => setIsSignInOpen(true)}
                    className="!bg-primary hover:!bg-primary/90 rounded-lg h-10 font-semibold px-4 text-white"
                >
                    Connect Wallet
                </Button>
                <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
            </>
        );
    }

    return <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !h-10 !font-semibold !px-4" />;
}
