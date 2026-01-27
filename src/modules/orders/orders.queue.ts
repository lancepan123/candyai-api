import { createQueue, createWorker } from '../../lib/queue';
import { db } from '../../db';
import { orders } from '../../db/schema/orders';
import { eq, and } from 'drizzle-orm';
import { getIo } from '../../lib/socket';

export const orderQueue = createQueue('order-queue');

export const initOrderWorker = () => {
    createWorker('order-queue', async (job: any) => {
        if (job.name === 'cancel-timeout') {
            const { orderId } = job.data;
            try {
                const order = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.status, 'pending'))).limit(1);
                
                if (order.length > 0) {
                    await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, orderId));
                    console.log(`Order ${orderId} cancelled due to timeout`);
                    
                    // Notify user via Socket
                    try {
                        const io = getIo();
                        io.emit(`order:${orderId}`, { status: 'cancelled' });
                    } catch (e) {
                        // Socket might not be init if running in worker process separately
                        console.error('Socket emit failed in worker', e);
                    }
                }
            } catch (err) {
                console.error('Error processing job', err);
            }
        }
    });
};
