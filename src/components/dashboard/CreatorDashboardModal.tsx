'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, Users, TrendingUp, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CreatorDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface DashboardData {
    user: {
        promoCode: string;
        commissionRate: number;
    };
    stats: {
        referrals: number;
        totalEarnings: number;
    };
    earnings: any[];
}

export function CreatorDashboardModal({ isOpen, onClose }: CreatorDashboardModalProps) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animation states
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Copy states
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchDashboardData();
            setShouldRender(true);
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = 'unset';
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/user/creator-dashboard');
            const json = await res.json();

            if (!res.ok) {
                if (res.status === 403) throw new Error("Not a creator");
                throw new Error(json.error || "Failed to fetch");
            }

            setData(json);
        } catch (error: any) {
            console.error('Failed to fetch creator dashboard data', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, isLink: boolean) => {
        navigator.clipboard.writeText(text);
        if (isLink) {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    if (!mounted || !shouldRender) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center modal-overlay ${isAnimating ? 'open' : 'closing pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative z-10 w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] modal-content ${isAnimating ? 'open' : 'closing'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Creator Dashboard</h2>
                            <p className="text-xs text-text-muted">Manage referrals and earnings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-text-muted animate-pulse">
                            Loading dashboard...
                        </div>
                    ) : error ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center">
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-full mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Access Error</h3>
                            <p className="text-text-muted text-sm max-w-xs">{error}</p>
                            {error === 'Not a creator' && (
                                <p className="text-xs text-text-muted mt-4">Please contact support to apply.</p>
                            )}
                        </div>
                    ) : data && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Total Earnings</p>
                                            <h3 className="text-2xl font-bold text-white">${data.stats.totalEarnings.toFixed(2)}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Total Referrals</p>
                                            <h3 className="text-2xl font-bold text-white">{data.stats.referrals}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Commission Rate</p>
                                            <h3 className="text-2xl font-bold text-white">{(data.user.commissionRate * 100).toFixed(0)}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Links Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Promo Code */}
                                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">Your Promo Code</h3>
                                    <p className="text-sm text-gray-400 mb-4">Share this code with your audience.</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xl font-mono text-center text-white tracking-wider">
                                            {data.user.promoCode}
                                        </div>
                                        <Button
                                            onClick={() => handleCopy(data.user.promoCode, false)}
                                            variant="secondary"
                                            className="h-auto"
                                        >
                                            {copiedCode ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Referral Link */}
                                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-2">Referral Link</h3>
                                    <p className="text-sm text-gray-400 mb-4">Direct link that auto-applies your code.</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 truncate flex items-center">
                                            {`${process.env.NEXT_PUBLIC_APP_URL || 'https://meme-project-teal.vercel.app'}?ref=${data.user.promoCode}`}
                                        </div>
                                        <Button
                                            onClick={() => handleCopy(`${process.env.NEXT_PUBLIC_APP_URL || 'https://meme-project-teal.vercel.app'}?ref=${data.user.promoCode}`, true)}
                                            variant="secondary"
                                            className="h-auto"
                                        >
                                            {copiedLink ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Earnings Table */}
                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white">Recent Earnings</h3>
                                </div>
                                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-black/20 sticky top-0 backdrop-blur-md">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Transaction ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {data.earnings.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                        No earnings yet. Start referring users!
                                                    </td>
                                                </tr>
                                            ) : (
                                                data.earnings.map((earning: any) => (
                                                    <tr key={earning.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-gray-300 text-sm">
                                                            {new Date(earning.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-green-400 font-medium text-sm">
                                                            +${earning.amount.toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                                            {earning.transactionId.substring(0, 12)}...
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
