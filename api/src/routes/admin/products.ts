import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { createProduct } from '../../modules/products/products.service';
import { logAdminAction } from '../../modules/admins/admins.service';

export async function productsRoutes(app: FastifyInstance) {
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
}
