import { mysqlTable, bigint, varchar, timestamp, mysqlEnum, int, text, index } from 'drizzle-orm/mysql-core';

export const aiModels = mysqlTable('ai_models', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'openai', 'anthropic', etc.
  apiUrl: varchar('api_url', { length: 255 }).notNull(),
  apiKey: varchar('api_key', { length: 255 }).notNull(),
  tokenLimit: int('token_limit').notNull(),
  status: mysqlEnum('status', ['active', 'inactive', 'error']).default('active').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  // Index for name search (used in getAIModels with LIKE queries)
  nameIdx: index('name_idx').on(table.name),
  // Index for status filtering (used in getAIModels and getAIModelStats)
  statusIdx: index('status_idx').on(table.status),
  // Composite index for common filter combinations
  statusCreatedIdx: index('status_created_idx').on(table.status, table.createdAt),
}));
