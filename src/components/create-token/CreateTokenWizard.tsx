'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { StepIndicator } from '../create-pool/StepIndicator';
import { BasicInfo } from './steps/BasicInfo';
import { TokenMetadata } from './steps/TokenMetadata';
import { ReviewDeploy } from './steps/ReviewDeploy';

import { TokenFormData } from '../../types/token';

const STEPS = ['Token Details', 'Metadata & Socials', 'Review & Deploy'];

export function CreateTokenWizard() {
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<TokenFormData>({
        name: '',
        symbol: '',
        image: null,
        imagePreview: '',
        description: '',
        website: '',
        twitter: '',
        telegram: '',
        isClone: false,
        // Dynamic Pricing Options
        isRevokeMint: false,
        isRevokeFreeze: false,
        isRevokeUpdate: false,
        isCustomCreatorInfo: false,
        creatorName: '',
        creatorWebsite: ''
    });

    // Pre-fill name, symbol, image, socials from URL
    useEffect(() => {
        const nameParam = searchParams.get('name');
        const symbolParam = searchParams.get('symbol');
        const imageParam = searchParams.get('image');
        const websiteParam = searchParams.get('website');
        const twitterParam = searchParams.get('twitter');
        const telegramParam = searchParams.get('telegram');
        const isCloneParam = searchParams.get('clone') === 'true';

        setFormData(prev => ({
            ...prev,
            name: nameParam || prev.name,
            symbol: symbolParam || prev.symbol,
            imagePreview: imageParam || prev.imagePreview,
            website: websiteParam || prev.website,
            twitter: twitterParam || prev.twitter,
            telegram: telegramParam || prev.telegram,
            isClone: isCloneParam
        }));
    }, [searchParams]);

    const updateData = (newData: Partial<TokenFormData>) => setFormData(prev => ({ ...prev, ...newData }));
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="w-full max-w-2xl mx-auto space-y-12 py-12">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Create Your Token
                </h1>
                <p className="text-text-secondary text-lg">
                    Deploy a standard SPL token on Solana instantly.
                </p>
            </div>

            <div className="px-4">
                <StepIndicator currentStep={currentStep} steps={STEPS} />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-surface/50 p-6 md:p-8 backdrop-blur-sm shadow-2xl min-h-[500px]">
                {currentStep === 1 && (
                    <BasicInfo data={formData} updateData={updateData} onNext={nextStep} />
                )}
                {currentStep === 2 && (
                    <TokenMetadata data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />
                )}
                {currentStep === 3 && (
                    <ReviewDeploy data={formData} updateData={updateData} onBack={prevStep} />
                )}
            </div>
        </div>
    );
}
