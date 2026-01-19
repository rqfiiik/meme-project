import { Button } from '@/components/ui/Button';
import { Globe, Twitter, Send } from 'lucide-react';

interface TokenMetadataProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function TokenMetadata({ data, updateData, onNext, onBack }: TokenMetadataProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Description</label>
                <textarea
                    value={data.description}
                    onChange={(e) => updateData({ description: e.target.value })}
                    placeholder="Tell us about your project..."
                    className="w-full h-32 rounded-lg border border-border bg-background px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary">Social Links (Optional)</h3>

                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                        value={data.website}
                        onChange={(e) => updateData({ website: e.target.value })}
                        placeholder="Website URL"
                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                        value={data.twitter}
                        onChange={(e) => updateData({ twitter: e.target.value })}
                        placeholder="Twitter / X URL"
                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div className="relative">
                    <Send className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                        value={data.telegram}
                        onChange={(e) => updateData({ telegram: e.target.value })}
                        placeholder="Telegram URL"
                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <Button variant="ghost" className="flex-1" onClick={onBack}>
                    Back
                </Button>
                <Button className="flex-1" onClick={onNext}>
                    Review & Deploy
                </Button>
            </div>
        </div>
    );
}
