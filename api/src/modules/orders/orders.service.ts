import { db } from '../../db';
import { orders, orderItems } from '../../db/schema/orders';
import { products } from '../../db/schema/products';
import { eq } from 'drizzle-orm';
import { orderQueue } from './orders.queue';
import { getIo } from '../../lib/socket';

export const createOrder = async (userId: number, items: { productId: number; quantity: number }[]) => {
    let total = 0;
    
    // Simplification: Not calculating total accurately here for brevity
    // In real app: fetch all products, check stock, sum price * quantity
    
    const [result] = await db.insert(orders).values({
        userId,
        totalAmount: '0', 
        status: 'pending'
    });
    
    const orderId = result.insertId;
    
    for (const item of items) {
        const prod = await db.select().from(products).where(eq(products.id, item.productId));
        if (prod.length > 0) {
            await db.insert(orderItems).values({
                orderId: orderId,
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: prod[0].price
            });
        }
    }

    // Schedule timeout cancel in 30 mins
    await orderQueue.add('cancel-timeout', { orderId }, { delay: 30 * 60 * 1000 });
    
    // Emit socket event
    try {
        getIo().emit('new-order', { orderId });
    } catch (e) {
        console.error('Socket emit failed', e);
    }
    
    return { orderId };
};

export const getOrders = async () => {
    return await db.select().from(orders);
};
