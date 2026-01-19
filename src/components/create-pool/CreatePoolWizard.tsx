'use client';

import { useState } from 'react';
import { StepIndicator } from './StepIndicator';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { TokenSelection } from './steps/TokenSelection';
import { QuoteSelection } from './steps/QuoteSelection';
import { PoolConfig } from './steps/PoolConfig';
import { ReviewLaunch } from './steps/ReviewLaunch';

const STEPS = ['Token Selection', 'Quote Token', 'Pool Config', 'Review'];

export function CreatePoolWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        selectedToken: null,
        quoteToken: 'SOL',
        baseAmount: '',
        quoteAmount: '',
        startTime: 'now'
    });

    const updateData = (newData: any) => setFormData(prev => ({ ...prev, ...newData }));
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
                return <ReviewLaunch data={formData} onBack={prevStep} />;
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
