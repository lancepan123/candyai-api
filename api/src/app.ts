import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { authRoutes } from './modules/auth/auth.routes';
import { adminRoutes } from './routes/admin';
import { userRoutes } from './routes/user';
import { walletRoutes } from './routes/user/wallet';
import { uploadRoutes } from './routes/upload';

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  // Validation
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Plugins
  await app.register(cors, {
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.register(multipart);

  // Helmet can sometimes block swagger UI resources, configure carefully or disable CSP for docs
  await app.register(helmet, {
      contentSecurityPolicy: false // Disabled for simplicity in dev/docs, enable with specific config in prod
  });
  
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'secret',
  });

  // Swagger Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'CandyAI API',
        description: 'CandyAI 后端 API 文档',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3005',
          description: 'Local Development Server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            // @ts-ignore
            description: 'Enter your bearer token in the format **Bearer &lt;token&gt;**',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
  });

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(userRoutes, { prefix: '/api/user' });
  await app.register(walletRoutes, { prefix: '/api/me' }); // Wallet routes under /api/me
  await app.register(uploadRoutes, { prefix: '/api/admin' }); // Upload route under /api/admin

  // Health Check
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
};
