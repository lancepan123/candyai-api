import { db } from '../../db';
import { orders, orderItems } from '../../db/schema/orders';
import { products } from '../../db/schema/products';
import { eq, inArray, desc } from 'drizzle-orm';
import { orderQueue } from './orders.queue';
import { getIo } from '../../lib/socket';

export const createOrder = async (userId: number, items: { productId: number; quantity: number }[]) => {
    // Batch fetch all products at once to avoid N+1 query problem
    const productIds = items.map(item => item.productId);
    const productsList = await db.select().from(products).where(inArray(products.id, productIds));
    
    // Create a map for O(1) lookup
    const productsMap = new Map(productsList.map(p => [p.id, p]));
    
    // Calculate total and validate stock
    let total = 0;
    for (const item of items) {
        const product = productsMap.get(item.productId);
        if (product) {
            total += Number(product.price) * item.quantity;
        }
    }
    
    const [result] = await db.insert(orders).values({
        userId,
        totalAmount: total.toFixed(2), 
        status: 'pending'
    });
    
    const orderId = result.insertId;
    
    // Batch insert order items
    const orderItemsValues = items
        .map(item => {
            const product = productsMap.get(item.productId);
            if (product) {
                return {
                    orderId: orderId,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtPurchase: product.price
                };
            }
            return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    
    if (orderItemsValues.length > 0) {
        await db.insert(orderItems).values(orderItemsValues);
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

export const getOrders = async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit;
    return await db.select().from(orders).limit(limit).offset(offset).orderBy(desc(orders.createdAt));
};
