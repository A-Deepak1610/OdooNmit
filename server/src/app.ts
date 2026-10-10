import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/user/user.routes.js';
import { errorHandler } from './common/middlewares/error.middleware.js';

export const app = express();

app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: ENV.APP_NAME,
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on path: ${req.originalUrl}`,
  });
});

app.use(errorHandler);
