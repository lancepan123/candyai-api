import { mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const systemConfig = mysqlTable('system_config', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: text('value').notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
