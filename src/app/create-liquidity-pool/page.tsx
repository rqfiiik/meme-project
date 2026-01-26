import { Header } from '@/components/layout/Header';
import { CreatePoolWizard } from '@/components/create-pool/CreatePoolWizard';

import { Suspense } from 'react';

export default function CreateLiquidityPoolPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4">
        <Suspense fallback={<div className="text-white text-center py-20">Loading...</div>}>
          <CreatePoolWizard />
        </Suspense>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
    </div>
  );
}
