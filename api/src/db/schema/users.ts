import { mysqlTable, bigint, varchar, timestamp, mysqlEnum, index } from 'drizzle-orm/mysql-core';
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
}, (table) => ({
  // Index for username search (used in getUsers with LIKE queries)
  usernameIdx: index('username_idx').on(table.username),
  // Index for status filtering
  statusIdx: index('status_idx').on(table.status),
  // Index for roleId foreign key (helps with joins)
  roleIdIdx: index('role_id_idx').on(table.roleId),
  // Composite index for common queries
  statusCreatedIdx: index('status_created_idx').on(table.status, table.createdAt),
}));
