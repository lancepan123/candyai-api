import { mysqlTable, bigint, varchar, timestamp, text } from 'drizzle-orm/mysql-core';

export const roles = mysqlTable('roles', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull().unique(), // e.g., 'standard', 'vip'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
