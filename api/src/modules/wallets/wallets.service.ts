import { db } from '../../db';
import { userWallets } from '../../db/schema/user_wallets';
import { eq, sql } from 'drizzle-orm';

// Ensure wallet exists for user - optimized to reduce queries
export const ensureWallet = async (userId: number) => {
    const existing = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    if (existing.length > 0) {
        return existing[0];
    }
    
    // Create new wallet and return it in one go
    // MySQL doesn't support RETURNING, so we still need to fetch after insert
    const [result] = await db.insert(userWallets).values({ userId });
    // Return the created wallet with default values
    return {
        id: result.insertId,
        userId,
        balance: '0.00',
        currency: 'CNY',
        credits: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

export const getWalletByUserId = async (userId: number) => {
    return await ensureWallet(userId);
};

export const updateWalletBalance = async (userId: number, amount: number) => {
    // Ensure wallet exists first
    await ensureWallet(userId);
    
    // Use SQL increment to be safe with concurrent updates and return updated wallet in same query
    await db.update(userWallets)
        .set({ 
            balance: sql`${userWallets.balance} + ${amount}` 
        })
        .where(eq(userWallets.userId, userId));
    
    // Fetch and return the updated wallet - combined with ensure check above = 2-3 queries total
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
    
    // Fetch and return the updated wallet - combined with ensure check above = 2-3 queries total
    const [wallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    return wallet;
};
