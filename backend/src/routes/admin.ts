import express, { Response } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Health check endpoint
router.get('/health', (req: AuthRequest, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Admin API is running'
  });
});

// Admin authentication middleware
const requireAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

// Admin Dashboard Stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Get overview statistics
    const [userCount, sellerCount, productCount, orderCount, categoryCount] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count()
    ]);

    // Get seller status breakdown
    const sellerStatusCounts = await prisma.seller.groupBy({
      by: ['status'],
      _count: true
    });

    // Get recent orders with user and product info
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      },
      _sum: {
        total: true
      }
    });

    res.json({
      overview: {
        userCount,
        sellerCount,
        productCount,
        orderCount,
        categoryCount
      },
      sellerStatusCounts,
      recentOrders,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// User Management
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              businessName: true,
              status: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.put('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, firstName, lastName, email } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email })
      }
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    console.log(`Delete user request: ${id}, current user: ${currentUserId}`);

    // Validate user ID format
    if (!id || typeof id !== 'string') {
      console.log('Invalid user ID format:', id);
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Prevent admin from deleting themselves
    if (id === currentUserId) {
      console.log('Admin trying to delete themselves');
      res.status(400).json({ error: 'You cannot delete your own account' });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        seller: true,
        orders: true,
        reviews: true,
        cartItems: true
      }
    });

    if (!user) {
      console.log('User not found:', id);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log(`Deleting user: ${user.email}, has seller: ${!!user.seller}, orders: ${user.orders.length}, reviews: ${user.reviews.length}, cart items: ${user.cartItems.length}`);

    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's cart items
      if (user.cartItems.length > 0) {
        console.log(`Deleting ${user.cartItems.length} cart items`);
        await tx.cartItem.deleteMany({
          where: { userId: id }
        });
      }

      // Delete user's reviews
      if (user.reviews.length > 0) {
        console.log(`Deleting ${user.reviews.length} reviews`);
        await tx.review.deleteMany({
          where: { userId: id }
        });
      }

      // If user is a seller, delete their products and seller profile
      if (user.seller) {
        console.log(`User is a seller, deleting products and seller profile`);
        // Delete seller's products
        await tx.product.deleteMany({
          where: { sellerId: user.seller.id }
        });

        // Delete seller profile
        await tx.seller.delete({
          where: { id: user.seller.id }
        });
      }

      // Note: Orders are kept for business records but we need to handle the userId constraint
      // We'll keep the orders but create a placeholder "deleted user" if needed
      if (user.orders.length > 0) {
        console.log(`Transferring ${user.orders.length} orders to deleted user placeholder`);
        // Create a placeholder deleted user entry if it doesn't exist
        const deletedUser = await tx.user.upsert({
          where: { email: 'deleted-user@system.internal' },
          update: {},
          create: {
            email: 'deleted-user@system.internal',
            firstName: 'Deleted',
            lastName: 'User',
            role: 'USER',
            password: 'deleted-account'
          }
        });

        // Transfer orders to the deleted user placeholder
        await tx.order.updateMany({
          where: { userId: id },
          data: { userId: deletedUser.id }
        });
      }

      // Finally delete the user
      console.log('Deleting user record');
      await tx.user.delete({
        where: { id }
      });
    });

    console.log(`Successfully deleted user: ${id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Seller Management
router.get('/sellers', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        }
      }),
      prisma.seller.count({ where })
    ]);

    res.json({
      sellers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ error: 'Failed to get sellers' });
  }
});

router.put('/sellers/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const seller = await prisma.seller.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ message: 'Seller status updated successfully', seller });
  } catch (error) {
    console.error('Update seller status error:', error);
    res.status(500).json({ error: 'Failed to update seller status' });
  }
});

// Product Management
router.get('/products', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', category = '', status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              businessName: true
            }
          },
          variants: {
            where: {
              isActive: true
            }
          },
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Admin Product Creation (for imports)
router.post('/products', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      salePrice,
      stock,
      sku,
      categoryId,
      brand,
      tags,
      images,
      image,
      status = 'active',
      featured = false,
      isActive = true,
      seoTitle,
      seoDescription,
      variants = []
    } = req.body;

    // Validate required fields
    if (!name || !categoryId || price === undefined) {
      res.status(400).json({ error: 'Name, categoryId, and price are required' });
      return;
    }

    // Create the main product
    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: description || '',
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        stock: stock ? Number(stock) : 0,
        sku: sku || '',
        categoryId,
        brand: brand || '',
        tags: Array.isArray(tags) ? tags : [],
        images: Array.isArray(images) ? images : [],
        image: image || (Array.isArray(images) && images.length > 0 ? images[0] : null),
        status,
        featured: Boolean(featured),
        isActive: Boolean(isActive),
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || description?.substring(0, 160) || '',
        avgRating: 0,
        totalReviews: 0,
        totalSales: 0,
        views: 0
      }
    });

    // Create variants if provided
    if (Array.isArray(variants) && variants.length > 0) {
      const variantPromises = variants.map((variant: any) => {
        return prisma.productVariant.create({
          data: {
            productId: product.id,
            name: variant.name || 'Option',
            value: variant.value || '',
            price: variant.price ? Number(variant.price) : Number(price),
            stock: variant.stock ? Number(variant.stock) : Number(stock || 0),
            sku: variant.sku || '',
            image: variant.image || null,
            sortOrder: variant.sortOrder || 0,
            isActive: true
          }
        });
      });

      await Promise.all(variantPromises);
    }

    // Fetch the complete product with variants
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    res.status(201).json({ 
      message: 'Product created successfully', 
      product: createdProduct 
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.salePrice) updateData.salePrice = parseFloat(updateData.salePrice);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Category Management
router.get('/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

router.post('/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image } = req.body;
    
    // Create slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image
      }
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    
    const updateData: any = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productCount > 0) {
      res.status(400).json({ 
        error: `Cannot delete category with ${productCount} products. Move products to another category first.` 
      });
      return;
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Order Management
router.get('/orders', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                  image: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.put('/orders/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router; 