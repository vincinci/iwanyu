import express, { Response } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Recently Viewed Products

// Get user's recently viewed products
router.get('/recently-viewed', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 20 } = req.query;

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      take: Number(limit),
      orderBy: { viewedAt: 'desc' },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
                slug: true
              }
            },
            seller: {
              select: {
                businessName: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        items: recentlyViewed,
        count: recentlyViewed.length
      }
    });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json({ error: 'Failed to get recently viewed products' });
  }
});

// Add product to recently viewed
router.post('/recently-viewed/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Update view count
    await prisma.product.update({
      where: { id: productId },
      data: {
        views: {
          increment: 1
        }
      }
    });

    // Check if already in recently viewed
    const existingView = await prisma.recentlyViewed.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingView) {
      // Update view time
      await prisma.recentlyViewed.update({
        where: { id: existingView.id },
        data: { viewedAt: new Date() }
      });
    } else {
      // Add new view
      await prisma.recentlyViewed.create({
        data: {
          userId,
          productId
        }
      });

      // Keep only last 50 viewed products per user
      const allViewed = await prisma.recentlyViewed.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        select: { id: true }
      });

      if (allViewed.length > 50) {
        const toDelete = allViewed.slice(50);
        await prisma.recentlyViewed.deleteMany({
          where: {
            id: {
              in: toDelete.map(item => item.id)
            }
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Product view recorded'
    });
  } catch (error) {
    console.error('Add to recently viewed error:', error);
    res.status(500).json({ error: 'Failed to record product view' });
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
    res.status(500).json({ error: 'Failed to clear recently viewed products' });
  }
});

// Product Comparisons

// Get user's product comparisons
router.get('/comparisons', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const comparisons = await prisma.productComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
                slug: true
              }
            },
            seller: {
              select: {
                businessName: true
              }
            },
            attributes: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    });

    // Calculate average rating for each product
    const enhancedComparisons = comparisons.map(item => ({
      ...item,
      product: {
        ...item.product,
        avgRating: item.product.reviews.length > 0 
          ? item.product.reviews.reduce((sum, review) => sum + review.rating, 0) / item.product.reviews.length
          : 0,
        totalReviews: item.product.reviews.length
      }
    }));

    res.json({
      success: true,
      data: {
        items: enhancedComparisons.map(({ product }) => ({
          ...product,
          reviews: undefined // Remove reviews array from response
        })),
        count: comparisons.length
      }
    });
  } catch (error) {
    console.error('Get comparisons error:', error);
    res.status(500).json({ error: 'Failed to get product comparisons' });
  }
});

// Add product to comparisons
router.post('/comparisons/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if already in comparisons
    const existingComparison = await prisma.productComparison.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingComparison) {
      res.status(400).json({ error: 'Product already in comparisons' });
      return;
    }

    // Check comparison limit (max 4 products)
    const comparisonCount = await prisma.productComparison.count({
      where: { userId }
    });

    if (comparisonCount >= 4) {
      res.status(400).json({ error: 'Maximum 4 products can be compared at once' });
      return;
    }

    // Add to comparisons
    const comparison = await prisma.productComparison.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product added to comparisons',
      data: comparison
    });
  } catch (error) {
    console.error('Add to comparisons error:', error);
    res.status(500).json({ error: 'Failed to add product to comparisons' });
  }
});

// Remove product from comparisons
router.delete('/comparisons/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    await prisma.productComparison.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    res.json({
      success: true,
      message: 'Product removed from comparisons'
    });
  } catch (error) {
    console.error('Remove from comparisons error:', error);
    res.status(500).json({ error: 'Failed to remove product from comparisons' });
  }
});

// Clear all comparisons
router.delete('/comparisons', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.productComparison.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'All comparisons cleared'
    });
  } catch (error) {
    console.error('Clear comparisons error:', error);
    res.status(500).json({ error: 'Failed to clear comparisons' });
  }
});

export default router; 