const express = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { validateSessionFromRequest } = require('../lib/auth');

const router = express.Router();

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error validating admin:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get admin dashboard stats
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyRevenue,
      pendingVendors,
      activeProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.vendor.count({
        where: { status: 'PENDING' },
      }),
      prisma.product.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
        pendingVendors,
        activeProducts,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.name,
        customerEmail: order.user.email,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        itemCount: order.orderItems.length,
        firstItem: order.orderItems[0]?.product.name,
        createdAt: order.createdAt,
      })),
      recentUsers: recentUsers,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            status: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalUsers = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all vendors
router.get('/vendors', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessEmail: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalVendors = await prisma.vendor.count({ where });

    res.json({
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalVendors,
        pages: Math.ceil(totalVendors / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Update vendor status
router.patch('/vendors/:vendorId/status', requireAdmin, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = z.object({
      status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']),
    }).parse(req.body);

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
    });

    res.json({
      message: 'Vendor status updated successfully',
      vendor: {
        id: updatedVendor.id,
        businessName: updatedVendor.businessName,
        status: updatedVendor.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating vendor status:', error);
    res.status(500).json({ error: 'Failed to update vendor status' });
  }
});

// Get all products
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (category && category !== 'all') {
      where.categoryId = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        vendor: {
          select: {
            businessName: true,
          },
        },
        images: {
          take: 1,
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalProducts = await prisma.product.count({ where });

    res.json({
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        status: product.status,
        category: product.category?.name,
        vendor: product.vendor.businessName,
        image: product.images[0]?.url,
        rating: product.rating,
        reviewCount: product._count.reviews,
        orderCount: product._count.orderItems,
        createdAt: product.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        pages: Math.ceil(totalProducts / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Update product status
router.patch('/products/:productId/status', requireAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = z.object({
      status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    }).parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { status },
    });

    res.json({
      message: 'Product status updated successfully',
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        status: updatedProduct.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Get all orders
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, paymentStatus } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus.toUpperCase();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            vendor: {
              select: {
                businessName: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalOrders = await prisma.order.count({ where });

    res.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.user.name,
          email: order.user.email,
        },
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        itemCount: order.orderItems.length,
        vendors: [...new Set(order.orderItems.map(item => item.vendor.businessName))],
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details
router.get('/orders/:orderId', requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            selectedVariant: true,
            vendor: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
        shippingAddress: true,
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.patch('/orders/:orderId/status', requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    }).parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get system settings
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    // This would typically come from a settings table
    // For now, returning mock settings
    const settings = {
      siteName: 'Iwanyu Marketplace',
      siteDescription: 'Rwanda\'s premier e-commerce platform',
      currency: 'RWF',
      taxRate: 0.18,
      shippingFee: 2000,
      minimumOrderAmount: 1000,
      maxProductImages: 10,
      allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxImageSize: 5242880, // 5MB
      emailSettings: {
        enabled: true,
        provider: 'smtp',
      },
      paymentSettings: {
        flutterwaveEnabled: true,
        cashOnDeliveryEnabled: true,
      },
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update system settings
router.put('/settings', requireAdmin, async (req, res) => {
  try {
    // In a real application, you would validate and save these to a database
    const settings = req.body;

    // Mock response - in reality you'd update the database
    res.json({
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get analytics data
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const [
      revenueData,
      orderData,
      userGrowth,
      vendorGrowth,
      topProducts,
      topCategories,
    ] = await Promise.all([
      // Revenue over time
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),
      // Orders over time
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      }),
      // User growth
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      }),
      // Vendor growth
      prisma.vendor.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      }),
      // Top products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          createdAt: { gte: startDate },
        },
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      // Top categories
      prisma.product.groupBy({
        by: ['categoryId'],
        where: {
          orderItems: {
            some: {
              createdAt: { gte: startDate },
            },
          },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    // Get product and category details for top items
    const topProductIds = topProducts.map(item => item.productId);
    const topCategoryIds = topCategories.map(item => item.categoryId).filter(Boolean);

    const [productDetails, categoryDetails] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, price: true },
      }),
      prisma.category.findMany({
        where: { id: { in: topCategoryIds } },
        select: { id: true, name: true },
      }),
    ]);

    res.json({
      revenue: revenueData,
      orders: orderData,
      userGrowth,
      vendorGrowth,
      topProducts: topProducts.map(item => ({
        ...item,
        product: productDetails.find(p => p.id === item.productId),
      })),
      topCategories: topCategories.map(item => ({
        ...item,
        category: categoryDetails.find(c => c.id === item.categoryId),
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
