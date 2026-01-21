import { Skeleton } from "@/components/ui/Skeleton";
import { Header } from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            <Header />

            <article className="pb-20">
                {/* Header Skeleton */}
                <div className="container max-w-[680px] mx-auto px-4 pt-12 md:pt-20">
                    {/* Skeleton Title: 2 lines */}
                    <Skeleton className="h-10 md:h-12 w-3/4 mb-4" />
                    <Skeleton className="h-10 md:h-12 w-1/2 mb-8" />

                    {/* Excerpt Skeleton */}
                    <div className="mb-8 space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                    </div>

                    {/* Author Meta Row */}
                    <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <Skeleton className="w-11 h-11 rounded-full" />
                            <div className="space-y-2">
                                {/* Name */}
                                <Skeleton className="h-4 w-32" />
                                {/* Date */}
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex gap-4">
                            <Skeleton className="h-5 w-5 rounded-sm" />
                            <Skeleton className="h-5 w-5 rounded-sm" />
                            <Skeleton className="h-5 w-5 rounded-sm" />
                        </div>
                    </div>
                </div>

                {/* Hero Image Skeleton */}
                <div className="container max-w-[900px] mx-auto px-4 mb-4">
                    <Skeleton className="aspect-[16/9] w-full rounded-sm" />
                    <div className="flex justify-center mt-3">
                        <Skeleton className="h-3 w-40" />
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="container max-w-[680px] mx-auto px-4 mt-12 space-y-6">
                    {/* Simulating paragraphs */}
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-[95%]" />
                        <Skeleton className="h-5 w-[98%]" />
                        <Skeleton className="h-5 w-[90%]" />
                    </div>

                    <div className="space-y-3 pt-6">
                        <Skeleton className="h-5 w-[99%]" />
                        <Skeleton className="h-5 w-[92%]" />
                        <Skeleton className="h-5 w-[96%]" />
                    </div>

                    <div className="space-y-3 pt-6">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-[80%]" />
                    </div>
                </div>
            </article>
        </div>
    );
}
