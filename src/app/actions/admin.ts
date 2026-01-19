'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to check admin
async function checkAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }
    return session.user;
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
    const admin = await checkAdmin();
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

    await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
    });

    // Log Action
    await prisma.adminLog.create({
        data: {
            adminId: admin.id || 'admin',
            action: 'TOGGLE_USER_STATUS',
            targetId: userId,
            details: `Changed status from ${currentStatus} to ${newStatus}`,
        }
    });

    revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
    const admin = await checkAdmin();

    await prisma.user.delete({
        where: { id: userId },
    });

    await prisma.adminLog.create({
        data: {
            adminId: admin.id || 'admin',
            action: 'DELETE_USER',
            targetId: userId,
        }
    });

    revalidatePath('/admin/users');
}

export async function toggleWalletStatus(userId: string, currentStatus: string) {
    const admin = await checkAdmin();
    // Cycle: active -> flagged -> blacklisted -> active
    let newStatus = 'active';
    if (currentStatus === 'active') newStatus = 'flagged';
    else if (currentStatus === 'flagged') newStatus = 'blacklisted';
    else newStatus = 'active';

    await prisma.user.update({
        where: { id: userId },
        data: { walletStatus: newStatus },
    });

    await prisma.adminLog.create({
        data: {
            adminId: admin.id || 'admin',
            action: 'TOGGLE_WALLET_STATUS',
            targetId: userId,
            details: `Changed wallet status from ${currentStatus} to ${newStatus}`,
        }
    });

    revalidatePath('/admin/wallets');
}

export async function requestAutoPayment(userId: string, amount: number) {
    const admin = await checkAdmin();

    // 1. Get User
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user || !user.isAutoPay) {
        throw new Error("User does not have auto-pay enabled");
    }

    // 2. Simulate Blockchain Transaction Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Create Transaction Record (Simulated)
    // Amount is passed in param
    const signature = `simulated_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await prisma.transaction.create({
        data: {
            signature,
            amount,
            userId,
            // Status is implicit success in current schema for logged transactions
        }
    });

    // 4. Update User Subscription Dates
    await prisma.user.update({
        where: { id: userId },
        data: {
            lastPayment: new Date(),
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
            subscriptionStatus: 'active'
        }
    });

    // 5. Log Admin Action
    await prisma.adminLog.create({
        data: {
            adminId: admin.id || 'admin',
            action: 'REQUEST_AUTO_PAYMENT',
            targetId: userId,
            details: `Requested ${amount} SOL payment. Signature: ${signature}`,
        }
    });

    revalidatePath('/admin/subscriptions');
    revalidatePath('/admin/revenue');
    revalidatePath('/admin/transactions');
}

export async function cancelSubscription(userId: string) {
    const admin = await checkAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: {
            subscriptionStatus: 'canceled',
            // Keep nextPayment date or clear it? Keeping it allows access until end of term.
            // But usually "cancel" means "cancel auto-renew".
            isAutoPay: false
        }
    });

    await prisma.adminLog.create({
        data: {
            adminId: admin.id || 'admin',
            action: 'CANCEL_SUBSCRIPTION',
            targetId: userId,
            details: 'Canceled user subscription and auto-pay',
        }
    });

    revalidatePath('/admin/subscriptions');
}
