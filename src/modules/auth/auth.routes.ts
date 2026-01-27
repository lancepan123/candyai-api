import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { registerUser, loginUser, loginAdmin, registerAdmin } from './auth.service';

export async function authRoutes(app: FastifyInstance) {
  // User Auth
  app.withTypeProvider<ZodTypeProvider>().post(
    '/user/register',
    {
      schema: {
        body: z.object({
          username: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (req, reply) => {
        try {
            return await registerUser(app, req.body);
        } catch (e: any) {
            reply.code(400).send({ message: e.message });
        }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/user/login',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
      },
    },
    async (req, reply) => {
        try {
            return await loginUser(app, req.body);
        } catch (e: any) {
            reply.code(401).send({ message: e.message });
        }
    }
  );

  // Admin Auth
  // TODO: Secure admin registration in production (e.g. require secret key)
  app.withTypeProvider<ZodTypeProvider>().post(
    '/admin/register',
    {
      schema: {
        body: z.object({
            username: z.string().min(3),
            password: z.string().min(6),
        }),
      },
    },
    async (req, reply) => {
        try {
            return await registerAdmin(app, req.body);
        } catch (e: any) {
            reply.code(400).send({ message: e.message });
        }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/admin/login',
    {
      schema: {
        body: z.object({
            username: z.string(),
            password: z.string(),
        }),
      },
    },
    async (req, reply) => {
        try {
            return await loginAdmin(app, req.body);
        } catch (e: any) {
            reply.code(401).send({ message: e.message });
        }
    }
  );
}
