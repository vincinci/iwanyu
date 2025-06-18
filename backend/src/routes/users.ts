import express, { Request, Response } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Add to recently viewed
router.post('/recently-viewed', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or update recently viewed entry
    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      update: {
        viewedAt: new Date()
      },
      create: {
        userId,
        productId,
        viewedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Added to recently viewed'
    });
  } catch (error) {
    console.error('Add to recently viewed error:', error);
    res.status(500).json({ error: 'Failed to add to recently viewed' });
  }
});

// Get recently viewed products
router.get('/recently-viewed', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 20 } = req.query;

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            image: true,
            images: true,
            stock: true,
            avgRating: true,
            totalReviews: true,
            isActive: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: Number(limit)
    });

    // Filter out inactive products and format response
    const products = recentlyViewed
      .filter(item => item.product.isActive)
      .map(item => ({
        ...item.product,
        viewedAt: item.viewedAt,
        discount: item.product.salePrice ? Math.round(((item.product.price - item.product.salePrice) / item.product.price) * 100) : null,
        finalPrice: item.product.salePrice || item.product.price,
        inStock: item.product.stock > 0
      }));

    res.json({
      success: true,
      data: {
        products,
        total: products.length
      }
    });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json({ error: 'Failed to get recently viewed products' });
  }
});

// Clear recently viewed
router.delete('/recently-viewed', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.recentlyViewed.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Recently viewed cleared'
    });
  } catch (error) {
    console.error('Clear recently viewed error:', error);
    res.status(500).json({ error: 'Failed to clear recently viewed' });
  }
});

export default router; 