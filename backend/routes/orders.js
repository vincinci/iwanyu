const express = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { validateSessionFromRequest } = require('../lib/auth');

const router = express.Router();

// Order creation schema
const createOrderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  paymentMethod: z.enum(['flutterwave', 'cash_on_delivery']),
  items: z.array(z.object({
    cartItemId: z.string(),
  })),
});

// Get user orders
router.get('/', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: user.id };
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
                vendor: true,
              },
            },
            selectedVariant: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalOrders = await prisma.order.count({ where });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      items: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0]?.url || '/placeholder.png',
          vendor: {
            id: item.product.vendor.id,
            name: item.product.vendor.businessName,
          },
        },
        selectedVariant: item.selectedVariant,
      })),
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
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:orderId', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
                vendor: true,
              },
            },
            selectedVariant: true,
          },
        },
        shippingAddress: true,
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      payments: order.payments,
      items: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          price: item.product.price,
          image: item.product.images[0]?.url || '/placeholder.png',
          vendor: {
            id: item.product.vendor.id,
            name: item.product.vendor.businessName,
          },
        },
        selectedVariant: item.selectedVariant,
      })),
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { shippingAddress, paymentMethod, items } = createOrderSchema.parse(req.body);

    // Validate cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        id: { in: items.map(item => item.cartItemId) },
        userId: user.id,
      },
      include: {
        product: {
          include: { vendor: true },
        },
        selectedVariant: true,
      },
    });

    if (cartItems.length !== items.length) {
      return res.status(400).json({ error: 'Some cart items not found' });
    }

    // Check stock availability
    for (const cartItem of cartItems) {
      const availableStock = cartItem.selectedVariant?.stock || cartItem.product.stock;
      if (cartItem.quantity > availableStock) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${cartItem.product.name}` 
        });
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.selectedVariant?.price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create shipping address
      const createdShippingAddress = await tx.shippingAddress.create({
        data: {
          userId: user.id,
          ...shippingAddress,
        },
      });

      // Create order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          orderNumber,
          status: 'PENDING',
          totalAmount,
          paymentMethod: paymentMethod.toUpperCase(),
          paymentStatus: 'PENDING',
          shippingAddressId: createdShippingAddress.id,
        },
      });

      // Create order items and update stock
      for (const cartItem of cartItems) {
        const price = cartItem.selectedVariant?.price || cartItem.product.price;
        
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: cartItem.productId,
            selectedVariantId: cartItem.selectedVariantId,
            quantity: cartItem.quantity,
            price,
            vendorId: cartItem.product.vendorId,
          },
        });

        // Update stock
        if (cartItem.selectedVariantId) {
          await tx.productVariant.update({
            where: { id: cartItem.selectedVariantId },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });
        } else {
          await tx.product.update({
            where: { id: cartItem.productId },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });
        }
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: {
          id: { in: items.map(item => item.cartItemId) },
        },
      });

      return order;
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        status: result.status,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Cancel order
router.patch('/:orderId/cancel', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        orderItems: {
          include: {
            selectedVariant: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // Restore stock and cancel order
    await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.orderItems) {
        if (item.selectedVariantId) {
          await tx.productVariant.update({
            where: { id: item.selectedVariantId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
        },
      });
    });

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get order tracking
router.get('/:orderId/tracking', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        trackingNumber: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create tracking timeline
    const timeline = [
      {
        status: 'PENDING',
        label: 'Order Placed',
        description: 'Your order has been placed successfully',
        timestamp: order.createdAt,
        completed: true,
      },
      {
        status: 'CONFIRMED',
        label: 'Order Confirmed',
        description: 'Your order has been confirmed by the vendor',
        timestamp: order.status === 'CONFIRMED' ? order.updatedAt : null,
        completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        status: 'PROCESSING',
        label: 'Processing',
        description: 'Your order is being prepared for shipment',
        timestamp: order.status === 'PROCESSING' ? order.updatedAt : null,
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        status: 'SHIPPED',
        label: 'Shipped',
        description: 'Your order has been shipped',
        timestamp: order.status === 'SHIPPED' ? order.updatedAt : null,
        completed: ['SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        status: 'DELIVERED',
        label: 'Delivered',
        description: 'Your order has been delivered',
        timestamp: order.status === 'DELIVERED' ? order.updatedAt : null,
        completed: order.status === 'DELIVERED',
      },
    ];

    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
      },
      timeline,
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    res.status(500).json({ error: 'Failed to fetch order tracking' });
  }
});

module.exports = router;
