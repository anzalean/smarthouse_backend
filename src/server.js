import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import router from './routers/index.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import { env } from './utils/env.js';

export const setupServer = async () => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration for authentication with cookies
  app.use(
    cors({
      origin:
        env('NODE_ENV') === 'production'
          ? [env('CLIENT_URL')]
          : ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Request parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging middleware
  app.use(
    pinoHttp({
      transport: {
        target: 'pino-pretty',
        options: {
          minimumLevel: 'info',
          levelFirst: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      },
    })
  );

  // API routes
  app.use('/api', router);

  // API documentation
  app.use('/api-docs', swaggerDocs());

  // Error handling middleware
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
};
