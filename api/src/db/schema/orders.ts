import { mysqlTable, bigint, decimal, timestamp, mysqlEnum, int, index } from 'drizzle-orm/mysql-core';
import { users } from './users';
import { products } from './products';

export const orders = mysqlTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['pending', 'paid', 'shipped', 'completed', 'cancelled']).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  // Index for userId foreign key (helps with joins and user order lookups)
  userIdIdx: index('user_id_idx').on(table.userId),
  // Index for status filtering
  statusIdx: index('status_idx').on(table.status),
  // Index for createdAt ordering (used in getOrders)
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  // Composite index for common queries
  userStatusIdx: index('user_status_idx').on(table.userId, table.status),
}));

export const orderItems = mysqlTable('order_items', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id).notNull(),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id).notNull(),
  quantity: int('quantity').notNull(),
  priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  // Index for orderId foreign key (helps with order item lookups)
  orderIdIdx: index('order_id_idx').on(table.orderId),
  // Index for productId foreign key (helps with product order history)
  productIdIdx: index('product_id_idx').on(table.productId),
}));
