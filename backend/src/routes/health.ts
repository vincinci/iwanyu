import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const dbResponseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        cpuUsage: process.cpuUsage()
      }
    };

    console.log(`🏥 Health check requested - DB response: ${dbResponseTime}ms`);
    
    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('🏥 Health check failed:', error);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(503).json(errorStatus);
  }
});

// Detailed health check for admin
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection and get stats
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;
    
    // Get database stats
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    
    const detailedStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
        statistics: {
          users: userCount,
          products: productCount,
          orders: orderCount
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        unit: 'MB'
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        cpuUsage: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null
      },
      connections: {
        activeConnections: 'N/A' // Could be implemented with connection pooling stats
      }
    };

    console.log(`🏥 Detailed health check - DB: ${dbResponseTime}ms, Users: ${userCount}, Products: ${productCount}`);
    
    res.status(200).json(detailedStatus);
  } catch (error) {
    console.error('🏥 Detailed health check failed:', error);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(503).json(errorStatus);
  }
});

export default router; 