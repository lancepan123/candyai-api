import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getOrders } from '../../modules/orders/orders.service';

export async function ordersRoutes(app: FastifyInstance) {
    // Orders
    app.get('/orders', {
        schema: {
            tags: ['Orders'],
            description: '获取订单列表',
        }
    }, async () => {
        return await getOrders();
    });
}
