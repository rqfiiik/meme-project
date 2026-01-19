import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QuoteSelectionProps {
    onNext: () => void;
}

const QUOTE_TOKENS = [
    { symbol: 'SOL', name: 'Solana', icon: '◎' },
    { symbol: 'USDC', name: 'USD Coin', icon: '$' },
];

export function QuoteSelection({ onNext }: QuoteSelectionProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {QUOTE_TOKENS.map((token) => (
                    <div
                        key={token.symbol}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 border-border bg-background p-4 hover:border-primary/50 transition-all",
                            token.symbol === 'SOL' ? 'border-primary bg-primary/5' : ''
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-lg">
                                {token.icon}
                            </div>
                            <div>
                                <p className="font-bold text-white">{token.symbol}</p>
                                <p className="text-xs text-text-muted">{token.name}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button className="w-full" onClick={onNext}>
                Continue with SOL
            </Button>
        </div>
    );
}
