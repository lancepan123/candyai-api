import { FastifyInstance } from 'fastify';
import { verifyJwt, verifyAdmin } from '../../middlewares/auth';
import { createProduct } from '../../modules/products/products.service';
import { getOrders } from '../../modules/orders/orders.service';
import { getUsers, getUserById, updateUserBanStatus, getUserStats } from '../../modules/users/users.service';
import { createAIModel, getAIModels, getAIModelById, updateAIModel, deleteAIModel, getAIModelStats } from '../../modules/ai-models/ai-models.service';
import { getAdminById, updateAdminProfile, getAdmins, createAdmin, updateAdminStatus, logAdminAction, getAdminLogs } from '../../modules/admins/admins.service';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

const AdminResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
    status: z.enum(['active', 'banned']),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
});

export async function adminRoutes(app: FastifyInstance) {
    app.addHook('onRequest', verifyJwt);
    app.addHook('onRequest', verifyAdmin);

    // Admin Profile
    app.withTypeProvider<ZodTypeProvider>().get('/me', {
        schema: {
            tags: ['Admin Profile'],
            description: '获取当前管理员信息',
            response: {
                200: AdminResponseSchema,
                404: z.object({ message: z.string() })
            }
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const admin = await getAdminById(adminId);
        if (!admin) {
            return reply.code(404).send({ message: 'Admin not found' });
        }
        return admin;
    });

    app.withTypeProvider<ZodTypeProvider>().patch('/me', {
        schema: {
            tags: ['Admin Profile'],
            description: '更新当前管理员信息',
            body: z.object({
                username: z.string().optional(),
                avatarUrl: z.string().url().optional().or(z.literal('')),
            }),
            response: {
                200: AdminResponseSchema,
                404: z.object({ message: z.string() })
            }
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const admin = await updateAdminProfile(adminId, req.body);
        if (!admin) {
            return reply.code(404).send({ message: 'Admin not found' });
        }
        await logAdminAction(adminId, 'update_profile', { ...req.body });
        return admin;
    });

    // Admin Management
    app.withTypeProvider<ZodTypeProvider>().get('/admins', {
        schema: {
            tags: ['Admin Management'],
            description: '获取所有管理员',
            response: {
                200: z.array(AdminResponseSchema)
            }
        }
    }, async (req, reply) => {
        return await getAdmins();
    });

    app.withTypeProvider<ZodTypeProvider>().post('/admins', {
        schema: {
            tags: ['Admin Management'],
            description: '添加管理员',
            body: z.object({
                username: z.string().min(3),
                password: z.string().min(6),
                avatarUrl: z.string().url().optional(),
            }),
            response: {
                200: AdminResponseSchema,
                400: z.object({ message: z.string() })
            }
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        try {
            const newAdmin = await createAdmin(req.body);
            if (!newAdmin) throw new Error('Create failed');
            await logAdminAction(adminId, 'create_admin', { newAdminId: newAdmin.id, username: newAdmin.username });
            return newAdmin;
        } catch (e: any) {
            return reply.code(400).send({ message: e.message || 'Create failed' });
        }
    });

    app.withTypeProvider<ZodTypeProvider>().patch('/admins/:id/ban', {
        schema: {
            tags: ['Admin Management'],
            description: '禁用/解禁管理员',
            params: z.object({
                id: z.string().transform(Number),
            }),
            body: z.object({
                status: z.enum(['active', 'banned']),
            }),
            response: {
                200: AdminResponseSchema,
                400: z.object({ message: z.string() }),
                404: z.object({ message: z.string() })
            }
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const targetId = req.params.id;
        const { status } = req.body;

        if (adminId === targetId) {
            return reply.code(400).send({ message: 'Cannot ban yourself' });
        }

        const updatedAdmin = await updateAdminStatus(targetId, status);
        if (!updatedAdmin) {
            return reply.code(404).send({ message: 'Admin not found' });
        }
        await logAdminAction(adminId, 'update_admin_status', { targetId, status });
        return updatedAdmin;
    });

    // Admin Logs
    app.withTypeProvider<ZodTypeProvider>().get('/logs', {
        schema: {
            tags: ['Admin Logs'],
            description: '获取管理员操作日志',
            querystring: z.object({
                limit: z.string().optional().default('50').transform(Number),
            })
        }
    }, async (req, reply) => {
        const { limit } = req.query;
        return await getAdminLogs(limit);
    });

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

    // Products
    app.withTypeProvider<ZodTypeProvider>().post('/products', {
        schema: {
            tags: ['Products'],
            description: '创建商品',
            body: z.object({
                name: z.string(),
                description: z.string().optional(),
                price: z.number(),
                stock: z.number(),
            })
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        await createProduct(req.body);
        await logAdminAction(adminId, 'create_product', { name: req.body.name });
        return { message: 'Product created' };
    });

    // Orders
    app.get('/orders', {
        schema: {
            tags: ['Orders'],
            description: '获取订单列表',
        }
    }, async () => {
        return await getOrders();
    });

    // Users
    app.withTypeProvider<ZodTypeProvider>().get('/users', {
        schema: {
            tags: ['Admin Users'],
            description: '获取用户列表 (分页)',
            querystring: z.object({
                page: z.string().optional().default('1').transform(Number),
                limit: z.string().optional().default('10').transform(Number),
            })
        }
    }, async (req, reply) => {
        const { page, limit } = req.query;
        return await getUsers(page, limit);
    });

    app.withTypeProvider<ZodTypeProvider>().get('/users/stats', {
        schema: {
            tags: ['Admin Users'],
            description: '获取用户统计信息',
        }
    }, async (req, reply) => {
        return await getUserStats();
    });

    app.withTypeProvider<ZodTypeProvider>().get('/users/:id', {
        schema: {
            tags: ['Admin Users'],
            description: '获取用户详情',
            params: z.object({
                id: z.string().transform(Number),
            })
        }
    }, async (req, reply) => {
        const { id } = req.params;
        const user = await getUserById(id);
        if (!user) {
            return reply.code(404).send({ message: 'User not found' });
        }
        return user;
    });

    app.withTypeProvider<ZodTypeProvider>().patch('/users/:id/ban', {
        schema: {
            tags: ['Admin Users'],
            description: '封禁/解封用户',
            params: z.object({
                id: z.string().transform(Number),
            }),
            body: z.object({
                isBanned: z.boolean(),
            })
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const { id } = req.params;
        const { isBanned } = req.body;
        const result = await updateUserBanStatus(id, isBanned);
        await logAdminAction(adminId, 'ban_user', { userId: id, isBanned });
        return result;
    });
}