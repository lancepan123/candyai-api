import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { registerUser, loginUser, loginAdmin } from './auth.service';
import { verifyJwt } from '../../middlewares/auth';

export async function authRoutes(app: FastifyInstance) {
  // User Auth
  app.withTypeProvider<ZodTypeProvider>().post(
    '/user/register',
    {
      schema: {
        tags: ['Auth'],
        description: '用户注册',
        body: z.object({
          username: z.string().min(3),
          phone: z.string().min(11),
          password: z.string().min(6),
          avatarUrl: z.string().optional(),
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
        tags: ['Auth'],
        description: '用户登录',
        body: z.object({
          phone: z.string().min(11),
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
  app.withTypeProvider<ZodTypeProvider>().post(
    '/admin/login',
    {
      schema: {
        tags: ['Auth'],
        description: '管理员登录',
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

  // Protected Routes (Logout)
  app.register(async function (protectedRoutes) {
      protectedRoutes.addHook('onRequest', verifyJwt);

      protectedRoutes.withTypeProvider<ZodTypeProvider>().post('/user/logout', {
          schema: {
              tags: ['Auth'],
              description: '用户退出登录',
              response: {
                  200: z.object({
                      message: z.string(),
                  })
              }
          }
      }, async (req, reply) => {
          // In a stateless JWT setup, the server doesn't need to do anything.
          // The client should remove the token.
          return { message: 'Logout successful' };
      });

      protectedRoutes.withTypeProvider<ZodTypeProvider>().post('/admin/logout', {
          schema: {
              tags: ['Auth'],
              description: '管理员退出登录',
              response: {
                  200: z.object({
                      message: z.string(),
                  })
              }
          }
      }, async (req, reply) => {
          return { message: 'Logout successful' };
      });
  });
}