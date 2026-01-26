import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';

interface TokenSelectionProps {
    data: any;
    updateData: (newData: any) => void;
    onNext: () => void;
}

export function TokenSelection({ data, updateData, onNext }: TokenSelectionProps) {

    const handleSelectMock = (symbol: string) => {
        updateData({
            selectedToken: {
                name: symbol === 'MEME' ? "Sample Meme Coin" : `${symbol} Coin`,
                symbol: symbol,
                address: symbol === 'MEME' ? "8r4r...k9s2" : `mock-${symbol.toLowerCase()}-address` // Use consistent address for MEME mock
            }
        });
    };

    const handleContinue = () => {
        // If nothing selected, select default MEME for testing
        if (!data.selectedToken) {
            handleSelectMock('MEME');
        }
        onNext();
    };

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
                    {['MEME', 'WIF', 'BONK', 'JUP'].map((token) => (
                        <button
                            key={token}
                            onClick={() => handleSelectMock(token)}
                            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${data.selectedToken?.symbol === token
                                    ? "border-primary bg-primary/20 text-white"
                                    : "border-border bg-surface text-text-secondary hover:border-primary hover:text-white"
                                }`}
                        >
                            ${token}
                        </button>
                    ))}
                </div>
                {data.selectedToken && (
                    <p className="text-sm text-green-500">Selected: {data.selectedToken.name} ({data.selectedToken.symbol})</p>
                )}
            </div>

            <Button
                className="w-full"
                variant="primary"
                onClick={handleContinue}
            >
                Continue with {data.selectedToken ? data.selectedToken.symbol : 'Selected Token'}
            </Button>
        </div>
    );
}
