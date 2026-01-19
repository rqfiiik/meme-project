import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BasicInfoProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
}

export function BasicInfo({ data, updateData, onNext }: BasicInfoProps) {
    const [preview, setPreview] = useState<string | null>(data.imagePreview || null);
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
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

            <Button
                className="w-full"
                size="lg"
                onClick={onNext}
                // Allow proceed if we have a name, symbol, AND either a file or a preview URL
                disabled={!data.name || !data.symbol || !preview}
            >
                Continue to Metadata
            </Button>
        </div>
    );
}
