'use client';

import { Button } from '@/components/ui/Button';
import { Calendar, Info } from 'lucide-react';

interface PoolConfigProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PoolConfig({ data, updateData, onNext, onBack }: PoolConfigProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid gap-6">
                {/* Base Token Amount */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">
                        {data.selectedToken?.symbol || 'Base Token'} Amount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.baseAmount || ''}
                            onChange={(e) => updateData({ baseAmount: e.target.value })}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="absolute right-3 top-3 text-xs text-text-muted">
                            Balance: 0.00
                        </div>
                    </div>
                </div>

                {/* Quote Token Amount */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">
                        {data.quoteToken === 'SOL' ? 'SOL' : 'USDC'} Amount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.quoteAmount || ''}
                            onChange={(e) => updateData({ quoteAmount: e.target.value })}
                            placeholder="Min 0.3"
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="absolute right-3 top-3 text-xs text-text-muted">
                            Balance: 0.00
                        </div>
                    </div>
                </div>

                {/* Start Time Configuration */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                    <label className="text-sm font-medium text-text-secondary">Start Time</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => updateData({ startTime: 'now' })}
                            className={`p-4 rounded-lg border text-sm font-medium transition-all ${data.startTime === 'now'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background text-text-secondary hover:border-primary/50'
                                }`}
                        >
                            Immediate
                        </button>
                        <button
                            onClick={() => updateData({ startTime: 'later' })}
                            className={`p-4 rounded-lg border text-sm font-medium transition-all ${data.startTime === 'later'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background text-text-secondary hover:border-primary/50'
                                }`}
                        >
                            Scheduled
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="w-full" onClick={onBack}>
                    Back
                </Button>
                <div className="w-full flex flex-col gap-2">
                    <Button
                        className="w-full"
                        onClick={onNext}
                        disabled={!data.baseAmount || Number(data.baseAmount) < 300000 || !data.quoteAmount || Number(data.quoteAmount) < 0.3}
                    >
                        Continue to Review
                    </Button>
                    {data.baseAmount && Number(data.baseAmount) < 300000 && (
                        <p className="text-xs text-red-400 text-center">Base amount must be at least 300,000</p>
                    )}
                    {data.quoteAmount && Number(data.quoteAmount) < 0.3 && (
                        <p className="text-xs text-red-400 text-center">SOL amount must be at least 0.3</p>
                    )}
                </div>
            </div>
        </div>
    );
}
