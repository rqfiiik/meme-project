'use client';

import { useState, useEffect } from 'react';
import { StepIndicator } from './StepIndicator';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { TokenSelection } from './steps/TokenSelection';
import { QuoteSelection } from './steps/QuoteSelection';
import { PoolConfig } from './steps/PoolConfig';
import { ReviewLaunch } from './steps/ReviewLaunch';

const STEPS = ['Token Selection', 'Quote Token', 'Pool Config', 'Review'];

import { useSearchParams } from 'next/navigation';

export function CreatePoolWizard() {
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        selectedToken: null,
        quoteToken: 'SOL',
        baseAmount: '',
        quoteAmount: '',
        startTime: 'now'
    });

    // Hydrate from URL
    useEffect(() => {
        const tokenAddr = searchParams.get('token');
        const refCode = searchParams.get('ref');

        if (tokenAddr && !formData.selectedToken) {
            setFormData((prev: any) => ({
                ...prev,
                selectedToken: {
                    address: tokenAddr,
                    name: searchParams.get('name') || 'Unknown Token',
                    symbol: searchParams.get('symbol') || 'UNK',
                    image: searchParams.get('image') || null
                },
                refCode: refCode // Capture referral
            }));
            // Optionally auto-advance to step 2 if token is provided? 
            // setCurrentStep(2); 
            // User might want to verify Step 1 first.
        } else if (refCode && !formData.refCode) {
            // If only ref code is present or token already set
            setFormData((prev: any) => ({ ...prev, refCode: refCode }));
        }
    }, [searchParams]);

    const updateData = (newData: any) => setFormData((prev: any) => ({ ...prev, ...newData }));
    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <TokenSelection data={formData} updateData={updateData} onNext={nextStep} />;
            case 2:
                return <QuoteSelection data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
            case 3:
                return <PoolConfig data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
            case 4:
                return <ReviewLaunch data={formData} updateData={updateData} onBack={prevStep} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-12 py-12">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Create Liquidity Pool
                </h1>
                <p className="text-text-secondary text-lg">
                    Launch your token on Raydium with ease.
                </p>
            </div>

            <div className="px-4">
                <StepIndicator currentStep={currentStep} steps={STEPS} />
            </div>

            <div className="relative mt-12 min-h-[400px] rounded-2xl border border-border bg-surface/50 p-6 md:p-8 backdrop-blur-sm shadow-2xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex flex-col"
                    >
                        {/* Step Content */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white">
                                    {STEPS[currentStep - 1]}
                                </h2>
                            </div>

                            {renderStep()}
                        </div>

                        {/* Back Button (Next is handled inside steps for validatio logic usually, but also here globally if needed) */}
                        <div className="mt-8 flex items-center justify-start pt-6 border-t border-border">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
