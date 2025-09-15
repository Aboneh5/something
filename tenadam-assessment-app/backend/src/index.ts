import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessment';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Tenadam Assessment Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: {
      auth: [
        'POST /api/auth/validate-code',
        'POST /api/auth/register',
        'POST /api/auth/admin-login',
        'POST /api/auth/logout',
        'GET /api/auth/session'
      ],
      assessment: [
        'GET /api/assessment/categories',
        'GET /api/assessment/questions/:subcategoryId',
        'POST /api/assessment/response',
        'GET /api/assessment/progress/:userId',
        'POST /api/assessment/submit'
      ]
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Tenadam Assessment Backend is running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Authentication API: http://localhost:${port}/api/auth`);
  console.log(`📝 Assessment API: http://localhost:${port}/api/assessment`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});