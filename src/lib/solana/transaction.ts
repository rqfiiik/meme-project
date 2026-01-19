import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Replace with your actual service wallet address
export const SERVICE_WALLET_PUBLIC_KEY = new PublicKey('Fs6ticsHoToi5CDTzWUtMGisgdXf5vy3nMqxePGCjCcq');

interface CreateTransferTransactionParams {
    connection: Connection;
    publicKey: PublicKey; // The user's public key (sender)
    amount: number; // Amount in SOL
    destination?: PublicKey; // Optional destination, defaults to SERVICE_WALLET
}

export const createTransferTransaction = async ({
    connection,
    publicKey,
    amount,
    destination = SERVICE_WALLET_PUBLIC_KEY
}: CreateTransferTransactionParams): Promise<Transaction> => {
    const transaction = new Transaction();

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: destination,
            lamports: amount * LAMPORTS_PER_SOL,
        })
    );

    return transaction;
};
