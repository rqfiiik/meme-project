'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AffiliateClientProps {
    promoCode: string;
    baseUrl: string;
}

export function AffiliateClient({ promoCode, baseUrl }: AffiliateClientProps) {
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const link = `${baseUrl}?ref=${promoCode}`;

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Promo Code Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Your Promo Code</h3>
                <p className="text-sm text-gray-400 mb-4">Share this code with your audience.</p>
                <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xl font-mono text-center text-white tracking-wider">
                        {promoCode}
                    </div>
                    <Button
                        onClick={() => handleCopy(promoCode, false)}
                        variant="secondary"
                        className="h-auto"
                    >
                        {copiedCode ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Referral Link Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Referral Link</h3>
                <p className="text-sm text-gray-400 mb-4">Direct link that auto-applies your code.</p>
                <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 truncate flex items-center">
                        {link}
                    </div>
                    <Button
                        onClick={() => handleCopy(link, true)}
                        variant="secondary"
                        className="h-auto"
                    >
                        {copiedLink ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
