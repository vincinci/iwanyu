const express = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { validateSessionFromRequest } = require('../lib/auth');

const router = express.Router();

// Vendor registration schema
const vendorRegistrationSchema = z.object({
  businessName: z.string().min(1),
  businessDescription: z.string().optional(),
  businessPhone: z.string().min(1),
  businessAddress: z.string().min(1),
});

// Vendor profile update schema
const vendorUpdateSchema = vendorRegistrationSchema.partial();

// Register as vendor
router.post('/register', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'USER') {
      return res.status(400).json({ error: 'User is already a vendor or admin' });
    }

    const vendorData = vendorRegistrationSchema.parse(req.body);

    // Check if business name already exists
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { businessName: vendorData.businessName },
        ],
      },
    });

    if (existingVendor) {
      return res.status(400).json({ error: 'Business name or email already exists' });
    }

    await prisma.$transaction(async (tx) => {
      // Create vendor profile
      await tx.vendor.create({
        data: {
          userId: user.id,
          ...vendorData,
          isApproved: false,
        },
      });

      // Update user role
      await tx.user.update({
        where: { id: user.id },
        data: { role: 'VENDOR' },
      });
    });

    res.status(201).json({
      message: 'Vendor registration submitted successfully. Your application is under review.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error registering vendor:', error);
    res.status(500).json({ error: 'Failed to register vendor' });
  }
});

// Get vendor profile
router.get('/profile', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Access denied. Vendor role required.' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    res.json({
      id: vendor.id,
      businessName: vendor.businessName,
      businessDescription: vendor.businessDescription,
      businessAddress: vendor.businessAddress,
      businessPhone: vendor.businessPhone,
      isApproved: vendor.isApproved,
      isVerified: vendor.isVerified,
      rating: vendor.rating,
      totalOrders: vendor._count.orders,
      totalProducts: vendor._count.products,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
});

// Update vendor profile
router.put('/profile', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Access denied. Vendor role required.' });
    }

    const updateData = vendorUpdateSchema.parse(req.body);

    // Check if business name is being updated and conflicts
    if (updateData.businessName) {
      const conflictConditions = [];
      
      if (updateData.businessName) {
        conflictConditions.push({ businessName: updateData.businessName });
      }

      const existingVendor = await prisma.vendor.findFirst({
        where: {
          OR: conflictConditions,
          NOT: { id: vendor.id },
        },
      });

      if (existingVendor) {
        return res.status(400).json({ error: 'Business name already exists' });
      }
    }

    const updatedVendor = await prisma.vendor.update({
      where: { userId: user.id },
      data: updateData,
    });

    res.json({
      message: 'Vendor profile updated successfully',
      vendor: {
        id: updatedVendor.id,
        businessName: updatedVendor.businessName,
        businessDescription: updatedVendor.businessDescription,
        businessAddress: updatedVendor.businessAddress,
        businessPhone: updatedVendor.businessPhone,
        isApproved: updatedVendor.isApproved,
        isVerified: updatedVendor.isVerified,
        updatedAt: updatedVendor.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ error: 'Failed to update vendor profile' });
  }
});

// Get vendor dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Access denied. Vendor role required.' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Get dashboard statistics
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.product.count({
        where: { vendorId: vendor.id },
      }),
      prisma.product.count({
        where: { vendorId: vendor.id, isActive: true },
      }),
      prisma.orderItem.count({
        where: { vendorId: vendor.id },
      }),
      prisma.orderItem.count({
        where: {
          vendorId: vendor.id,
          order: { status: 'PENDING' },
        },
      }),
      prisma.orderItem.aggregate({
        where: {
          vendorId: vendor.id,
          order: { paymentStatus: 'PAID' },
        },
        _sum: { price: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          vendorId: vendor.id,
          order: {
            paymentStatus: 'PAID',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        _sum: { price: true },
      }),
    ]);

    // Get recent orders
    const recentOrders = await prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        product: {
          select: {
            name: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.price || 0,
        monthlyRevenue: monthlyRevenue._sum.price || 0,
      },
      recentOrders: recentOrders.map(item => ({
        id: item.order.id,
        orderNumber: item.order.orderNumber,
        customer: item.order.user.name,
        customerEmail: item.order.user.email,
        product: item.product.name,
        productImage: item.product.images[0]?.url || '/placeholder.png',
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        status: item.order.status,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching vendor dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch vendor dashboard' });
  }
});

// Get vendor orders
router.get('/orders', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Access denied. Vendor role required.' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { vendorId: vendor.id };
    if (status && status !== 'all') {
      where.order = { status: status.toUpperCase() };
    }

    const orders = await prisma.orderItem.findMany({
      where,
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            shippingAddress: true,
          },
        },
        product: {
          include: {
            images: true,
          },
        },
        selectedVariant: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalOrders = await prisma.orderItem.count({ where });

    const formattedOrders = orders.map(item => ({
      id: item.id,
      orderId: item.order.id,
      orderNumber: item.order.orderNumber,
      customer: {
        name: item.order.user.name,
        email: item.order.user.email,
        phone: item.order.user.phone,
      },
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.product.images[0]?.url || '/placeholder.png',
      },
      selectedVariant: item.selectedVariant,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
      status: item.order.status,
      paymentStatus: item.order.paymentStatus,
      shippingAddress: item.order.shippingAddress,
      createdAt: item.createdAt,
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Failed to fetch vendor orders' });
  }
});

// Update order status
router.patch('/orders/:orderItemId/status', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Access denied. Vendor role required.' });
    }

    const { orderItemId } = req.params;
    const { status } = z.object({
      status: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
    }).parse(req.body);

    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Find order item
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        vendorId: vendor.id,
      },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { status },
    });

    res.json({
      message: 'Order status updated successfully',
      status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get all vendors (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, search, status = 'ACTIVE' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status !== 'all') {
      where.isApproved = status === 'ACTIVE';
    }
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalVendors = await prisma.vendor.count({ where });

    const formattedVendors = vendors.map(vendor => ({
      id: vendor.id,
      businessName: vendor.businessName,
      businessDescription: vendor.businessDescription,
      businessAddress: vendor.businessAddress,
      rating: vendor.rating,
      totalProducts: vendor._count.products,
      status: vendor.status,
      createdAt: vendor.createdAt,
    }));

    res.json({
      vendors: formattedVendors,
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

// Get vendor by ID (public)
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: true,
            category: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (vendor.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Vendor is not active' });
    }

    res.json({
      id: vendor.id,
      businessName: vendor.businessName,
      businessDescription: vendor.businessDescription,
      businessAddress: vendor.businessAddress,
      rating: vendor.rating,
      totalProducts: vendor._count.products,
      totalOrders: vendor._count.orders,
      createdAt: vendor.createdAt,
      products: vendor.products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0]?.url || '/placeholder.png',
        category: product.category?.name,
        rating: product.rating,
        reviewCount: product.reviewCount,
      })),
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

module.exports = router;
