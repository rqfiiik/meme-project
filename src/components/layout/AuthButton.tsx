'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ProfileDropdown } from './ProfileDropdown';
import { SignInModal } from '@/components/auth/SignInModal';

export function AuthButton() {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (session?.user) {
        return <ProfileDropdown />;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-semibold text-white px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
                Sign In
            </button>
            <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
