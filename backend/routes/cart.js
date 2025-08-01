const express = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { validateSessionFromRequest } = require('../lib/auth');

const router = express.Router();

// Cart item schema
const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  selectedVariantId: z.string().optional(),
});

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: true,
            variants: true,
            vendor: true,
          },
        },
        selectedVariant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;

    const formattedItems = cartItems.map(item => {
      const price = item.selectedVariant?.price || item.product.price;
      const itemTotal = price * item.quantity;
      
      totalItems += item.quantity;
      totalPrice += itemTotal;

      return {
        id: item.id,
        quantity: item.quantity,
        price: price,
        total: itemTotal,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          image: item.product.images[0]?.url || '/placeholder.png',
          vendor: {
            id: item.product.vendor.id,
            name: item.product.vendor.businessName,
          },
        },
        selectedVariant: item.selectedVariant ? {
          id: item.selectedVariant.id,
          name: item.selectedVariant.name,
          price: item.selectedVariant.price,
          attributes: item.selectedVariant.attributes,
        } : null,
      };
    });

    res.json({
      items: formattedItems,
      summary: {
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { productId, quantity, selectedVariantId } = cartItemSchema.parse(req.body);

    // Check if product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Product is not available' });
    }

    // Validate selected variant if provided
    if (selectedVariantId) {
      const variant = product.variants.find(v => v.id === selectedVariantId);
      if (!variant) {
        return res.status(400).json({ error: 'Selected variant not found' });
      }
      if (quantity > variant.stock) {
        return res.status(400).json({ error: 'Insufficient variant stock' });
      }
    } else if (quantity > product.stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId,
        selectedVariantId: selectedVariantId || null,
      },
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      const maxStock = selectedVariantId 
        ? product.variants.find(v => v.id === selectedVariantId)?.stock || 0
        : product.stock;

      if (newQuantity > maxStock) {
        return res.status(400).json({ error: 'Total quantity exceeds available stock' });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              images: true,
              vendor: true,
            },
          },
          selectedVariant: true,
        },
      });

      res.json({
        message: 'Cart item updated',
        item: updatedItem,
      });
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
          selectedVariantId,
        },
        include: {
          product: {
            include: {
              images: true,
              vendor: true,
            },
          },
          selectedVariant: true,
        },
      });

      res.status(201).json({
        message: 'Item added to cart',
        item: cartItem,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/:itemId', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { itemId } = req.params;
    const { quantity } = z.object({
      quantity: z.number().int().positive(),
    }).parse(req.body);

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId: user.id,
      },
      include: {
        product: {
          include: { variants: true },
        },
        selectedVariant: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check stock availability
    const maxStock = cartItem.selectedVariant?.stock || cartItem.product.stock;
    if (quantity > maxStock) {
      return res.status(400).json({ error: 'Quantity exceeds available stock' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: true,
            vendor: true,
          },
        },
        selectedVariant: true,
      },
    });

    res.json({
      message: 'Cart item updated',
      item: updatedItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/:itemId', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { itemId } = req.params;

    // Verify ownership and delete
    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        userId: user.id,
      },
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Get cart count
router.get('/count', async (req, res) => {
  try {
    const user = await validateSessionFromRequest(req);
    if (!user) {
      return res.json({ count: 0 });
    }

    const totalItems = await prisma.cartItem.aggregate({
      where: { userId: user.id },
      _sum: { quantity: true },
    });

    res.json({ count: totalItems._sum.quantity || 0 });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({ error: 'Failed to get cart count' });
  }
});

module.exports = router;
