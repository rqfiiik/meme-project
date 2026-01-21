import { Upload, X, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import Image from 'next/image';
import { TrendingSelectorModal } from '../TrendingSelectorModal';
import { EnrichedTokenProfile } from '../../../lib/dexscreener';

function spoofSymbol(symbol: string) {
    if (!symbol) return '';
    return symbol
        .replace(/O/g, '0')
        .replace(/o/g, '0')
        .replace(/I/g, '1')
        .replace(/E/g, '3')
        .replace(/A/g, '4')
        .replace(/S/g, '5');
}

import { TokenFormData } from '../../../types/token';

interface BasicInfoProps {
    data: TokenFormData;
    updateData: (data: Partial<TokenFormData>) => void;
    onNext: () => void;
}

export function BasicInfo({ data, updateData, onNext }: BasicInfoProps) {
    const [preview, setPreview] = useState<string | null>(data.imagePreview || null);
    const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview with data prop if it changes (from URL params)
    if (data.imagePreview && data.imagePreview !== preview) {
        setPreview(data.imagePreview);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            updateData({ image: file, imagePreview: url });
        }
    };

    const handleTrendSelect = (token: EnrichedTokenProfile) => {
        const name = token.market?.baseToken?.name || '';
        const symbol = spoofSymbol(token.market?.baseToken?.symbol || ''); // Auto-spoof
        const image = token.icon || '';
        const desc = token.description || '';

        // Extract socials
        const website = token.links?.find(l => l.type === 'website' || l.label === 'Website')?.url || '';
        const twitter = token.links?.find(l => l.type === 'twitter' || l.label === 'Twitter')?.url || '';
        const telegram = token.links?.find(l => l.type === 'telegram' || l.label === 'Telegram')?.url || '';

        setPreview(image);
        updateData({
            name,
            symbol,
            image: null, // Reset file if any
            imagePreview: image,
            description: desc,
            website,
            twitter,
            telegram,
            isClone: true,
            clonedFrom: token.tokenAddress
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-center">
                <Button
                    variant="outline"
                    className="gap-2 border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setIsTrendModalOpen(true)}
                >
                    <Sparkles className="h-4 w-4" />
                    Copy from Trending Coin
                </Button>
            </div>

            {/* Image Upload - Centered */}
            <div className="flex flex-col items-center justify-center space-y-4">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border bg-surface transition-all hover:border-primary hover:bg-surface-hover",
                        preview && "border-solid border-primary"
                    )}
                >
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Token Preview"
                            fill
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center text-center p-2">
                            <Upload className="h-8 w-8 text-text-muted mb-1" />
                            <span className="text-[10px] text-text-muted">Upload Icon</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
                <p className="text-xs text-text-muted">Supports JPG, PNG, GIF (Max 5MB)</p>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Token Name</label>
                        <input
                            value={data.name}
                            onChange={(e) => updateData({ name: e.target.value })}
                            placeholder="e.g. Bonk 2.0"
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Token Symbol</label>
                        <input
                            value={data.symbol}
                            onChange={(e) => updateData({ symbol: e.target.value.toUpperCase() })}
                            placeholder="e.g. BONK"
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                        />
                    </div>
                </div>

                {/* Modify Creator Info Toggle */}
                <div className="p-4 rounded-xl border border-border bg-background">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white font-medium">Modify Creator Information</h3>
                            <p className="text-xs text-text-muted">Change the information of the creator in the metadata. By default, it is LaunchToken.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-secondary">+0.1 SOL</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.isCustomCreatorInfo}
                                    onChange={(e) => updateData({ isCustomCreatorInfo: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>

                    {data.isCustomCreatorInfo && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Creator Name</label>
                                <input
                                    value={data.creatorName}
                                    onChange={(e) => updateData({ creatorName: e.target.value })}
                                    placeholder="Your name or organization"
                                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Creator Website</label>
                                <input
                                    value={data.creatorWebsite}
                                    onChange={(e) => updateData({ creatorWebsite: e.target.value })}
                                    placeholder="https://mymemecoin.com"
                                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Button
                className="w-full"
                size="lg"
                onClick={onNext}
                // Allow proceed if we have a name, symbol, AND either a file or a preview URL
                disabled={!data.name || !data.symbol || !preview}
            >
                Continue to Metadata
            </Button>
            <TrendingSelectorModal
                isOpen={isTrendModalOpen}
                onClose={() => setIsTrendModalOpen(false)}
                onSelect={handleTrendSelect}
            />
        </div>
    );
}
