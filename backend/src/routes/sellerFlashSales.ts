import express, { Request, Response } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Helper to get seller by user id
async function getSeller(userId: string) {
  return prisma.seller.findFirst({ where: { userId } });
}

// List all flash sales for the seller (and their products)
router.get('/flash-sales', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    const flashSales = await prisma.flashSale.findMany({
      where: {
        products: {
          some: {
            product: {
              sellerId: seller.id
            }
          }
        }
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: flashSales });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flash sales' });
  }
});

// Create a new flash sale
router.post('/flash-sales', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const flashSale = await prisma.flashSale.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true
      }
    });
    res.json({ success: true, data: flashSale });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flash sale' });
  }
});

// List seller's discounted products (with salePrice)
router.get('/discounted-products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    const products = await prisma.product.findMany({
      where: {
        sellerId: seller.id,
        salePrice: { not: null },
        isActive: true
      }
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discounted products' });
  }
});

// Add a discounted product to a flash sale
router.post('/flash-sales/:flashSaleId/add-product', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    const { flashSaleId } = req.params;
    const { productId } = req.body;
    // Ensure the product belongs to the seller and is discounted
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: seller.id,
        salePrice: { not: null },
        isActive: true
      }
    });
    if (!product) {
      return res.status(400).json({ error: 'Product not found or not eligible' });
    }
    // Add to flash sale
    const flashSaleProduct = await prisma.flashSaleProduct.create({
      data: {
        flashSaleId,
        productId,
        salePrice: product.salePrice!,
        originalPrice: product.price,
        stock: product.stock
      }
    });
    res.json({ success: true, data: flashSaleProduct });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product to flash sale' });
  }
});

// Remove a product from a flash sale
router.delete('/flash-sales/:flashSaleId/remove-product/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    const { flashSaleId, productId } = req.params;
    // Ensure the product belongs to the seller
    const flashSaleProduct = await prisma.flashSaleProduct.findFirst({
      where: {
        flashSaleId,
        productId,
        product: {
          sellerId: seller.id
        }
      }
    });
    if (!flashSaleProduct) {
      return res.status(404).json({ error: 'Product not found in this flash sale' });
    }
    await prisma.flashSaleProduct.delete({ where: { id: flashSaleProduct.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove product from flash sale' });
  }
});

// Update flash sale status
router.patch('/flash-sales/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    
    const { id } = req.params;
    const { isActive } = req.body;

    const flashSale = await prisma.flashSale.findFirst({
      where: {
        id,
        products: {
          some: {
            product: {
              sellerId: seller.id
            }
          }
        }
      }
    });

    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }

    await prisma.flashSale.update({
      where: { id },
      data: { isActive }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flash sale status' });
  }
});

// Add multiple products to flash sale
router.post('/flash-sales/:flashSaleId/add-products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    
    const { flashSaleId } = req.params;
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array' });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        sellerId: seller.id,
        salePrice: { not: null },
        isActive: true
      }
    });

    const results = await Promise.all(
      products.map(product => 
        prisma.flashSaleProduct.create({
          data: {
            flashSaleId,
            productId: product.id,
            salePrice: product.salePrice!,
            originalPrice: product.price,
            stock: product.stock
          }
        }).catch(err => ({ error: err.message, productId: product.id }))
      )
    );

    res.json({ 
      success: true, 
      data: {
        added: results.filter(r => !('error' in r)).length,
        failed: results.filter(r => 'error' in r).length,
        errors: results.filter(r => 'error' in r)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add products to flash sale' });
  }
});

// Get flash sale preview data
router.get('/flash-sales/:id/preview', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    
    const { id } = req.params;

    const flashSale = await prisma.flashSale.findFirst({
      where: {
        id,
        products: {
          some: {
            product: {
              sellerId: seller.id
            }
          }
        }
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                price: true,
                salePrice: true,
                stock: true
              }
            }
          }
        }
      }
    });

    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }

    // Calculate preview statistics
    const stats = {
      totalProducts: flashSale.products.length,
      totalStock: flashSale.products.reduce((sum, p) => sum + p.stock, 0),
      averageDiscount: flashSale.products.reduce((sum, p) => 
        sum + ((p.originalPrice - p.salePrice) / p.originalPrice * 100), 0) / flashSale.products.length,
      potentialRevenue: flashSale.products.reduce((sum, p) => sum + (p.salePrice * p.stock), 0)
    };

    res.json({ 
      success: true, 
      data: {
        ...flashSale,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get flash sale preview' });
  }
});

// Update flash sale details
router.put('/flash-sales/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const seller = await getSeller(userId!);
    if (!seller) return res.status(403).json({ error: 'Seller access required' });
    
    const { id } = req.params;
    const { title, description, startTime, endTime } = req.body;

    const flashSale = await prisma.flashSale.findFirst({
      where: {
        id,
        products: {
          some: {
            product: {
              sellerId: seller.id
            }
          }
        }
      }
    });

    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }

    await prisma.flashSale.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flash sale' });
  }
});

export default router;