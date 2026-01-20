
import { DashboardClient } from './DashboardClient';

interface PageProps {
    params: Promise<{ address: string }>;
}

export default async function Page({ params }: PageProps) {
    const { address } = await params;
    return <DashboardClient tokenAddress={address} />;
}
