import { mysqlTable, bigint, varchar, text, json, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { users } from './users';

export const logs = mysqlTable('logs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  level: mysqlEnum('level', ['info', 'warn', 'error']).notNull().default('info'),
  message: text('message').notNull(),
  meta: json('meta'),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
