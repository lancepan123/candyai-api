import { mysqlTable, bigint, varchar, text, decimal, int, json, timestamp, mysqlEnum, index } from 'drizzle-orm/mysql-core';

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
}, (table) => ({
  // Index for name search
  nameIdx: index('name_idx').on(table.name),
  // Index for status filtering (commonly used to show only active products)
  statusIdx: index('status_idx').on(table.status),
  // Composite index for common queries (active products sorted by creation)
  statusCreatedIdx: index('status_created_idx').on(table.status, table.createdAt),
}));
