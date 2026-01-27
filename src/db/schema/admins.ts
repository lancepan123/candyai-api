import { mysqlTable, bigint, varchar, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

export const admins = mysqlTable('admins', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  status: mysqlEnum('status', ['active', 'banned']).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
