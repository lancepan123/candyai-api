import { mysqlTable, bigint, varchar, timestamp, decimal } from 'drizzle-orm/mysql-core';
import { users } from './users';

export const userWallets = mysqlTable('user_wallets', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull().unique(),
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 10 }).default('CNY').notNull(), // Main currency (e.g., CNY, USD)
  credits: bigint('credits', { mode: 'number' }).default(0).notNull(), // AI Compute Credits (Tokens/Points)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
