import express, { Response } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        items: wishlistItems,
        count: wishlistItems.length
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add product to wishlist
router.post('/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (!product.isActive) {
      res.status(400).json({ error: 'Product is not available' });
      return;
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingItem) {
      res.status(400).json({ error: 'Product already in wishlist' });
      return;
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
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
      message: 'Product added to wishlist',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add product to wishlist' });
  }
});

// Remove product from wishlist
router.delete('/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const deletedItem = await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove product from wishlist' });
  }
});

// Clear entire wishlist
router.delete('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.wishlistItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Wishlist cleared'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem
      }
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ error: 'Failed to check wishlist status' });
  }
});

// Move wishlist item to cart
router.post('/:productId/move-to-cart', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Check if product is in wishlist
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (!wishlistItem) {
      res.status(404).json({ error: 'Product not found in wishlist' });
      return;
    }

    // Check product availability
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, isActive: true }
    });

    if (!product || !product.isActive) {
      res.status(400).json({ error: 'Product is not available' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    // Add to cart or update quantity
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId: null
      }
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        }
      });
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    res.json({
      success: true,
      message: 'Product moved to cart'
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({ error: 'Failed to move product to cart' });
  }
});

export default router; 