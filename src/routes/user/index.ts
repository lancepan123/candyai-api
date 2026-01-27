import { FastifyInstance } from 'fastify';
import { verifyJwt } from '../../middlewares/auth';
import { getProducts } from '../../modules/products/products.service';
import { createOrder } from '../../modules/orders/orders.service';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function userRoutes(app: FastifyInstance) {
    app.register(async function (authedRoutes) {
        authedRoutes.addHook('onRequest', verifyJwt);

        authedRoutes.get('/products', async () => {
            return await getProducts();
        });

        authedRoutes.withTypeProvider<ZodTypeProvider>().post('/orders', {
            schema: {
                body: z.object({
                    items: z.array(z.object({
                        productId: z.number(),
                        quantity: z.number()
                    }))
                })
            }
        }, async (req: any, reply) => {
            const userId = req.user.id;
            const result = await createOrder(userId, req.body.items);
            return result;
        });
    });
}
