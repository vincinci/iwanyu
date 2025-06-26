import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import flutterwaveService from '../utils/flutterwave';
import prisma from '../utils/db';
import brevoService from '../services/brevoService';
import { NotificationType } from '@prisma/client';

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
      const jwt = require('jsonwebtoken');
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
 * Initialize payment for an order (supports both authenticated users and guests)
 * POST /api/payments/initialize
 */
router.post('/initialize', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, redirectUrl, isGuest } = req.body;
    const userId = req.userId;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get order details (for both authenticated users and guests)
    const orderWhere: any = {
      id: orderId,
      paymentStatus: 'PENDING'
    };

    // For authenticated users (not guest), ensure order belongs to user
    if (userId && !isGuest) {
      orderWhere.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where: orderWhere,
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
      return res.status(404).json({ error: 'Order not found or payment already processed' });
    }

    // Generate payment reference
    const paymentRef = flutterwaveService.generatePaymentReference('ORDER');

    // Get customer info (from user or guest data)
    let customerEmail: string;
    let customerPhone: string | undefined;
    let customerName: string;

    if (order.user) {
      // User account order
      customerEmail = order.user.email;
      customerPhone = order.user.phone ?? undefined;
      customerName = order.user.name || `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer';
    } else {
      // Guest order
      customerEmail = order.guestEmail ?? '';
      customerPhone = order.guestPhone ?? undefined;
      
      if (order.shippingAddress && typeof order.shippingAddress === 'object') {
        const shippingAddr = order.shippingAddress as any;
        customerName = `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim() || 'Guest Customer';
      } else {
        customerName = 'Guest Customer';
      }
    }

    // Prepare payment data
    const paymentData = {
      tx_ref: paymentRef,
      amount: order.total,
      currency: 'RWF',
      email: customerEmail,
      phone_number: customerPhone,
      name: customerName,
      redirect_url: redirectUrl || `${process.env.FRONTEND_URL}/payment/callback`,
      meta: {
        orderId: order.id,
        userId: userId || 'guest',
        customerName: customerName,
        orderItems: order.orderItems.length,
        isGuest: !userId || isGuest
      },
      customizations: {
        title: 'Order Payment',
        description: `Payment for order #${order.id}`,
        logo: `${process.env.FRONTEND_URL}/logo.png`
      }
    };

    // Initialize payment with Flutterwave
    try {
      const paymentResponse = await flutterwaveService.initiatePayment(paymentData);

      if (paymentResponse.status === 'success') {
        // Update order with payment reference
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentId: paymentRef,
            paymentMethod: 'flutterwave',
            paymentStatus: 'PROCESSING'
          }
        });

        return res.json({
          success: true,
          message: 'Payment initialized successfully',
          data: {
            paymentUrl: paymentResponse.data.link,
            paymentReference: paymentRef,
            orderId: orderId
          }
        });
      } else {
        return res.status(400).json({
          error: 'Payment initialization failed',
          details: paymentResponse.message || 'Unknown error'
        });
      }
    } catch (flutterwaveError) {
      // Handle Flutterwave errors
      console.error('Flutterwave error:', flutterwaveError);
      return res.status(503).json({
        error: 'Payment service error',
        details: flutterwaveError instanceof Error ? flutterwaveError.message : 'Payment service unavailable'
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during payment initialization',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Verify payment callback
 * GET /api/payments/verify/:transactionId
 */
router.get('/verify/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    // Verify payment with Flutterwave
    try {
      const verificationResponse = await flutterwaveService.verifyPayment(transactionId);
      
      if (verificationResponse.status === 'success' && verificationResponse.data.status === 'successful') {
        // Find and update the order
        const order = await prisma.order.findFirst({
          where: {
            paymentId: verificationResponse.data.tx_ref
          },
          include: {
            user: true
          }
        });

        if (order && order.paymentStatus !== 'COMPLETED') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'PROCESSING',
              paymentMethod: `flutterwave_${verificationResponse.data.payment_type}`,
              updatedAt: new Date()
            }
          });

          // Update product stock and seller balances
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: order.id },
            include: { 
              product: {
                include: {
                  seller: true
                }
              }
            }
          });

          // Track seller sales updates
          const sellerSalesUpdates = new Map<string, number>();

          for (const item of orderItems) {
            // Update product stock
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                },
                totalSales: {
                  increment: item.quantity
                }
              }
            });

            // Calculate seller earnings for this item
            if (item.product.seller) {
              const itemTotal = item.price * item.quantity;
              const currentSales = sellerSalesUpdates.get(item.product.seller.id) || 0;
              sellerSalesUpdates.set(item.product.seller.id, currentSales + itemTotal);
            }
          }

          // Update seller total sales
          for (const [sellerId, salesAmount] of sellerSalesUpdates) {
            await prisma.seller.update({
              where: { id: sellerId },
              data: {
                totalSales: {
                  increment: salesAmount
                },
                totalOrders: {
                  increment: 1
                }
              }
            });
          }

          // Create NEW_ORDER notifications for each seller whose products were ordered
          const sellerNotifications = new Map<string, { sellerId: string; userId: string; items: any[] }>();
          
          for (const item of orderItems) {
            if (item.product.seller) {
              const sellerId = item.product.seller.id;
              const userId = item.product.seller.userId;
              
              if (!sellerNotifications.has(sellerId)) {
                sellerNotifications.set(sellerId, {
                  sellerId,
                  userId,
                  items: []
                });
              }
              
              sellerNotifications.get(sellerId)!.items.push({
                productName: item.product.name,
                quantity: item.quantity,
                price: item.price
              });
            }
          }

          // Send notification to each seller
          for (const [_, notificationData] of sellerNotifications) {
            const totalItems = notificationData.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = notificationData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const productNames = notificationData.items.map(item => 
              `${item.productName} (${item.quantity}x)`
            ).join(', ');

            await prisma.notification.create({
              data: {
                userId: notificationData.userId,
                type: NotificationType.NEW_ORDER,
                title: 'New Order Received!',
                message: `You have a new order #${order.id} for ${totalItems} item${totalItems > 1 ? 's' : ''}: ${productNames}. Total: ${totalAmount.toLocaleString()} RWF`,
                isRead: false
              }
            });
          }

          // Create notification for successful payment (only for authenticated users)
          if (order.userId) {
            await prisma.notification.create({
              data: {
                userId: order.userId,
                type: 'PAYMENT_SUCCESS',
                title: 'Payment Successful',
                message: `Your payment for order #${order.id} has been processed successfully.`,
                isRead: false
              }
            });
          }

          // Send payment success email and SMS via Brevo
          try {
            const paymentData = {
              transactionId: verificationResponse.data.id,
              amount: verificationResponse.data.amount,
              currency: verificationResponse.data.currency,
              customerName: order.user?.name || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Customer'
            };

            const userContact = {
              email: order.user?.email || verificationResponse.data.customer.email,
              phone: order.user?.phone || undefined,
              name: paymentData.customerName
            };

            await brevoService.sendPaymentSuccessNotification(paymentData, userContact);
            console.log('✅ Payment success notification sent via Brevo');
          } catch (brevoError) {
            console.error('❌ Failed to send payment success notification via Brevo:', brevoError);
            // Don't fail the payment verification if email/SMS fails
          }

          return res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
              orderId: order.id,
              paymentStatus: 'completed',
              transactionId: verificationResponse.data.id,
              amount: verificationResponse.data.amount,
              currency: verificationResponse.data.currency,
              customerEmail: verificationResponse.data.customer.email
            }
          });
        }
      } else {
        return res.status(400).json({
          error: 'Payment verification failed',
          details: verificationResponse.message || 'Payment not successful'
        });
      }
    } catch (flutterwaveError) {
      // Handle Flutterwave errors
      console.error('Flutterwave verification error:', flutterwaveError);
      return res.status(503).json({
        error: 'Payment verification service error',
        details: flutterwaveError instanceof Error ? flutterwaveError.message : 'Payment service unavailable'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during payment verification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get payment status for an order
 * GET /api/payments/status/:orderId
 */
router.get('/status/:orderId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId!;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      },
      select: {
        id: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentId: true,
        total: true,
        status: true,
        createdAt: true,
        updatedAt: true
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
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

/**
 * Process refund (Admin only)
 * POST /api/payments/refund
 */
router.post('/refund', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, reason } = req.body;

    // Check if user is admin (you might want to add admin middleware here)
    const user = await prisma.user.findUnique({
      where: { id: req.userId! }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'COMPLETED') {
      return res.status(400).json({ error: 'Order payment is not completed' });
    }

    // Process refund with Flutterwave (if they have transaction ID)
    // Note: You might need to store the Flutterwave transaction ID for refunds
    
    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // Create notification (only for authenticated users)
    if (order.userId) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'PAYMENT_SUCCESS', // You might want to add REFUND_PROCESSED type
          title: 'Refund Processed',
          message: `Your refund for order #${order.id} has been processed.${reason ? ` Reason: ${reason}` : ''}`,
          isRead: false
        }
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        orderId: order.id,
        refundAmount: order.total,
        reason: reason || 'Admin refund'
      }
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

/**
 * Handle Flutterwave webhooks
 * POST /api/payments/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'] as string;
    const payload = req.body.toString();

    // Verify webhook signature
    try {
      if (!flutterwaveService.verifyWebhookSignature(signature, payload)) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    } catch (flutterwaveError) {
      // Flutterwave service is not configured
      return res.status(503).json({
        error: 'Webhook verification service is not available',
        details: flutterwaveError instanceof Error ? flutterwaveError.message : 'Payment service not configured'
      });
    }

    const event = JSON.parse(payload);
    
    if (event.event === 'charge.completed') {
      const paymentData = event.data;
      
      if (paymentData.status === 'successful') {
        // Find and update the order
        const order = await prisma.order.findFirst({
          where: {
            paymentId: paymentData.tx_ref
          }
        });

        if (order && order.paymentStatus !== 'COMPLETED') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'PROCESSING', // Update order status to processing
              paymentMethod: `flutterwave_${paymentData.payment_type}`,
              updatedAt: new Date()
            }
          });

          // Update product stock and seller balances
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: order.id },
            include: { 
              product: {
                include: {
                  seller: true
                }
              }
            }
          });

          // Track seller sales updates
          const sellerSalesUpdates = new Map<string, number>();

          for (const item of orderItems) {
            // Update product stock
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                },
                totalSales: {
                  increment: item.quantity
                }
              }
            });

            // Calculate seller earnings for this item
            if (item.product.seller) {
              const itemTotal = item.price * item.quantity;
              const currentSales = sellerSalesUpdates.get(item.product.seller.id) || 0;
              sellerSalesUpdates.set(item.product.seller.id, currentSales + itemTotal);
            }
          }

          // Update seller total sales
          for (const [sellerId, salesAmount] of sellerSalesUpdates) {
            await prisma.seller.update({
              where: { id: sellerId },
              data: {
                totalSales: {
                  increment: salesAmount
                },
                totalOrders: {
                  increment: 1
                }
              }
            });
          }

          // Create NEW_ORDER notifications for each seller whose products were ordered
          const sellerNotifications = new Map<string, { sellerId: string; userId: string; items: any[] }>();
          
          for (const item of orderItems) {
            if (item.product.seller) {
              const sellerId = item.product.seller.id;
              const userId = item.product.seller.userId;
              
              if (!sellerNotifications.has(sellerId)) {
                sellerNotifications.set(sellerId, {
                  sellerId,
                  userId,
                  items: []
                });
              }
              
              sellerNotifications.get(sellerId)!.items.push({
                productName: item.product.name,
                quantity: item.quantity,
                price: item.price
              });
            }
          }

          // Send notification to each seller
          for (const [_, notificationData] of sellerNotifications) {
            const totalItems = notificationData.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = notificationData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const productNames = notificationData.items.map(item => 
              `${item.productName} (${item.quantity}x)`
            ).join(', ');

            await prisma.notification.create({
              data: {
                userId: notificationData.userId,
                type: NotificationType.NEW_ORDER,
                title: 'New Order Received!',
                message: `You have a new order #${order.id} for ${totalItems} item${totalItems > 1 ? 's' : ''}: ${productNames}. Total: ${totalAmount.toLocaleString()} RWF`,
                isRead: false
              }
            });
          }

          // Create notification for successful payment (only for authenticated users)
          if (order.userId) {
            await prisma.notification.create({
              data: {
                userId: order.userId,
                type: 'PAYMENT_SUCCESS',
                title: 'Payment Successful',
                message: `Your payment for order #${order.id} has been processed successfully.`,
                isRead: false
              }
            });
          }

          return res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
              orderId: order.id,
              paymentStatus: 'completed',
              transactionId: paymentData.id,
              amount: paymentData.amount,
              currency: paymentData.currency,
              customerEmail: paymentData.customer.email
            }
          });
        }
      } else {
        // Payment failed
        const order = await prisma.order.findFirst({
          where: {
            paymentId: paymentData.tx_ref
          }
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
              updatedAt: new Date()
            }
          });

          // Create notification for failed payment (only for authenticated users)
          if (order.userId) {
            await prisma.notification.create({
              data: {
                userId: order.userId,
                type: 'PAYMENT_FAILED',
                title: 'Payment Failed',
                message: `Your payment for order #${order.id} could not be processed. Please try again.`,
                isRead: false
              }
            });
          }
        }
      }
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router; 