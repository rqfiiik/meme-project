'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

interface FadeInImageProps extends ImageProps {
    containerClassName?: string;
}

export function FadeInImage({ className, containerClassName, alt, ...props }: FadeInImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={cn("relative overflow-hidden", containerClassName)}>
            {isLoading && (
                <Skeleton className="absolute inset-0 z-10 h-full w-full" />
            )}
            <Image
                className={cn(
                    "transition-all duration-700 ease-in-out",
                    isLoading ? "scale-105 blur-lg grayscale" : "scale-100 blur-0 grayscale-0",
                    className
                )}
                alt={alt}
                onLoad={() => setIsLoading(false)}
                {...props}
            />
        </div>
    );
}
