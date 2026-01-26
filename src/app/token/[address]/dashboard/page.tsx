import { DashboardClient } from './DashboardClient';
import { Header } from '@/components/layout/Header';

interface PageProps {
    params: Promise<{ address: string }>;
}

export default async function Page({ params }: PageProps) {
    const { address } = await params;
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <DashboardClient tokenAddress={address} />
            </main>
            {/* Background decoration consistent with other pages */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        </div>
    );
}
