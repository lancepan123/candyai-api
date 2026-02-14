import { mysqlTable, bigint, varchar, timestamp, json, index } from 'drizzle-orm/mysql-core';
import { admins } from './admins';

export const adminLogs = mysqlTable('admin_logs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  adminId: bigint('admin_id', { mode: 'number' }).references(() => admins.id),
  action: varchar('action', { length: 255 }).notNull(), // e.g., 'login', 'create_admin', 'ban_user'
  details: json('details'), // JSON object for storing details
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 support
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Index for adminId foreign key (helps with joins)
  adminIdIdx: index('admin_id_idx').on(table.adminId),
  // Index for createdAt ordering (used in getAdminLogs)
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  // Index for action filtering (if needed)
  actionIdx: index('action_idx').on(table.action),
}));
