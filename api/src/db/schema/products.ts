import { mysqlTable, bigint, varchar, text, decimal, int, json, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

export const products = mysqlTable('products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  images: json('images').$type<string[]>().default([]),
  status: mysqlEnum('status', ['active', 'draft', 'archived']).default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
