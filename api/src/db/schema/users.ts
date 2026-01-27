import { mysqlTable, bigint, varchar, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { roles } from './roles';

export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  roleId: bigint('role_id', { mode: 'number' }).references(() => roles.id),
  status: mysqlEnum('status', ['active', 'banned']).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
