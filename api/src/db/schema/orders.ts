import { mysqlTable, bigint, decimal, timestamp, mysqlEnum, int } from 'drizzle-orm/mysql-core';
import { users } from './users';
import { products } from './products';

export const orders = mysqlTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['pending', 'paid', 'shipped', 'completed', 'cancelled']).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const orderItems = mysqlTable('order_items', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id).notNull(),
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id).notNull(),
  quantity: int('quantity').notNull(),
  priceAtPurchase: decimal('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
});
