import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import flutterwaveService from '../utils/flutterwave';
import prisma from '../utils/db';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Get available balance and payout summary for seller
 * GET /api/payouts/summary
 */
router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Check if user is a seller
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!seller) {
      return res.status(403).json({ error: 'Seller access required' });
    }

    // Calculate available balance from completed orders
    const completedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        orderItems: {
          some: {
            product: {
              sellerId: seller.id
            }
          }
        }
      },
      include: {
        orderItems: {
          where: {
            product: {
              sellerId: seller.id
            }
          },
          include: {
            product: true
          }
        }
      }
    });

    let totalRevenue = 0;
    let totalCommission = 0; // No commission - sellers get full revenue

    completedOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        // No commission deduction - sellers get full amount
        totalRevenue += itemTotal;
        // totalCommission remains 0
      });
    });

    const availableBalance = totalRevenue; // Full revenue available to seller

    // Get previous payouts
    const payouts = await prisma.sellerPayout.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const totalPaidOut = payouts.reduce((sum, payout) => 
      payout.status === 'COMPLETED' ? sum + payout.amount : sum, 0
    );

    res.json({
      success: true,
      data: {
        seller: {
          id: seller.id,
          businessName: seller.businessName,
          rating: seller.rating,
          totalSales: seller.totalSales
        },
        balance: {
          totalRevenue,
          totalCommission,
          availableBalance,
          totalPaidOut,
          pendingBalance: availableBalance - totalPaidOut
        },
        recentPayouts: payouts
      }
    });
  } catch (error) {
    console.error('Get payout summary error:', error);
    res.status(500).json({ error: 'Failed to get payout summary' });
  }
});

/**
 * Get supported banks for a country
 * GET /api/payouts/banks/:country
 */
router.get('/banks/:country', async (req: Request, res: Response) => {
  try {
    const { country } = req.params;

    const banksResponse = await flutterwaveService.getBanks(country.toUpperCase());
    
    if (banksResponse.status === 'success') {
      res.json({
        success: true,
        data: banksResponse.data
      });
    } else {
      res.status(400).json({
        error: 'Failed to fetch banks',
        details: banksResponse.message
      });
    }
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ error: 'Failed to get banks' });
  }
});

/**
 * Get mobile money networks for a country
 * GET /api/payouts/mobile-money-networks/:country
 */
router.get('/mobile-money-networks/:country', (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const networks = flutterwaveService.getMobileMoneyNetworks(country.toUpperCase());
    
    res.json({
      success: true,
      data: networks
    });
  } catch (error) {
    console.error('Get mobile money networks error:', error);
    res.status(500).json({ error: 'Failed to get mobile money networks' });
  }
});

/**
 * Verify bank account details
 * POST /api/payouts/verify-account
 */
router.post('/verify-account', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { accountNumber, accountBank } = req.body;

    if (!accountNumber || !accountBank) {
      return res.status(400).json({ error: 'Account number and bank code are required' });
    }

    const verification = await flutterwaveService.verifyBankAccount(accountNumber, accountBank);
    
    res.json({
      success: verification.status === 'success',
      data: verification.data,
      message: verification.message
    });
  } catch (error) {
    console.error('Account verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get transfer fee estimate
 * POST /api/payouts/transfer-fee
 */
router.post('/transfer-fee', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency, type = 'account' } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    // Get transfer fee from Flutterwave
    // const feeData = await flutterwaveService.getTransferFee(
    //   amount,
    //   currency,
    //   type as 'account' | 'mobilemoney' | 'barter'
    // );
    
    return res.status(503).json({
      error: 'Transfer fee service is not available. Please configure Flutterwave integration.'
    });
  } catch (error) {
    console.error('Get transfer fee error:', error);
    res.status(500).json({ error: 'Failed to get transfer fee' });
  }
});

/**
 * Initiate bank transfer payout
 * POST /api/payouts/bank-transfer
 */
router.post('/bank-transfer', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { 
      accountBank, 
      accountNumber, 
      amount, 
      currency = 'RWF',
      beneficiaryName,
      narration 
    } = req.body;

    // Validate required fields
    if (!accountBank || !accountNumber || !amount || !beneficiaryName) {
      return res.status(400).json({ 
        error: 'Account bank, account number, amount, and beneficiary name are required' 
      });
    }

    // Check if user is a seller
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!seller) {
      return res.status(403).json({ error: 'Seller access required' });
    }

    // Calculate available balance (no commission - sellers get full revenue)
    const completedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        orderItems: {
          some: {
            product: { sellerId: seller.id }
          }
        }
      },
      include: {
        orderItems: {
          where: {
            product: { sellerId: seller.id }
          }
        }
      }
    });

    let availableBalance = 0;
    completedOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        // No commission deduction - sellers get full amount
        availableBalance += itemTotal;
      });
    });

    // Get previous payouts
    const previousPayouts = await prisma.sellerPayout.findMany({
      where: { 
        sellerId: seller.id,
        status: 'COMPLETED'
      }
    });

    const totalPaidOut = previousPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const pendingBalance = availableBalance - totalPaidOut;

    if (amount > pendingBalance) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        details: `Available balance: ${pendingBalance}, Requested: ${amount}`
      });
    }

    // Generate transfer reference
    const transferRef = flutterwaveService.generatePaymentReference('PAYOUT');

    // Create payout record
    const payout = await prisma.sellerPayout.create({
      data: {
        sellerId: seller.id,
        amount,
        currency,
        payoutMethod: 'BANK_TRANSFER',
        accountDetails: {
          account_bank: accountBank,
          account_number: accountNumber,
          beneficiary_name: beneficiaryName
        },
        reference: transferRef,
        status: 'PENDING',
        narration: narration || `Payout to ${seller.businessName || seller.user.name}`
      }
    });

    // Use real Flutterwave API only
    try {
      const transferResponse = await flutterwaveService.initiateTransfer({
        account_bank: accountBank,
        account_number: accountNumber,
        amount,
        currency,
        beneficiary_name: beneficiaryName,
        narration: payout.narration || undefined,
        reference: transferRef,
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payouts/webhook`,
        meta: {
          sellerId: seller.id,
          payoutId: payout.id,
          sellerName: seller.businessName || seller.user.name
        }
      });

      if (transferResponse.status === 'success') {
        await prisma.sellerPayout.update({
          where: { id: payout.id },
          data: {
            flutterwaveTransferId: transferResponse.data.id.toString(),
            status: 'PROCESSING',
            updatedAt: new Date()
          }
        });

        res.json({
          success: true,
          message: 'Bank transfer initiated successfully',
          data: {
            payoutId: payout.id,
            transferId: transferResponse.data.id,
            amount,
            currency,
            beneficiaryName,
            status: 'PROCESSING',
            reference: transferRef
          }
        });
      } else {
        await prisma.sellerPayout.update({
          where: { id: payout.id },
          data: { status: 'FAILED' }
        });

        res.status(400).json({
          error: 'Failed to initiate transfer',
          details: transferResponse.message
        });
      }
    } catch (flutterwaveError) {
      await prisma.sellerPayout.update({
        where: { id: payout.id },
        data: { status: 'FAILED' }
      });

      res.status(500).json({
        error: 'Failed to initiate transfer',
        details: flutterwaveError instanceof Error ? flutterwaveError.message : 'Flutterwave service error'
      });
    }
  } catch (error) {
    console.error('Bank transfer payout error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate bank transfer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Initiate mobile money payout
 * POST /api/payouts/mobile-money
 */
router.post('/mobile-money', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { 
      mobileNetwork, 
      mobileNumber, 
      amount, 
      currency = 'RWF',
      beneficiaryName,
      narration 
    } = req.body;

    // Validate required fields
    if (!mobileNetwork || !mobileNumber || !amount || !beneficiaryName) {
      return res.status(400).json({ 
        error: 'Mobile network, mobile number, amount, and beneficiary name are required' 
      });
    }

    // Check if user is a seller
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!seller) {
      return res.status(403).json({ error: 'Seller access required' });
    }

    // Calculate available balance (no commission - sellers get full revenue)
    const completedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        orderItems: {
          some: {
            product: { sellerId: seller.id }
          }
        }
      },
      include: {
        orderItems: {
          where: {
            product: { sellerId: seller.id }
          }
        }
      }
    });

    let availableBalance = 0;
    completedOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        // No commission deduction - sellers get full amount
        availableBalance += itemTotal;
      });
    });

    const previousPayouts = await prisma.sellerPayout.findMany({
      where: { 
        sellerId: seller.id,
        status: 'COMPLETED'
      }
    });

    const totalPaidOut = previousPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const pendingBalance = availableBalance - totalPaidOut;

    if (amount > pendingBalance) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        details: `Available balance: ${pendingBalance}, Requested: ${amount}`
      });
    }

    // Generate transfer reference
    const transferRef = flutterwaveService.generatePaymentReference('MMPAYOUT');

    // Create payout record
    const payout = await prisma.sellerPayout.create({
      data: {
        sellerId: seller.id,
        amount,
        currency,
        payoutMethod: 'MOBILE_MONEY',
        accountDetails: {
          mobile_network: mobileNetwork,
          mobile_number: mobileNumber,
          beneficiary_name: beneficiaryName
        },
        reference: transferRef,
        status: 'PENDING',
        narration: narration || `Mobile money payout to ${seller.businessName || seller.user.name}`
      }
    });

    // Use real Flutterwave API only
    try {
      const transferResponse = await flutterwaveService.initiateMobileMoneyTransfer({
        account_bank: mobileNetwork,
        account_number: mobileNumber,
        amount,
        currency,
        beneficiary_name: beneficiaryName,
        narration: payout.narration || undefined,
        reference: transferRef,
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payouts/webhook`,
        meta: {
          sender: 'Marketplace Platform',
          sender_country: 'RW', // Rwanda
          mobile_number: mobileNumber,
          sellerId: seller.id,
          payoutId: payout.id,
          sellerName: seller.businessName || seller.user.name
        }
      });

      if (transferResponse.status === 'success') {
        await prisma.sellerPayout.update({
          where: { id: payout.id },
          data: {
            flutterwaveTransferId: transferResponse.data.id.toString(),
            status: 'PROCESSING',
            updatedAt: new Date()
          }
        });

        res.json({
          success: true,
          message: 'Mobile money transfer initiated successfully',
          data: {
            payoutId: payout.id,
            transferId: transferResponse.data.id,
            amount,
            currency,
            beneficiaryName,
            mobileNetwork,
            status: 'PROCESSING',
            reference: transferRef
          }
        });
      } else {
        await prisma.sellerPayout.update({
          where: { id: payout.id },
          data: { status: 'FAILED' }
        });

        res.status(400).json({
          error: 'Failed to initiate mobile money transfer',
          details: transferResponse.message
        });
      }
    } catch (flutterwaveError) {
      await prisma.sellerPayout.update({
        where: { id: payout.id },
        data: { status: 'FAILED' }
      });

      res.status(500).json({
        error: 'Failed to initiate mobile money transfer',
        details: flutterwaveError instanceof Error ? flutterwaveError.message : 'Flutterwave service error'
      });
    }
  } catch (error) {
    console.error('Mobile money payout error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate mobile money transfer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get payout history for seller
 * GET /api/payouts/history
 */
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 10, status } = req.query;

    const seller = await prisma.seller.findUnique({
      where: { userId }
    });

    if (!seller) {
      return res.status(403).json({ error: 'Seller access required' });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { sellerId: seller.id };
    if (status) {
      where.status = status;
    }

    const payouts = await prisma.sellerPayout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const total = await prisma.sellerPayout.count({ where });

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({ error: 'Failed to get payout history' });
  }
});

/**
 * Get specific payout details
 * GET /api/payouts/:id
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const seller = await prisma.seller.findUnique({
      where: { userId }
    });

    if (!seller) {
      return res.status(403).json({ error: 'Seller access required' });
    }

    const payout = await prisma.sellerPayout.findFirst({
      where: {
        id,
        sellerId: seller.id
      }
    });

    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    // Get transfer status from Flutterwave if available
    let transferStatus = null;
    if (payout.flutterwaveTransferId) {
      try {
        const status = await flutterwaveService.getTransferStatus(payout.flutterwaveTransferId);
        transferStatus = status;
      } catch (error) {
        console.warn('Failed to get transfer status from Flutterwave:', error);
      }
    }

    res.json({
      success: true,
      data: {
        payout,
        transferStatus: transferStatus || null
      }
    });
  } catch (error) {
    console.error('Get payout details error:', error);
    res.status(500).json({ error: 'Failed to get payout details' });
  }
});

/**
 * Handle Flutterwave transfer webhooks
 * POST /api/payouts/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'] as string;
    const payload = req.body.toString();

    // Verify webhook signature
    if (!flutterwaveService.verifyWebhookSignature(signature, payload)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(payload);
    
    if (event.event === 'transfer.completed') {
      const transferData = event.data;
      const payoutId = transferData.meta?.payoutId;

      if (payoutId) {
        // Update payout status based on transfer result
        const updateData: any = {
          updatedAt: new Date()
        };

        if (transferData.status === 'SUCCESSFUL') {
          updateData.status = 'COMPLETED';
          updateData.completedAt = new Date();
        } else if (transferData.status === 'FAILED') {
          updateData.status = 'FAILED';
          updateData.failureReason = transferData.complete_message;
        }

        await prisma.sellerPayout.update({
          where: { id: payoutId },
          data: updateData
        });

        // Create notification for seller
        const payout = await prisma.sellerPayout.findUnique({
          where: { id: payoutId },
          include: { seller: true }
        });

        if (payout) {
          await prisma.notification.create({
            data: {
              userId: payout.seller.userId,
              type: transferData.status === 'SUCCESSFUL' ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
              title: transferData.status === 'SUCCESSFUL' ? 'Payout Completed' : 'Payout Failed',
              message: transferData.status === 'SUCCESSFUL' 
                ? `Your payout of ${payout.amount} ${payout.currency} has been processed successfully.`
                : `Your payout of ${payout.amount} ${payout.currency} failed. ${transferData.complete_message}`,
              isRead: false
            }
          });
        }
      }
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Payout webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router; 