import express, { Request, Response } from 'express';
import brevoService from '../services/brevoService';
import cartAbandonmentService from '../services/cartAbandonmentService';

const router = express.Router();

/**
 * Test Brevo email sending
 * POST /api/brevo-test/send-email
 */
router.post('/send-email', async (req: Request, res: Response) => {
  try {
    const { email, name, type } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await brevoService.sendWelcomeEmail({
          email,
          name: name || 'Test User'
        });
        break;

      case 'password-reset':
        result = await brevoService.sendPasswordResetEmail(email, 'test-token-123');
        break;

      case 'order-confirmation':
        const orderData = {
          id: 'test-order-123',
          createdAt: new Date(),
          totalAmount: 25000,
          paymentStatus: 'COMPLETED',
          customerName: name || 'Test Customer'
        };
        const userContact = {
          email,
          name: name || 'Test Customer'
        };
        result = await brevoService.sendOrderConfirmation(orderData, userContact);
        break;

      case 'payment-success':
        const paymentData = {
          transactionId: 'test-txn-123',
          amount: 25000,
          currency: 'RWF',
          customerName: name || 'Test Customer'
        };
        const paymentContact = {
          email,
          name: name || 'Test Customer'
        };
        result = await brevoService.sendPaymentSuccessNotification(paymentData, paymentContact);
        break;

      case 'seller-approved':
        const sellerData = {
          businessName: name || 'Test Business'
        };
        const sellerContact = {
          email,
          name: name || 'Test Seller'
        };
        result = await brevoService.sendSellerApprovalEmail(sellerData, sellerContact);
        break;

      case 'cart-abandonment':
        const cartData = {
          customerName: name || 'Test Customer',
          items: [
            { id: '1', name: 'Test Product 1', price: 15000, quantity: 2 },
            { id: '2', name: 'Test Product 2', price: 25000, quantity: 1 }
          ],
          totalAmount: 55000,
          checkoutUrl: 'https://iwanyustore.com/cart'
        };
        const cartContact = {
          email,
          name: name || 'Test Customer'
        };
        result = await brevoService.sendCartAbandonmentEmail(cartData, cartContact);
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type. Use: welcome, password-reset, order-confirmation, payment-success, seller-approved, cart-abandonment' });
    }

    res.json({
      success: true,
      message: `${type} email sent successfully`,
      data: result
    });
  } catch (error) {
    console.error('Brevo email test error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test Brevo SMS sending
 * POST /api/brevo-test/send-sms
 */
router.post('/send-sms', async (req: Request, res: Response) => {
  try {
    const { phone, name, type } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    let result;
    const smsTemplates = brevoService.getSMSTemplates();

    switch (type) {
      case 'welcome':
        const welcomeTemplate = smsTemplates.welcomeUser(name || 'Test User');
        result = await brevoService.sendSMS({ phone, name: name || 'Test User' }, welcomeTemplate);
        break;

      case 'order-confirmation':
        const orderTemplate = smsTemplates.orderConfirmation({
          id: 'test-order-123',
          totalAmount: 25000,
          customerName: name || 'Test Customer'
        });
        result = await brevoService.sendSMS({ phone, name: name || 'Test Customer' }, orderTemplate);
        break;

      case 'payment-success':
        const paymentTemplate = smsTemplates.paymentSuccess({
          amount: 25000,
          currency: 'RWF',
          transactionId: 'test-txn-123'
        });
        result = await brevoService.sendSMS({ phone, name: name || 'Test Customer' }, paymentTemplate);
        break;

      case 'order-shipped':
        const shippedTemplate = smsTemplates.orderShipped({
          id: 'test-order-123',
          trackingNumber: 'TRK123456789'
        });
        result = await brevoService.sendSMS({ phone, name: name || 'Test Customer' }, shippedTemplate);
        break;

      case 'seller-payout':
        const payoutTemplate = smsTemplates.sellerPayout({
          amount: 50000,
          currency: 'RWF',
          reference: 'PAY123456789'
        });
        result = await brevoService.sendSMS({ phone, name: name || 'Test Seller' }, payoutTemplate);
        break;

      default:
        return res.status(400).json({ error: 'Invalid SMS type. Use: welcome, order-confirmation, payment-success, order-shipped, seller-payout' });
    }

    res.json({
      success: true,
      message: `${type} SMS sent successfully`,
      data: result
    });
  } catch (error) {
    console.error('Brevo SMS test error:', error);
    res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get Brevo account info
 * GET /api/brevo-test/account-info
 */
router.get('/account-info', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Brevo service is configured',
      data: {
        apiKey: process.env.BREVO_API_KEY ? 'Configured' : 'Not configured',
        emailTemplates: Object.keys(brevoService.getEmailTemplates()),
        smsTemplates: Object.keys(brevoService.getSMSTemplates())
      }
    });
  } catch (error) {
    console.error('Brevo account info error:', error);
    res.status(500).json({ 
      error: 'Failed to get account info',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get cart abandonment statistics
 * GET /api/brevo-test/cart-abandonment-stats
 */
router.get('/cart-abandonment-stats', async (req: Request, res: Response) => {
  try {
    const stats = await cartAbandonmentService.getAbandonmentStats();
    
    res.json({
      success: true,
      message: 'Cart abandonment statistics retrieved',
      data: stats
    });
  } catch (error) {
    console.error('Cart abandonment stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get cart abandonment statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 