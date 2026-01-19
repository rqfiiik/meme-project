import { Header } from '@/components/layout/Header';
import { CreateTokenWizard } from '@/components/create-token/CreateTokenWizard';
import { Suspense } from 'react';

export default function CreateTokenPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4">
                <Suspense fallback={<div className="text-white text-center py-20">Loading...</div>}>
                    <CreateTokenWizard />
                </Suspense>
            </main>

            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        </div>
    );
}
