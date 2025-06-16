import express, { Response, Request } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Validate coupon code
router.post('/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.user!.id;

    if (!code || !orderAmount) {
      res.status(400).json({ error: 'Coupon code and order amount are required' });
      return;
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usage: {
          where: { userId }
        }
      }
    });

    if (!coupon) {
      res.status(404).json({ error: 'Invalid coupon code' });
      return;
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      res.status(400).json({ error: 'Coupon is no longer active' });
      return;
    }

    // Check expiration
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res.status(400).json({ error: 'Coupon has expired' });
      return;
    }

    // Check start date
    if (coupon.startsAt && new Date() < coupon.startsAt) {
      res.status(400).json({ error: 'Coupon is not yet active' });
      return;
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ error: 'Coupon usage limit exceeded' });
      return;
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      res.status(400).json({ 
        error: `Minimum order amount of $${coupon.minOrderAmount} required` 
      });
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    
    switch (coupon.type) {
      case 'PERCENTAGE':
        discountAmount = (orderAmount * coupon.value) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(coupon.value, orderAmount);
        break;
      case 'FREE_SHIPPING':
        // This would be handled in the shipping calculation
        discountAmount = 0; // We'll return the coupon for the frontend to handle
        break;
    }

    res.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          discountAmount: Math.round(discountAmount * 100) / 100
        },
        valid: true
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Apply coupon (record usage)
router.post('/apply', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { couponId, orderId } = req.body;
    const userId = req.user!.id;

    if (!couponId) {
      res.status(400).json({ error: 'Coupon ID is required' });
      return;
    }

    // Check if coupon exists and is still valid
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });

    if (!coupon || !coupon.isActive) {
      res.status(400).json({ error: 'Invalid or inactive coupon' });
      return;
    }

    // Record coupon usage
    await prisma.$transaction([
      // Create usage record
      prisma.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId
        }
      }),
      // Increment used count
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: {
            increment: 1
          }
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

// Get user's coupon usage history
router.get('/usage', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const couponUsage = await prisma.couponUsage.findMany({
      where: { userId },
      include: {
        coupon: {
          select: {
            code: true,
            name: true,
            type: true,
            value: true
          }
        }
      },
      orderBy: { usedAt: 'desc' }
    });

    res.json({
      success: true,
      data: couponUsage
    });
  } catch (error) {
    console.error('Get coupon usage error:', error);
    res.status(500).json({ error: 'Failed to get coupon usage' });
  }
});

// Get available coupons (public or promotional)
router.get('/available', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const availableCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: now } }
            ]
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } }
            ]
          }
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        type: true,
        value: true,
        minOrderAmount: true,
        maxDiscount: true,
        expiresAt: true,
        usageLimit: true,
        usedCount: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter out coupons that have reached their usage limit
    const filteredCoupons = availableCoupons.filter(coupon => 
      !coupon.usageLimit || coupon.usedCount < coupon.usageLimit
    );

    res.json({
      success: true,
      data: filteredCoupons.map(({ usageLimit, usedCount, ...coupon }) => coupon)
    });
  } catch (error) {
    console.error('Get available coupons error:', error);
    res.status(500).json({ error: 'Failed to get available coupons' });
  }
});

export default router; 