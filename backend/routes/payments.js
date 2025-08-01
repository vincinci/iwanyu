const express = require('express');
const { z } = require('zod');
const crypto = require('crypto');
const { prisma } = require('../lib/prisma');
const { validateSessionFromRequest } = require('../lib/auth');

const router = express.Router();

// Flutterwave configuration
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

// Payment initialization schema
const initializePaymentSchema = z.object({
  orderId: z.string(),
  redirectUrl: z.string().url().optional(),
});

// Initialize Flutterwave payment
router.post('/initialize', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId, redirectUrl } = initializePaymentSchema.parse(req.body);

    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        shippingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'PENDING') {
      return res.status(400).json({ error: 'Order payment already processed' });
    }

    // Generate transaction reference
    const txRef = `iwanyu_${orderId}_${Date.now()}`;

    // Prepare Flutterwave payment data
    const paymentData = {
      tx_ref: txRef,
      amount: order.totalAmount,
      currency: 'RWF',
      redirect_url: redirectUrl || `${process.env.FRONTEND_URL}/orders/${orderId}/payment/callback`,
      customer: {
        email: user.email,
        name: user.name,
        phonenumber: user.phone || '',
      },
      customizations: {
        title: 'Iwanyu Marketplace',
        description: `Payment for order ${order.orderNumber}`,
        logo: `${process.env.FRONTEND_URL}/logo.png`,
      },
      meta: {
        orderId: orderId,
        userId: user.id,
      },
    };

    // Initialize payment with Flutterwave
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const flutterwaveData = await flutterwaveResponse.json();

    if (flutterwaveData.status !== 'success') {
      throw new Error(flutterwaveData.message || 'Failed to initialize payment');
    }

    // Save payment record
    await prisma.payment.create({
      data: {
        orderId: orderId,
        provider: 'FLUTTERWAVE',
        providerTransactionId: txRef,
        amount: order.totalAmount,
        currency: 'RWF',
        status: 'PENDING',
        metadata: {
          flutterwaveData: flutterwaveData.data,
        },
      },
    });

    res.json({
      success: true,
      paymentUrl: flutterwaveData.data.link,
      transactionRef: txRef,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error initializing payment:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify Flutterwave payment
router.get('/verify/:transactionId', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { transactionId } = req.params;

    // Verify payment with Flutterwave
    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const { data: transaction } = verifyData;

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        providerTransactionId: transaction.tx_ref,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    if (payment.order.userId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update payment and order status
    if (transaction.status === 'successful' && transaction.amount >= payment.amount) {
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            providerTransactionId: transaction.id,
            metadata: {
              ...payment.metadata,
              verificationData: transaction,
            },
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
        });
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentStatus: 'COMPLETED',
        orderStatus: 'CONFIRMED',
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: {
            ...payment.metadata,
            verificationData: transaction,
          },
        },
      });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        paymentStatus: 'FAILED',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Flutterwave webhook handler
router.post('/webhook/flutterwave', async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha256', FLUTTERWAVE_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['verif-hash']) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.completed' && data.status === 'successful') {
      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: {
          providerTransactionId: data.tx_ref,
        },
        include: {
          order: true,
        },
      });

      if (payment && payment.status === 'PENDING') {
        await prisma.$transaction(async (tx) => {
          // Update payment status
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              providerTransactionId: data.id,
              metadata: {
                ...payment.metadata,
                webhookData: data,
              },
            },
          });

          // Update order status
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
            },
          });
        });
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment status
router.get('/status/:orderId', async (req, res) => {
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
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const latestPayment = order.payments[0];

    res.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
      payment: latestPayment ? {
        id: latestPayment.id,
        provider: latestPayment.provider,
        status: latestPayment.status,
        amount: latestPayment.amount,
        currency: latestPayment.currency,
        createdAt: latestPayment.createdAt,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// Retry failed payment
router.post('/retry/:orderId', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.params;
    const { redirectUrl } = z.object({
      redirectUrl: z.string().url().optional(),
    }).parse(req.body);

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        shippingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Generate new transaction reference
    const txRef = `iwanyu_retry_${orderId}_${Date.now()}`;

    // Prepare Flutterwave payment data
    const paymentData = {
      tx_ref: txRef,
      amount: order.totalAmount,
      currency: 'RWF',
      redirect_url: redirectUrl || `${process.env.FRONTEND_URL}/orders/${orderId}/payment/callback`,
      customer: {
        email: user.email,
        name: user.name,
        phonenumber: user.phone || '',
      },
      customizations: {
        title: 'Iwanyu Marketplace',
        description: `Payment retry for order ${order.orderNumber}`,
        logo: `${process.env.FRONTEND_URL}/logo.png`,
      },
      meta: {
        orderId: orderId,
        userId: user.id,
        retry: true,
      },
    };

    // Initialize payment with Flutterwave
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const flutterwaveData = await flutterwaveResponse.json();

    if (flutterwaveData.status !== 'success') {
      throw new Error(flutterwaveData.message || 'Failed to initialize payment retry');
    }

    // Save new payment record
    await prisma.payment.create({
      data: {
        orderId: orderId,
        provider: 'FLUTTERWAVE',
        providerTransactionId: txRef,
        amount: order.totalAmount,
        currency: 'RWF',
        status: 'PENDING',
        metadata: {
          flutterwaveData: flutterwaveData.data,
          retry: true,
        },
      },
    });

    res.json({
      success: true,
      paymentUrl: flutterwaveData.data.link,
      transactionRef: txRef,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error retrying payment:', error);
    res.status(500).json({ error: 'Failed to retry payment' });
  }
});

module.exports = router;
