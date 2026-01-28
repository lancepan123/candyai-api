import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { createAIModel, getAIModels, getAIModelById, updateAIModel, deleteAIModel, getAIModelStats } from '../../modules/ai-models/ai-models.service';
import { logAdminAction } from '../../modules/admins/admins.service';

export async function aiModelsRoutes(app: FastifyInstance) {
    // AI Models
    app.withTypeProvider<ZodTypeProvider>().get('/ai-models', {
        schema: {
            tags: ['AI Models'],
            description: '获取AI模型列表',
            querystring: z.object({
                page: z.string().optional().default('1').transform(Number),
                limit: z.string().optional().default('20').transform(Number),
                search: z.string().optional(),
                status: z.enum(['active', 'inactive', 'error']).optional(),
            })
        }
    }, async (req, reply) => {
        const { page, limit, search, status } = req.query;
        return await getAIModels(page, limit, search, status);
    });

    app.withTypeProvider<ZodTypeProvider>().post('/ai-models', {
        schema: {
            tags: ['AI Models'],
            description: '创建AI模型',
            body: z.object({
                name: z.string(),
                provider: z.string(),
                apiUrl: z.string().url(),
                apiKey: z.string(),
                tokenLimit: z.number(),
                status: z.enum(['active', 'inactive', 'error']).optional(),
                description: z.string().optional(),
            })
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const result = await createAIModel(req.body);
        await logAdminAction(adminId, 'create_ai_model', { modelId: result?.id, name: req.body.name });
        return result;
    });

    app.withTypeProvider<ZodTypeProvider>().get('/ai-models/stats', {
        schema: {
            tags: ['AI Models'],
            description: '获取AI模型统计信息',
        }
    }, async (req, reply) => {
        return await getAIModelStats();
    });

    app.withTypeProvider<ZodTypeProvider>().get('/ai-models/:id', {
        schema: {
            tags: ['AI Models'],
            description: '获取AI模型详情',
            params: z.object({
                id: z.string().uuid(),
            })
        }
    }, async (req, reply) => {
        const { id } = req.params;
        const model = await getAIModelById(id);
        if (!model) {
            return reply.code(404).send({ message: 'Model not found' });
        }
        return model;
    });

    app.withTypeProvider<ZodTypeProvider>().put('/ai-models/:id', {
        schema: {
            tags: ['AI Models'],
            description: '更新AI模型',
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                name: z.string().optional(),
                provider: z.string().optional(),
                apiUrl: z.string().url().optional(),
                apiKey: z.string().optional(),
                tokenLimit: z.number().optional(),
                status: z.enum(['active', 'inactive', 'error']).optional(),
                description: z.string().optional(),
            })
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const { id } = req.params;
        const model = await updateAIModel(id, req.body as any); 
        if (!model) {
            return reply.code(404).send({ message: 'Model not found' });
        }
        await logAdminAction(adminId, 'update_ai_model', { modelId: id, updates: req.body });
        return model;
    });

    app.withTypeProvider<ZodTypeProvider>().delete('/ai-models/:id', {
        schema: {
            tags: ['AI Models'],
            description: '删除AI模型',
            params: z.object({
                id: z.string().uuid(),
            })
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const { id } = req.params;
        await deleteAIModel(id);
        await logAdminAction(adminId, 'delete_ai_model', { modelId: id });
        return { message: 'Model deleted successfully' };
    });
}
