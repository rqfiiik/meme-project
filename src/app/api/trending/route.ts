
import { NextResponse } from 'next/server';
import { getTrendingTokenProfiles } from '@/lib/dexscreener';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const tokens = await getTrendingTokenProfiles();
        return NextResponse.json({ tokens });
    } catch (error) {
        console.error('Failed to fetch trending tokens:', error);
        return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
    }
}
