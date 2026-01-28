import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getAdminById, updateAdminProfile, getAdmins, createAdmin, updateAdminStatus, logAdminAction } from '../../modules/admins/admins.service';

const AdminResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
    status: z.enum(['active', 'banned']),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
});

export async function adminProfileRoutes(app: FastifyInstance) {
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
}

export async function adminsRoutes(app: FastifyInstance) {
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

}
