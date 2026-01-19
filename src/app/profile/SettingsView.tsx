'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Shield, Key, LogOut, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function SettingsView({ user }: { user: any }) {
    const { update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age || '',
        username: user.username || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Handlers
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

            setMessage({ type: 'success', text: 'Profile updated successfully.' });
            update(); // Refresh session
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
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage({ type: 'success', text: 'Password changed successfully.' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/user/settings/delete', { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete account");

            signOut({ callbackUrl: '/' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-text-secondary">Manage your profile and security settings.</p>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Personal Information */}
            <section className="bg-surface border border-white/5 rounded-2xl overflow-hidden p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Personal Information</h2>
                        <p className="text-sm text-text-secondary">Update your public profile details.</p>
                    </div>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Username (Unique)</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Email Address</label>
                        <input
                            type="email"
                            disabled
                            value={user.email}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-text-muted">Email address cannot be changed for security reasons.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-black font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Security Section (Conditional: Only if password exists or strictly asked to show) */}
            <section className="bg-surface border border-white/5 rounded-2xl overflow-hidden p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Shield className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Account Security</h2>
                        <p className="text-sm text-text-secondary">Manage your password and authentication.</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Current Password</label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-surface border border-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            Update Password
                        </button>
                        <button type="button" className="text-sm text-primary hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                </form>
            </section>

            {/* Auth Providers */}
            <section className="bg-surface border border-white/5 rounded-2xl overflow-hidden p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Key className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Connected Accounts</h2>
                        <p className="text-sm text-text-secondary">Manage external login providers.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                                {/* Google G Logo */}
                                <span className="font-bold text-black">G</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Google</p>
                                <p className="text-xs text-text-muted">Connected</p>
                            </div>
                        </div>
                        <button disabled className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium">
                            Connected
                        </button>
                    </div>
                </div>
            </section>


            {/* Danger Zone */}
            <section className="bg-red-500/5 border border-red-500/10 rounded-2xl overflow-hidden p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <Trash2 className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Danger Zone</h2>
                        <p className="text-sm text-text-secondary">Irreversible account actions.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="text-sm text-text-muted">
                        Deleting your account will remove all your data, tokens, and history. This cannot be undone.
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t border-red-500/10 flex justify-between items-center">
                    <span className="text-sm text-text-muted">Sign out from all devices?</span>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 text-sm text-white hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </button>
                </div>
            </section>
        </div>
    );
}
