import { FastifyInstance } from 'fastify';
import { verifyJwt } from '../../middlewares/auth';
import { getWalletByUserId, updateWalletBalance, updateWalletCredits } from '../../modules/wallets/wallets.service';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function walletRoutes(app: FastifyInstance) {
    app.addHook('onRequest', verifyJwt);

    app.withTypeProvider<ZodTypeProvider>().get('/wallet', {
        schema: {
            tags: ['Wallet'],
            description: '获取我的钱包余额',
            response: {
                200: z.object({
                    id: z.number(),
                    userId: z.number(),
                    balance: z.string(), // Decimal returned as string
                    currency: z.string(),
                    credits: z.number(),
                    createdAt: z.date().nullable(),
                    updatedAt: z.date().nullable(),
                })
            }
        }
    }, async (req: any, reply) => {
        const userId = req.user.id;
        const wallet = await getWalletByUserId(userId);
        return wallet;
    });

    // Mock Top-up (In production, this would be a callback from payment gateway)
    app.withTypeProvider<ZodTypeProvider>().post('/wallet/topup', {
        schema: {
            tags: ['Wallet'],
            description: '钱包充值 (模拟)',
            body: z.object({
                amount: z.number().min(0.01),
            }),
            response: {
                200: z.object({
                    id: z.number(),
                    userId: z.number(),
                    balance: z.string(),
                    currency: z.string(),
                    credits: z.number(),
                    createdAt: z.date().nullable(),
                    updatedAt: z.date().nullable(),
                })
            }
        }
    }, async (req: any, reply) => {
        const userId = req.user.id;
        const { amount } = req.body;
        const wallet = await updateWalletBalance(userId, amount);
        return wallet;
    });

    // Mock Credits Exchange (Buy credits with balance)
    app.withTypeProvider<ZodTypeProvider>().post('/wallet/exchange-credits', {
        schema: {
            tags: ['Wallet'],
            description: '兑换积分 (1 CNY = 10 Credits)',
            body: z.object({
                amount: z.number().min(1), // Amount of CNY to spend
            }),
            response: {
                200: z.object({
                    id: z.number(),
                    userId: z.number(),
                    balance: z.string(),
                    currency: z.string(),
                    credits: z.number(),
                    createdAt: z.date().nullable(),
                    updatedAt: z.date().nullable(),
                })
            }
        }
    }, async (req: any, reply) => {
        const userId = req.user.id;
        const { amount } = req.body;
        
        // Check balance
        const wallet = await getWalletByUserId(userId);
        if (parseFloat(wallet.balance) < amount) {
            return reply.code(400).send({ message: 'Insufficient balance' });
        }

        // Deduct balance and add credits
        await updateWalletBalance(userId, -amount);
        const updatedWallet = await updateWalletCredits(userId, amount * 10); // 1:10 ratio
        return updatedWallet;
    });
}
