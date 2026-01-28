import { FastifyInstance } from 'fastify';
import { uploadToOSS } from '../../modules/upload/upload.service';
import { verifyJwt, verifyAdmin } from '../../middlewares/auth';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function uploadRoutes(app: FastifyInstance) {
    app.addHook('onRequest', verifyJwt);
    app.addHook('onRequest', verifyAdmin);

    app.withTypeProvider<ZodTypeProvider>().post('/upload', {
        schema: {
            tags: ['Upload'],
            description: 'Upload file to OSS',
            response: {
                200: z.object({
                    url: z.string(),
                }),
                400: z.object({ message: z.string() }),
                500: z.object({ message: z.string() }),
            }
        }
    }, async (req, reply) => {
        const data = await req.file();
        if (!data) {
            return reply.code(400).send({ message: 'No file uploaded' });
        }

        try {
            const url = await uploadToOSS(data.file, data.filename);
            return { url };
        } catch (e: any) {
            return reply.code(500).send({ message: e.message || 'Upload failed' });
        }
    });
}
