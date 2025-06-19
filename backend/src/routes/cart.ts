import express, { Request, Response } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import cartAbandonmentService from '../services/cartAbandonmentService';

const router = express.Router();

/**
 * Get user's cart items
 * GET /api/cart
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            images: true,
            stock: true,
            isActive: true,
            variants: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total with proper pricing logic
    const total = cartItems.reduce((sum, item) => {
      let itemPrice = item.product.price;
      
      // Check if variant is specified and get variant-specific price
      if (item.variantId) {
        const variant = item.product.variants.find(v => v.id === item.variantId);
        if (variant && variant.price && variant.price > 0) {
          itemPrice = variant.price;
        }
      }
      
      // Apply sale price if available and lower than current price
      if (item.product.salePrice && item.product.salePrice < itemPrice) {
        itemPrice = item.product.salePrice;
      }
      
      return sum + (itemPrice * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        total,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart items' });
  }
});

/**
 * Add item to cart
 * POST /api/cart/add
 */
router.post('/add', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found or inactive' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` 
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${product.stock}, Total requested: ${newQuantity}` 
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true
            }
          }
        }
      });
    }

    // Track cart activity for abandonment email
    await cartAbandonmentService.onCartItemAdded(userId);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

/**
 * Update cart item quantity
 * PUT /api/cart/update/:itemId
 */
router.put('/update/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${cartItem.product.stock}, Requested: ${quantity}` 
      });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true
          }
        }
      }
    });

    // Track cart activity for abandonment email
    await cartAbandonmentService.onCartItemUpdated(userId);

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedCartItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

/**
 * Remove item from cart
 * DELETE /api/cart/remove/:itemId
 */
router.delete('/remove/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { itemId } = req.params;

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    // Track cart activity for abandonment email
    await cartAbandonmentService.onCartItemRemoved(userId);

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

/**
 * Clear entire cart
 * DELETE /api/cart/clear
 */
router.delete('/clear', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    // Clear abandonment timer since cart is empty
    cartAbandonmentService.clearAbandonmentTimer(userId);

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

/**
 * Get cart summary (item count and total)
 * GET /api/cart/summary
 */
router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            price: true,
            salePrice: true,
            variants: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    const itemCount = cartItems.length;
    const total = cartItems.reduce((sum, item) => {
      let itemPrice = item.product.price;
      
      // Check if variant is specified and get variant-specific price
      if (item.variantId) {
        const variant = item.product.variants.find(v => v.id === item.variantId);
        if (variant && variant.price && variant.price > 0) {
          itemPrice = variant.price;
        }
      }
      
      // Apply sale price if available and lower than current price
      if (item.product.salePrice && item.product.salePrice < itemPrice) {
        itemPrice = item.product.salePrice;
      }
      
      return sum + (itemPrice * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        itemCount,
        total
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ error: 'Failed to get cart summary' });
  }
});

export default router; 