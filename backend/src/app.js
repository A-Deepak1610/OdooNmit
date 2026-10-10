import express from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import healthRoutes from './modules/health/health.routes.js';

const app = express();

// Security and standard middlewares
app.use(cors({
  origin: '*', // Customize with allowed frontend origin in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requestIdMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Health check module
app.use('/api/v1/health', healthRoutes);

// Catch-all for undefined routes
app.use(notFoundMiddleware);

// Central error handler
app.use(errorMiddleware);

export default app;
