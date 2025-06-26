import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';
import prisma from '../utils/db';
import brevoService from '../services/brevoService';
import cartAbandonmentService from '../services/cartAbandonmentService';
import emailAutomationService from '../services/emailAutomationService';
import { SHIPPING_COST } from '../config/constants';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Optional authentication middleware
const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // If authorization header is present, verify it
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true }
      });

      if (user) {
        req.userId = user.id;
      }
    } catch (error) {
      // Invalid token, but continue as guest
      req.userId = undefined;
    }
  } else {
    // No authorization header, continue as guest
    req.userId = undefined;
  }
  
  next();
};

/**
 * Create a new order (supports both authenticated users and guests)
 * POST /api/orders
 */
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, couponCode, notes, isGuest } = req.body;
    const userId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    // Validate shipping address for guest orders
    if (!userId || isGuest) {
      if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
          !shippingAddress.email || !shippingAddress.phone || !shippingAddress.address || 
          !shippingAddress.city) {
        return res.status(400).json({ error: 'Complete shipping address is required for guest orders' });
      }
    }

    // Validate items and calculate totals
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      variantId?: string;
    }> = [];
    
    let subtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true
        }
      });

      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      // Check stock availability (variant stock if variant selected, otherwise product stock)
      if (product.stock < item.quantity) {
        const stockType = item.variantId ? 'variant' : 'product';
        return res.status(400).json({ 
          error: `Insufficient ${stockType} stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        variantId: item.variantId || undefined
      });
    }

    const shippingCost = SHIPPING_COST; // Fixed delivery fee from constants
    const tax = 0; // You can implement tax calculation logic here
    const total = subtotal + shippingCost + tax;

    // Create order data
    const orderData: any = {
      subtotal,
      total,
      shippingCost,
      tax,
      notes,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      orderItems: {
        create: orderItems
      }
    };

    // Add user ID for authenticated users, store guest info for guests
    if (userId && !isGuest) {
      orderData.userId = userId;
    } else {
      // Store guest information
      orderData.guestEmail = shippingAddress.email;
      orderData.guestPhone = shippingAddress.phone;
      orderData.shippingAddress = shippingAddress;
    }

    // Create order
    const order = await prisma.order.create({
      data: orderData,
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Send order confirmation email and SMS via Brevo
    try {
      const orderData = {
        id: order.id,
        createdAt: order.createdAt,
        totalAmount: order.total,
        paymentStatus: order.paymentStatus,
        customerName: order.user?.name || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 
                     (shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}` : 'Customer')
      };

      const userContact = {
        email: order.user?.email || order.guestEmail || shippingAddress?.email,
        phone: order.user?.phone || order.guestPhone || shippingAddress?.phone || undefined,
        name: orderData.customerName
      };

      if (userContact.email) {
        // Trigger complete order journey workflow
        await emailAutomationService.triggerWorkflow('order-journey', 'order-placed', {
          userId: order.userId,
          email: userContact.email,
          name: userContact.name
        }, orderData);
        
        console.log('✅ Order journey workflow triggered for:', userContact.email);
      }
    } catch (brevoError) {
      console.error('❌ Failed to trigger order journey workflow:', brevoError);
      // Don't fail order creation if email/SMS fails
    }

    // Clear cart abandonment timer since order was created
    if (userId && !isGuest) {
      await cartAbandonmentService.onOrderCompleted(userId);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * Get user's orders
 * GET /api/orders
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

/**
 * Get specific order
 * GET /api/orders/:id
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        address: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
router.put('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        paymentStatus: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found or cannot be cancelled' 
      });
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'ORDER_UPDATE',
        title: 'Order Cancelled',
        message: `Your order #${order.id} has been cancelled.`,
        isRead: false
      }
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

/**
 * Update order status (Admin only)
 * PUT /api/orders/:id/status
 */
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingNumber: trackingNumber || order.trackingNumber,
        updatedAt: new Date()
      }
    });

    // Trigger email workflows based on status change
    const userContact = {
      email: order.user?.email || order.guestEmail,
      name: order.user?.name || order.user?.firstName || 'Customer'
    };

    const orderData = {
      id: order.id,
      createdAt: order.createdAt,
      totalAmount: order.total,
      paymentStatus: order.paymentStatus,
      customerName: userContact.name,
      trackingNumber: trackingNumber || order.trackingNumber
    };

    if (userContact.email) {
      try {
        switch (status) {
          case 'SHIPPED':
            await emailAutomationService.triggerWorkflow('order-journey', 'order-shipped', {
              userId: order.userId,
              email: userContact.email,
              name: userContact.name
            }, orderData);
            break;

          case 'DELIVERED':
            await emailAutomationService.triggerWorkflow('order-journey', 'order-delivered', {
              userId: order.userId,
              email: userContact.email,
              name: userContact.name
            }, orderData);
            break;
        }
      } catch (emailError) {
        console.error('❌ Failed to trigger order status email:', emailError);
      }
    }

    // Create notification for user
    if (order.userId) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER_UPDATE',
          title: `Order ${status.toLowerCase()}`,
          message: `Your order #${order.id} has been ${status.toLowerCase()}.`,
          isRead: false
        }
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router; 