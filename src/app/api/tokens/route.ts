import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            symbol,
            description,
            image, // Expecting a URL or ignoring for now if it's a File object not handled
            website,
            twitter,
            telegram,
            discord,
            userAddress,
            clonedFrom, // Add clonedFrom
            signature
        } = body;

        if (!name || !symbol || !userAddress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Ensure User Exists
        const user = await prisma.user.upsert({
            where: { address: userAddress },
            update: {},
            create: {
                address: userAddress,
            },
        });

        // 2. Create Token Record
        // Note: address is unique. If we don't have the real mint address yet, 
        // we might need to use a placeholder or the signature if that guarantees uniqueness temporarily, 
        // OR the frontend must provide the generated mint address.
        // For now, I'll assume the frontend generates a Keypair and passes the public key as 'address'.
        // If not, we might fail on unique constraint.

        // Changing strategy: If address is not provided, we can't create a unique Token record easily without a placeholder.
        // However, usually the frontend generates the mint Keypair.

        const token = await prisma.token.create({
            data: {
                name,
                symbol,
                description,
                image: typeof image === 'string' ? image : undefined, // Only save if string URL
                address: body.address || "PENDING_" + signature, // Fallback if no address yet
                website,
                twitter,
                telegram,
                discord,
                creatorId: user.id,
                clonedFrom: body.clonedFrom // Add clonedFrom
            },
        });

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error('Error creating token:', error);
        return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const token = await prisma.token.findFirst({
            where: { address: address },
        });

        if (!token) {
            return NextResponse.json({ error: 'Token not found' }, { status: 404 });
        }

        return NextResponse.json(token);
    } catch (error) {
        console.error('Error fetching token:', error);
        return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
    }
}
