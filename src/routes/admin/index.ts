import { FastifyInstance } from 'fastify';
import { verifyJwt, verifyAdmin } from '../../middlewares/auth';
import { createProduct } from '../../modules/products/products.service';
import { getOrders } from '../../modules/orders/orders.service';
import { getUsers, getUserById, updateUserBanStatus } from '../../modules/users/users.service';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function adminRoutes(app: FastifyInstance) {
    app.addHook('onRequest', verifyJwt);
    app.addHook('onRequest', verifyAdmin);

    // Products
    app.withTypeProvider<ZodTypeProvider>().post('/products', {
        schema: {
            body: z.object({
                name: z.string(),
                description: z.string().optional(),
                price: z.number(),
                stock: z.number(),
            })
        }
    }, async (req, reply) => {
        await createProduct(req.body);
        return { message: 'Product created' };
    });

    // Orders
    app.get('/orders', async () => {
        return await getOrders();
    });

    // Users
    app.withTypeProvider<ZodTypeProvider>().get('/users', {
        schema: {
            querystring: z.object({
                page: z.string().optional().default('1').transform(Number),
                limit: z.string().optional().default('10').transform(Number),
            })
        }
    }, async (req, reply) => {
        const { page, limit } = req.query;
        return await getUsers(page, limit);
    });

    app.withTypeProvider<ZodTypeProvider>().get('/users/:id', {
        schema: {
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
            params: z.object({
                id: z.string().transform(Number),
            }),
            body: z.object({
                isBanned: z.boolean(),
            })
        }
    }, async (req, reply) => {
        const { id } = req.params;
        const { isBanned } = req.body;
        return await updateUserBanStatus(id, isBanned);
    });
}
