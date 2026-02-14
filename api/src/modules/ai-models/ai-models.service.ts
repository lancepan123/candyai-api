import { db } from '../../db';
import { aiModels } from '../../db/schema/ai_models';
import { eq, desc, like, or, count, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const getAIModels = async (page: number = 1, limit: number = 20, search?: string, status?: 'active' | 'inactive' | 'error') => {
    const offset = (page - 1) * limit;
    let query = db.select().from(aiModels).$dynamic();

    if (search) {
        query = query.where(like(aiModels.name, `%${search}%`));
    }

    if (status) {
        query = query.where(eq(aiModels.status, status));
    }

    const models = await query.limit(limit).offset(offset).orderBy(desc(aiModels.createdAt));
    return models;
};

export const getAIModelById = async (id: string) => {
    const result = await db.select().from(aiModels).where(eq(aiModels.id, id)).limit(1);
    return result[0] || null;
};

export const createAIModel = async (data: any) => {
    const id = uuidv4();
    await db.insert(aiModels).values({ ...data, id });
    return getAIModelById(id);
};

export const updateAIModel = async (id: string, data: any) => {
    await db.update(aiModels).set(data).where(eq(aiModels.id, id));
    return getAIModelById(id);
};

export const deleteAIModel = async (id: string) => {
    await db.delete(aiModels).where(eq(aiModels.id, id));
};

export const getAIModelStats = async () => {
    // Use SQL aggregation instead of fetching all models
    const [result] = await db.select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN ${aiModels.status} = 'active' THEN 1 ELSE 0 END)`,
        error: sql<number>`SUM(CASE WHEN ${aiModels.status} = 'error' THEN 1 ELSE 0 END)`,
    }).from(aiModels);
    
    return {
        total: result.total,
        active: result.active || 0,
        error: result.error || 0,
    };
};
