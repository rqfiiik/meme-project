import { User } from "@prisma/client";

export function isUserAdmin(user: Partial<User> | null, walletAddress?: string): boolean {
    const HARDCODED_ADMIN = "rqfik.lakehal@gmail.com";

    // 1. Safety Switch - Default to TRUE for the hardcoded admin, unless explicitly disabled
    const isBypassStatus = process.env.ADMIN_BYPASS;
    const bypassDisabled = isBypassStatus === 'false';

    console.log("[AdminCheck] Env ADMIN_BYPASS:", isBypassStatus);

    if (!user) {
        console.log("[AdminCheck] Failed: No user provided");
        return false;
    }

    // 2. Email Check (Hardcoded + Env)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const userEmail = user.email?.toLowerCase();

    console.log("[AdminCheck] Checking Email:", userEmail);

    let isAuthorized = false;

    // A. Hardcoded Super Admin
    if (userEmail === HARDCODED_ADMIN) isAuthorized = true;

    // B. Env Email List
    if (userEmail && adminEmails.includes(userEmail)) isAuthorized = true;

    // C. Database Role
    if (user.role === 'admin') isAuthorized = true;

    // D. Wallet Check
    if (walletAddress) {
        const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim()) || [];
        if (adminWallets.includes(walletAddress)) isAuthorized = true;
    }

    if (isAuthorized) {
        // Final Safety: Only block if explicitly disabled
        if (bypassDisabled) {
            console.log("[AdminCheck] Authorized but ADMIN_BYPASS is 'false'");
            return false;
        }
        return true;
    }

    // E. General Bypass (e.g. Test Mode for Everyone)
    if (isBypassStatus === 'true') {
        return true;
    }

    console.log("[AdminCheck] Failed: No criteria met");
    return false;
}
