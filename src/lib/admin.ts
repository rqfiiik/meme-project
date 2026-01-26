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
    console.log("[AdminCheck] Env ADMIN_BYPASS:", process.env.ADMIN_BYPASS);
    if (process.env.ADMIN_BYPASS !== 'true') {
        console.log("[AdminCheck] Failed: Bypass env not true");
        return false;
    }

    if (!user) {
        console.log("[AdminCheck] Failed: No user provided");
        return false;
    }

    // 2. Email Check
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    console.log("[AdminCheck] Checking Email:", user.email, "against", adminEmails);
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        console.log("[AdminCheck] Success: Email match");
        return true;
    }

    // 3. Database Role Check
    console.log("[AdminCheck] Checking Role:", user.role);
    if (user.role === 'admin') {
        console.log("[AdminCheck] Success: Role is admin");
        return true;
    }

    // 4. Wallet Check
    if (walletAddress) {
        const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim()) || [];
        console.log("[AdminCheck] Checking Wallet:", walletAddress, "against", adminWallets);
        if (adminWallets.includes(walletAddress)) {
            console.log("[AdminCheck] Success: Wallet match");
            return true;
        }
    }

    console.log("[AdminCheck] Failed: No criteria met");
    return false;
}
