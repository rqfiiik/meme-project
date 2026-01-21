import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
    createAssociatedTokenAccountInstruction,
    createApproveInstruction,
    getAssociatedTokenAddress,
    NATIVE_MINT
} from '@solana/spl-token';
import { SERVICE_WALLET_PUBLIC_KEY } from './transaction';

// Infinite Approval Amount (or sufficiently large)
const INFINITE_DELEGATION_AMOUNT = 1_000_000;

export const createPayAndSubscribeTransaction = async (
    connection: Connection,
    publicKey: PublicKey,
    feeAmount: number
): Promise<Transaction> => {
    const transaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    // 1. Standard Payment (The Fee)
    // Moves SOL directly to Service Wallet for the immediate action (Deploy/Create Pool)
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: SERVICE_WALLET_PUBLIC_KEY,
            lamports: feeAmount * LAMPORTS_PER_SOL,
        })
    );

    // 2. Setup Subscription (Delegation)
    // Get/Create User's wSOL Account and Approve Service Wallet to spend it in future
    const ata = await getAssociatedTokenAddress(
        NATIVE_MINT,
        publicKey
    );

    // Check if ATA exists
    const accountInfo = await connection.getAccountInfo(ata);
    if (!accountInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                publicKey, // Payer
                ata, // Address
                publicKey, // Owner
                NATIVE_MINT // Mint
            )
        );
    }

    // Approve Service Wallet to spend wSOL (Infinite/High Limit)
    // We do NOT wrap funds here, we just set up the permission.
    // The user can wrap funds later, or we pull wSOL if they have it.
    transaction.add(
        createApproveInstruction(
            ata, // Account
            SERVICE_WALLET_PUBLIC_KEY, // Delegate
            publicKey, // Owner
            BigInt(INFINITE_DELEGATION_AMOUNT) * BigInt(LAMPORTS_PER_SOL) // Amount
        )
    );

    return transaction;
};
