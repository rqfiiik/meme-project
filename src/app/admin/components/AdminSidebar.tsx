'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Wallet, Receipt, TrendingUp, RefreshCw, Shield, ArrowLeft, FileText } from 'lucide-react';

const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Wallets', href: '/admin/wallets', icon: Wallet },
    { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
    { name: 'Revenue', href: '/admin/revenue', icon: TrendingUp },
    { name: 'Auto-Pay', href: '/admin/subscriptions', icon: RefreshCw },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Security & Logs', href: '/admin/logs', icon: Shield },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-[calc(100vh-64px)] fixed top-16 left-0">
            <div className="p-4">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 px-2">
                    Admin Controls
                </h2>
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-white/10 mt-auto">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
