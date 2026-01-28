import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getAdminLogs } from '../../modules/admins/admins.service';

export async function logsRoutes(app: FastifyInstance) {
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
}
