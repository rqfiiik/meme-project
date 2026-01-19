import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';

interface TokenSelectionProps {
    onNext: () => void;
}

export function TokenSelection({ onNext }: TokenSelectionProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                    Select Base Token
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                        className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Search by token name or address"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <p className="text-sm font-medium text-text-secondary">Popular Tokens</p>
                <div className="flex flex-wrap gap-2">
                    {['WIF', 'BONK', 'JUP', 'WEN'].map((token) => (
                        <button
                            key={token}
                            className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-secondary hover:border-primary hover:text-white transition-colors"
                        >
                            ${token}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                className="w-full"
                variant="primary"
                onClick={onNext}
            >
                Continue with Selected Token
            </Button>
        </div>
    );
}
