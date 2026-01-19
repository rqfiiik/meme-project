'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Shield, Key, LogOut, Trash2, ArrowLeft, Wallet } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { linkWallet, unlinkWallet } from '@/app/actions/user';

import '@/components/auth/SignInModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'personal' | 'security' | 'wallet' | 'danger';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { data: session, update } = useSession();
    const router = useRouter();
    const { publicKey, connected } = useWallet();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Data States
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        username: '',
        address: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setShouldRender(true);
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 50);

            // Fetch Data
            if (session?.user) {
                fetch('/api/user/settings/profile')
                    .then(res => res.json())
                    .then(data => {
                        if (data.user) {
                            setFormData({
                                firstName: data.user.firstName || '',
                                lastName: data.user.lastName || '',
                                age: data.user.age || '',
                                username: data.user.username || '',
                                address: data.user.address || '',
                            });
                        }
                    });
            }
            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, session]);

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/user/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage({ type: 'success', text: 'Profile updated.' });
            update();
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords mismatch.' });
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessage({ type: 'success', text: 'Password updated.' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted || !shouldRender) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center modal-overlay ${isAnimating ? 'open' : 'closing'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] modal-content ${isAnimating ? 'open' : 'closing'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg font-bold text-white">Settings</h2>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar / Tabs (Desktop) */}
                    <div className="w-48 border-r border-white/10 p-4 hidden md:flex flex-col gap-2 bg-white/5">
                        <button
                            onClick={() => { setActiveTab('personal'); setMessage(null); }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'personal' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <User className="h-4 w-4" /> Personal
                        </button>
                        <button
                            onClick={() => { setActiveTab('security'); setMessage(null); }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <Shield className="h-4 w-4" /> Security
                        </button>
                        <button
                            onClick={() => { setActiveTab('danger'); setMessage(null); }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'danger' ? 'bg-red-500/20 text-red-400' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        >
                            <Trash2 className="h-4 w-4" /> Danger Zone
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'personal' && (
                            <form onSubmit={handleInfoSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary">First Name</label>
                                        <input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-secondary">Last Name</label>
                                        <input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">Age</label>
                                    <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">Username</label>
                                    <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                                </div>
                                <button type="submit" disabled={isLoading} className="mt-4 bg-primary text-black font-bold py-2 px-4 rounded-lg text-sm w-full md:w-auto">
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'wallet' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">Wallet Connection</h3>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                    <div>
                                        <p className="text-xs text-text-secondary mb-1">Linked Wallet Address</p>
                                        <div className="font-mono text-sm text-white break-all">
                                            {formData.address || 'No wallet linked'}
                                        </div>
                                    </div>

                                    {formData.address && (
                                        <button
                                            onClick={async () => {
                                                if (confirm('Unlink wallet?')) {
                                                    setIsLoading(true);
                                                    await unlinkWallet();
                                                    setFormData({ ...formData, address: '' });
                                                    router.refresh();
                                                    update();
                                                    setIsLoading(false);
                                                }
                                            }}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Unlink Wallet
                                        </button>
                                    )}
                                </div>

                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                    <h4 className="font-bold text-white mb-2">Connect New Wallet</h4>
                                    {!connected ? (
                                        <p className="text-sm text-text-muted">Please connect your wallet using the top-right button first.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-text-secondary mb-1">Detected Wallet</p>
                                                <p className="font-mono text-sm text-primary break-all">{publicKey?.toBase58()}</p>
                                            </div>

                                            {publicKey?.toBase58() !== formData.address && (
                                                <button
                                                    onClick={async () => {
                                                        setIsLoading(true);
                                                        try {
                                                            await linkWallet(publicKey!.toBase58());
                                                            setFormData({ ...formData, address: publicKey!.toBase58() });
                                                            setMessage({ type: 'success', text: 'Wallet Linked!' });
                                                            router.refresh();
                                                            update();
                                                        } catch (e: any) {
                                                            setMessage({ type: 'error', text: e.message });
                                                        } finally {
                                                            setIsLoading(false);
                                                        }
                                                    }}
                                                    disabled={isLoading}
                                                    className="w-full py-2 bg-primary text-black font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors"
                                                >
                                                    {isLoading ? 'Linking...' : 'Link This Wallet'}
                                                </button>
                                            )}
                                            {publicKey?.toBase58() === formData.address && (
                                                <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
                                                    <Shield className="h-4 w-4" /> Wallet Verified
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">Current Password</label>
                                    <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">New Password</label>
                                    <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">Confirm Password</label>
                                    <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                                </div>
                                <button type="submit" disabled={isLoading} className="mt-4 bg-white/10 text-white font-bold py-2 px-4 rounded-lg text-sm w-full md:w-auto hover:bg-white/20">
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'danger' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h3>
                                <div>
                                    <p className="text-sm text-text-muted mb-2">Sign out from all devices.</p>
                                    <button onClick={() => signOut()} className="flex items-center gap-2 text-white bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 text-sm">
                                        <LogOut className="h-4 w-4" /> Log Out
                                    </button>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-sm text-text-muted mb-2">Permanently delete your account.</p>
                                    <button className="flex items-center gap-2 text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm">
                                        <Trash2 className="h-4 w-4" /> Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
