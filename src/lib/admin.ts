import { User } from "@prisma/client";

/**
 * Checks if a user is an admin based on:
 * 1. ADMIN_BYPASS env var being true (if false, everyone is treated as non-admin for bypass purposes)
 * 2. Email in ADMIN_EMAILS env var
 * 3. Role in DB is 'admin'
 * 4. Wallet address in ADMIN_WALLETS env var
 */
export function isUserAdmin(user: Partial<User> | null, walletAddress?: string): boolean {
    // 1. Safety Switch
    if (process.env.ADMIN_BYPASS !== 'true') {
        return false;
    }

    if (!user) return false;

    // 2. Email Check
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        return true;
    }

    // 3. Database Role Check
    if (user.role === 'admin') {
        return true;
    }

    // 4. Wallet Check
    if (walletAddress) {
        const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim()) || [];
        if (adminWallets.includes(walletAddress)) {
            return true;
        }
    }

    return false;
}
