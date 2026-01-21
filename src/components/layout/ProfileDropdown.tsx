'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { DashboardModal } from '../dashboard/DashboardModal';
import { AdminModal } from '@/components/admin/AdminModal';

export function ProfileDropdown() {
    const { data: session } = useSession();
    const { disconnect } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300); // 300ms delay to allow moving mouse to the menu
    };

    if (!session?.user) return null;

    const startInitial = session.user.name ? session.user.name[0].toUpperCase() : 'U';

    return (
        <>
            <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-surface border border-border hover:bg-surface/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    {session.user.image ? (
                        <img src={session.user.image} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                            {startInitial}
                        </div>
                    )}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">

                        {/* Header: User Info */}
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <p className="text-sm font-bold text-white truncate">
                                {session.user.name || "User"}
                            </p>
                            <p className="text-xs text-text-muted truncate">
                                {session.user.email}
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            {session.user.role === 'admin' && (
                                <button
                                    onClick={() => { setIsOpen(false); setIsAdminOpen(true); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                                >
                                    <Shield className="h-4 w-4" />
                                    Admin Panel
                                </button>
                            )}

                            <button
                                onClick={() => { setIsOpen(false); setIsDashboardOpen(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </button>

                            <button
                                onClick={() => { setIsOpen(false); setIsSettingsOpen(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </button>

                            <div className="h-px bg-white/5 my-1" />

                            <button
                                onClick={async () => {
                                    await disconnect();
                                    signOut({ callbackUrl: '/' });
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} /> */}
            {/* <DashboardModal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} user={session.user} /> */}
            {/* <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} /> */}
        </>
    );
}
