import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getUsers, getUserById, updateUserBanStatus, getUserStats, deleteUser, getRoles, createUser } from '../../modules/users/users.service';
import { logAdminAction } from '../../modules/admins/admins.service';

export async function usersRoutes(app: FastifyInstance) {
    // Roles
    app.withTypeProvider<ZodTypeProvider>().get('/roles', {
        schema: {
            tags: ['Admin Roles'],
            description: '获取角色列表',
            response: {
                200: z.array(z.object({
                    title: z.string(),
                    value: z.string()
                }))
            }
        }
    }, async (req, reply) => {
        return await getRoles();
    });

    // Users
    app.withTypeProvider<ZodTypeProvider>().get('/users', {
        schema: {
            tags: ['Admin Users'],
            description: '获取用户列表 (分页)',
            querystring: z.object({
                page: z.string().optional().default('1').transform(Number),
                limit: z.string().optional().default('10').transform(Number),
                search: z.string().optional(),
                role: z.string().optional(),
                status: z.string().optional(),
            })
        }
    }, async (req, reply) => {
        const { page, limit, search, role, status } = req.query;
        return await getUsers(page, limit, search, role, status);
    });

    app.withTypeProvider<ZodTypeProvider>().post('/users', {
        schema: {
            tags: ['Admin Users'],
            description: '创建用户',
            body: z.object({
                fullName: z.string(),
                username: z.string(),
                email: z.string().email(),
                role: z.string().optional(),
                plan: z.string().optional(),
                status: z.string().optional(),
                password: z.string().optional() // Optional for now
            })
        }
    }, async (req, reply) => {
        const adminId = req.user.id;
        const newUser = await createUser(req.body);
        await logAdminAction(adminId, 'create_user', { userId: newUser.id });
        return newUser;
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

    app.withTypeProvider<ZodTypeProvider>().delete('/users/:id', {
        schema: {
            tags: ['Admin Users'],
            description: '删除用户',
            params: z.object({
                id: z.string().transform(Number),
            })
        }
    }, async (req: any, reply) => {
        const adminId = req.user.id;
        const { id } = req.params;
        await deleteUser(id);
        await logAdminAction(adminId, 'delete_user', { userId: id });
        return { message: 'User deleted successfully' };
    });
}
