export interface TokenFormData {
    name: string;
    symbol: string;
    image: File | null;
    imagePreview: string;
    description: string;
    website: string;
    twitter: string;
    telegram: string;
    isClone: boolean;
    clonedFrom?: string;

    // Dynamic Pricing Options
    isRevokeMint: boolean;
    isRevokeFreeze: boolean;
    isRevokeUpdate: boolean;
    isCustomCreatorInfo: boolean;
    creatorName: string;
    creatorWebsite: string;
    refCode?: string;
}
