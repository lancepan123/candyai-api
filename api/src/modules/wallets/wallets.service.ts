import { db } from '../../db';
import { userWallets } from '../../db/schema/user_wallets';
import { eq, sql } from 'drizzle-orm';

// Ensure wallet exists for user
export const ensureWallet = async (userId: number) => {
    const existing = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    if (existing.length > 0) {
        return existing[0];
    }
    
    // Create new wallet
    await db.insert(userWallets).values({ userId });
    const newWallet = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    return newWallet[0];
};

export const getWalletByUserId = async (userId: number) => {
    return await ensureWallet(userId);
};

export const updateWalletBalance = async (userId: number, amount: number) => {
    await ensureWallet(userId);
    // Use SQL increment to be safe with concurrent updates
    await db.update(userWallets)
        .set({ 
            balance: sql`${userWallets.balance} + ${amount}` 
        })
        .where(eq(userWallets.userId, userId));
    
    return await getWalletByUserId(userId);
};

export const updateWalletCredits = async (userId: number, credits: number) => {
    await ensureWallet(userId);
    await db.update(userWallets)
        .set({ 
            credits: sql`${userWallets.credits} + ${credits}` 
        })
        .where(eq(userWallets.userId, userId));
    
    return await getWalletByUserId(userId);
};
