import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { userRouter } from './modules/user/user.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { studentRouter } from './modules/student/student.routes.js';
import { presidentRouter } from './modules/president/president.routes.js';
import { treasurerRouter } from './modules/treasurer/treasurer.routes.js';
import { eventRouter } from './modules/event/event.routes.js';
import { merchandiseRouter } from './modules/merchandise/merchandise.routes.js';
import { paymentRouter } from './modules/payment/payment.routes.js';
import { errorHandler } from './common/middlewares/error.middleware.js';

export const app = express();

app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: ENV.APP_NAME,
  });
});

// Payment gateway routes (Razorpay order creation & webhook)
app.use('/api/payment', paymentRouter);
app.use('/api/v1/payment', paymentRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/student', studentRouter);
app.use('/api/v1/president', presidentRouter);
app.use('/api/v1/treasurer', treasurerRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/merchandise', merchandiseRouter);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on path: ${req.originalUrl}`,
  });
});

app.use(errorHandler);
