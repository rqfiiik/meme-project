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

    // Immediate Super Admin Check
    if (userEmail === HARDCODED_ADMIN) {
        if (bypassDisabled) {
            console.log("[AdminCheck] Failed: Specific Admin found but ADMIN_BYPASS is explicitly false");
            return false;
        }
        console.log("[AdminCheck] Success: Super Admin (Hardcoded)");
        return true;
    }

    // For other admins, enforce strict true
    if (isBypassStatus !== 'true') {
        console.log("[AdminCheck] Failed: Bypass env not strictly 'true' for non-hardcoded admin");
        return false;
    }

    if (userEmail && adminEmails.includes(userEmail)) {
        console.log("[AdminCheck] Success: Email match in Env List");
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
