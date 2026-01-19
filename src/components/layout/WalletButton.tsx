'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletConnectButton() {
    return <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !h-10 !font-semibold !px-4" />;
}
