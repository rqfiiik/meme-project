import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <div className="w-full">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-surface">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step, index) => {
                    const isCompleted = index + 1 < currentStep;
                    const isCurrent = index + 1 === currentStep;

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                                    {
                                        'border-primary bg-primary text-white': isCompleted || isCurrent,
                                        'border-surface bg-background text-text-muted': !isCompleted && !isCurrent,
                                        'ring-4 ring-primary/20': isCurrent
                                    }
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                            </div>
                            <span
                                className={cn(
                                    "absolute -bottom-8 w-32 text-center text-xs font-semibold whitespace-nowrap",
                                    isCurrent || isCompleted ? "text-white" : "text-text-muted"
                                )}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
