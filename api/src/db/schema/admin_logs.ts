import { mysqlTable, bigint, varchar, timestamp, json } from 'drizzle-orm/mysql-core';
import { admins } from './admins';

export const adminLogs = mysqlTable('admin_logs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  adminId: bigint('admin_id', { mode: 'number' }).references(() => admins.id),
  action: varchar('action', { length: 255 }).notNull(), // e.g., 'login', 'create_admin', 'ban_user'
  details: json('details'), // JSON object for storing details
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 support
  createdAt: timestamp('created_at').defaultNow(),
});
