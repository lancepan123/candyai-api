import { db } from '../../db';
import { userWallets } from '../../db/schema/user_wallets';
import { eq, sql } from 'drizzle-orm';

// Ensure wallet exists for user - optimized to reduce queries
export const ensureWallet = async (userId: number) => {
    const existing = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    if (existing.length > 0) {
        return existing[0];
    }
    
    // Create new wallet
    // MySQL doesn't support RETURNING, so we need to fetch after insert
    await db.insert(userWallets).values({ userId });
    
    // Fetch the newly created wallet to ensure we return accurate data
    const [newWallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    return newWallet;
};

export const getWalletByUserId = async (userId: number) => {
    return await ensureWallet(userId);
};

export const updateWalletBalance = async (userId: number, amount: number) => {
    // Ensure wallet exists first
    await ensureWallet(userId);
    
    // Use SQL increment to be safe with concurrent updates
    await db.update(userWallets)
        .set({ 
            balance: sql`${userWallets.balance} + ${amount}` 
        })
        .where(eq(userWallets.userId, userId));
    
    // Fetch and return the updated wallet - total 2-3 queries depending on wallet existence
    const [wallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    return wallet;
};

export const updateWalletCredits = async (userId: number, credits: number) => {
    // Ensure wallet exists first
    await ensureWallet(userId);
    
    await db.update(userWallets)
        .set({ 
            credits: sql`${userWallets.credits} + ${credits}` 
        })
        .where(eq(userWallets.userId, userId));
    
    // Fetch and return the updated wallet - total 2-3 queries depending on wallet existence
    const [wallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    return wallet;
};
