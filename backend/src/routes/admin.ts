import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { clearProductCaches } from './products';
import { NotificationType } from '@prisma/client';

const router = express.Router();

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/csv/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'admin-import-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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

// Clear cache endpoint
router.post('/clear-cache', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    clearProductCaches();
    res.json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

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

// Get seller verification document
router.get('/sellers/:id/document', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        nationalId: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller not found' });
      return;
    }

    if (!seller.nationalId) {
      res.status(404).json({ 
        error: 'No verification document found for this seller',
        seller: {
          id: seller.id,
          businessName: seller.businessName,
          ownerName: `${seller.user.firstName} ${seller.user.lastName}`,
          email: seller.user.email,
          status: seller.status
        }
      });
      return;
    }

    // Check if the file exists
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(seller.nationalId);

    if (!fs.existsSync(filePath)) {
      // File doesn't exist - likely due to server redeployment on cloud platforms
      const fileName = path.basename(seller.nationalId);
      const fileExtension = path.extname(fileName).toLowerCase();
      
      let fileType = 'application/octet-stream';
      if (fileExtension === '.pdf') {
        fileType = 'application/pdf';
      } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
        fileType = 'image/jpeg';
      } else if (fileExtension === '.png') {
        fileType = 'image/png';
      }

      res.status(404).json({ 
        error: 'Document file is no longer available on server',
        message: 'The verification document was uploaded but is no longer accessible due to server deployment. Please ask the seller to re-submit their verification document.',
        seller: {
          id: seller.id,
          businessName: seller.businessName,
          ownerName: `${seller.user.firstName} ${seller.user.lastName}`,
          email: seller.user.email,
          status: seller.status
        },
        documentInfo: {
          fileName,
          fileType,
          originalPath: seller.nationalId,
          uploadedApproximately: seller.createdAt,
          reason: 'File was uploaded but is no longer available due to server redeployment. Cloud platforms like Render do not persist uploaded files across deployments.'
        }
      });
      return;
    }

    // Get file info
    const fileStats = fs.statSync(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    // Determine content type
    let contentType = 'application/octet-stream';
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    }

    // Return document info and URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://iwanyu-backend.onrender.com' 
      : `http://localhost:${process.env.PORT || 3001}`;
    
    const documentUrl = `${baseUrl}/${seller.nationalId.replace(/\\/g, '/')}`;

    res.json({
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        ownerName: `${seller.user.firstName} ${seller.user.lastName}`,
        email: seller.user.email,
        status: seller.status
      },
      document: {
        fileName,
        fileSize: fileStats.size,
        fileType: contentType,
        uploadedAt: fileStats.birthtime,
        downloadUrl: documentUrl,
        viewUrl: documentUrl
      }
    });
  } catch (error) {
    console.error('Get seller document error:', error);
    res.status(500).json({ error: 'Failed to get seller document' });
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

    // Clear product caches when products are updated
    clearProductCaches();

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

// PAYMENT MANAGEMENT ENDPOINTS

/**
 * Get all seller payouts for admin management
 * GET /api/admin/payouts
 */
router.get('/payouts', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      sellerId = '',
      startDate = '',
      endDate = '',
      payoutMethod = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    // Apply filters
    if (status) where.status = status;
    if (sellerId) where.sellerId = sellerId;
    if (payoutMethod) where.payoutMethod = payoutMethod;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [payouts, total, stats] = await Promise.all([
      prisma.sellerPayout.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          seller: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      }),
      prisma.sellerPayout.count({ where }),
      // Get payout statistics
      prisma.sellerPayout.groupBy({
        by: ['status'],
        _sum: {
          amount: true
        },
        _count: {
          _all: true
        }
      })
    ]);

    // Calculate summary statistics
    const summary = {
      totalPayouts: total,
      totalAmount: await prisma.sellerPayout.aggregate({
        _sum: { amount: true },
        where
      }),
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count._all,
          amount: stat._sum.amount || 0
        };
        return acc;
      }, {} as any)
    };

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        summary
      }
    });
  } catch (error) {
    console.error('Get admin payouts error:', error);
    res.status(500).json({ error: 'Failed to get payouts' });
  }
});

/**
 * Get seller wallet overview for admin
 * GET /api/admin/seller-wallets
 */
router.get('/seller-wallets', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build search filter
    const searchFilter = search ? {
      OR: [
        { businessName: { contains: search as string, mode: 'insensitive' as const } },
        { user: { email: { contains: search as string, mode: 'insensitive' as const } } },
        { user: { firstName: { contains: search as string, mode: 'insensitive' as const } } },
        { user: { lastName: { contains: search as string, mode: 'insensitive' as const } } }
      ]
    } : {};

    const sellers = await prisma.seller.findMany({
      where: {
        status: 'APPROVED',
        ...searchFilter
      },
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
        payouts: {
          where: { status: 'COMPLETED' },
          select: { amount: true }
        }
      }
    });

    // Calculate wallet balances for each seller
    const sellersWithWallets = await Promise.all(
      sellers.map(async (seller) => {
        // Calculate total revenue from completed orders
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

        let totalRevenue = 0;
        completedOrders.forEach(order => {
          order.orderItems.forEach(item => {
            totalRevenue += item.price * item.quantity;
          });
        });

        const totalPaidOut = seller.payouts.reduce((sum, payout) => sum + payout.amount, 0);
        const availableBalance = totalRevenue - totalPaidOut;

        // Get pending payouts
        const pendingPayouts = await prisma.sellerPayout.findMany({
          where: {
            sellerId: seller.id,
            status: { in: ['PENDING', 'PROCESSING'] }
          },
          select: { amount: true, status: true }
        });

        const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);

        return {
          ...seller,
          wallet: {
            totalRevenue,
            totalPaidOut,
            availableBalance,
            pendingAmount,
            pendingPayouts: pendingPayouts.length
          }
        };
      })
    );

    const total = await prisma.seller.count({
      where: { status: 'APPROVED', ...searchFilter }
    });

    res.json({
      success: true,
      data: {
        sellers: sellersWithWallets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get seller wallets error:', error);
    res.status(500).json({ error: 'Failed to get seller wallets' });
  }
});

/**
 * Get specific seller's detailed wallet information
 * GET /api/admin/seller-wallets/:sellerId
 */
router.get('/seller-wallets/:sellerId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { sellerId } = req.params;

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Calculate detailed wallet information
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
          },
          include: {
            product: {
              select: { name: true, id: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalRevenue = 0;
    const revenueByMonth: any = {};
    
    completedOrders.forEach(order => {
      const monthKey = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
      
      order.orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalRevenue += itemTotal;
        revenueByMonth[monthKey] += itemTotal;
      });
    });

    const totalPaidOut = seller.payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, payout) => sum + payout.amount, 0);
    
    const pendingPayouts = seller.payouts.filter(p => 
      p.status === 'PENDING' || p.status === 'PROCESSING'
    );
    
    const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const availableBalance = totalRevenue - totalPaidOut - pendingAmount;

    res.json({
      success: true,
      data: {
        seller,
        wallet: {
          totalRevenue,
          totalPaidOut,
          availableBalance,
          pendingAmount,
          revenueByMonth,
          totalOrders: completedOrders.length,
          averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
        },
        recentOrders: completedOrders.slice(0, 10),
        recentPayouts: seller.payouts.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get seller wallet details error:', error);
    res.status(500).json({ error: 'Failed to get seller wallet details' });
  }
});

/**
 * Approve or reject a payout request
 * PUT /api/admin/payouts/:payoutId/status
 */
router.put('/payouts/:payoutId/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { payoutId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    const payout = await prisma.sellerPayout.findUnique({
      where: { id: payoutId },
      include: {
        seller: {
          include: { user: true }
        }
      }
    });

    if (!payout) {
      return res.status(404).json({ error: 'Payout request not found' });
    }

    if (payout.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only approve/reject pending payouts' });
    }

    // Update payout status
    const updatedPayout = await prisma.sellerPayout.update({
      where: { id: payoutId },
      data: {
        status: status === 'APPROVED' ? 'PROCESSING' : 'FAILED',
        failureReason: status === 'REJECTED' ? adminNotes : undefined,
        updatedAt: new Date()
      }
    });

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: payout.seller.userId,
        type: status === 'APPROVED' ? NotificationType.PAYOUT_APPROVED : NotificationType.PAYOUT_REJECTED,
        title: status === 'APPROVED' ? 'Payout Approved' : 'Payout Rejected',
        message: status === 'APPROVED' 
          ? `Your payout request of ${payout.amount} ${payout.currency} has been approved and is being processed.`
          : `Your payout request of ${payout.amount} ${payout.currency} has been rejected. ${adminNotes || ''}`,
        isRead: false
      }
    });

    // If approved, initiate the actual transfer (this would be handled by the existing payout system)
    if (status === 'APPROVED') {
      // The existing transfer logic would trigger here
      // For now, we'll mark it as processing and let the webhook handle completion
    }

    res.json({
      success: true,
      message: `Payout ${status.toLowerCase()} successfully`,
      data: updatedPayout
    });
  } catch (error) {
    console.error('Update payout status error:', error);
    res.status(500).json({ error: 'Failed to update payout status' });
  }
});

/**
 * Create manual payout for seller (admin initiated)
 * POST /api/admin/payouts/manual
 */
router.post('/payouts/manual', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      sellerId, 
      amount, 
      payoutMethod, 
      accountDetails, 
      narration, 
      adminNotes 
    } = req.body;

    if (!sellerId || !amount || !payoutMethod || !accountDetails) {
      return res.status(400).json({ 
        error: 'Seller ID, amount, payout method, and account details are required' 
      });
    }

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: { user: true }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Generate reference
    const reference = `ADMIN_${Date.now()}_${sellerId.slice(-6)}`;

    // Create manual payout record
    const payout = await prisma.sellerPayout.create({
      data: {
        sellerId,
        amount,
        currency: 'RWF',
        payoutMethod,
        accountDetails,
        reference,
        status: 'PROCESSING', // Admin payouts start as processing
        narration: narration || `Manual payout by admin to ${seller.businessName || seller.user.name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: seller.userId,
        type: NotificationType.PAYOUT_INITIATED,
        title: 'Manual Payout Initiated',
        message: `A manual payout of ${amount} RWF has been initiated by admin. ${narration || ''}`,
        isRead: false
      }
    });

    // Log admin action
    console.log(`Admin ${req.userId} initiated manual payout ${payout.id} for seller ${sellerId}: ${amount} RWF`);

    res.json({
      success: true,
      message: 'Manual payout created successfully',
      data: payout
    });
  } catch (error) {
    console.error('Create manual payout error:', error);
    res.status(500).json({ error: 'Failed to create manual payout' });
  }
});

/**
 * Get payout analytics and summary
 * GET /api/admin/payouts/analytics
 */
router.get('/payouts/analytics', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [
      totalPayouts,
      payoutsByStatus,
      payoutsByMethod,
      payoutTrends,
      topSellers
    ] = await Promise.all([
      // Total payouts summary
      prisma.sellerPayout.aggregate({
        _sum: { amount: true },
        _count: { _all: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Payouts grouped by status
      prisma.sellerPayout.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { _all: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Payouts grouped by method
      prisma.sellerPayout.groupBy({
        by: ['payoutMethod'],
        _sum: { amount: true },
        _count: { _all: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Daily payout trends
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, 
               SUM(amount) as amount, 
               COUNT(*) as count
        FROM seller_payouts 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Top sellers by payout amount
      prisma.sellerPayout.groupBy({
        by: ['sellerId'],
        _sum: { amount: true },
        _count: { _all: true },
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        },
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Get seller details for top sellers
    const topSellerDetails = await Promise.all(
      topSellers.map(async (seller: any) => {
        const sellerData = await prisma.seller.findUnique({
          where: { id: seller.sellerId },
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        });
        return {
          ...seller,
          seller: sellerData
        };
      })
    );

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalAmount: totalPayouts._sum.amount || 0,
          totalCount: totalPayouts._count._all || 0,
          averageAmount: totalPayouts._count._all > 0 
            ? (totalPayouts._sum.amount || 0) / totalPayouts._count._all 
            : 0
        },
        byStatus: payoutsByStatus,
        byMethod: payoutsByMethod,
        trends: payoutTrends,
        topSellers: topSellerDetails
      }
    });
  } catch (error) {
    console.error('Get payout analytics error:', error);
    res.status(500).json({ error: 'Failed to get payout analytics' });
  }
});

// CSV Import endpoint
router.post('/csv-import', authenticateToken, requireAdmin, upload.single('csvFile'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    // Read and parse CSV file
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'CSV file must contain headers and at least one product row' });
    }

    // Parse CSV manually to handle quoted values
    function parseCSVLine(line: string): string[] {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    const importResults = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Group products by handle for Shopify format
    const productGroups = new Map<string, any[]>();

    // Process each data row and group by handle
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);
        const product: any = {};
        
        headers.forEach((header, index) => {
          product[header] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
        });

        const handle = product['Handle']?.trim();
        
        // Skip rows with invalid or missing handles
        if (!handle) {
          importResults.warnings.push(`Row ${i + 1}: Missing Handle, skipping row`);
          continue;
        }
        
        // Skip if handle looks like HTML content or is too short/invalid
        if (handle.includes('<') || handle.includes('>') || handle.length < 2) {
          importResults.warnings.push(`Row ${i + 1}: Invalid Handle format (${handle.substring(0, 30)}...), skipping row`);
          continue;
        }

        if (!productGroups.has(handle)) {
          productGroups.set(handle, []);
        }
        productGroups.get(handle)!.push(product);
      } catch (error) {
        importResults.warnings.push(`Row ${i + 1}: Failed to parse CSV row - ${(error as Error).message}`);
      }
    }

    // Process each product group
    for (const [handle, variants] of productGroups) {
      try {
        const mainProduct = variants[0];
        
        // Skip if handle looks like HTML content (starts with < or contains HTML tags)
        if (handle.includes('<') || handle.includes('>') || handle.includes('</')) {
          importResults.warnings.push(`Skipping invalid handle (appears to be HTML): ${handle.substring(0, 50)}...`);
          continue;
        }
        
        // Validate and clean title
        let title = mainProduct['Title']?.trim();
        if (!title || title.includes('<') || title.includes('>')) {
          importResults.errors.push(`Product ${handle}: Missing or invalid Title`);
          importResults.failed++;
          continue;
        }

        // Validate and parse price
        let priceStr = mainProduct['Variant Price']?.toString().trim();
        if (!priceStr) {
          importResults.errors.push(`Product ${handle}: Missing Variant Price`);
          importResults.failed++;
          continue;
        }

        // Clean price string (remove currency symbols, spaces, etc.)
        priceStr = priceStr.replace(/[^\d.,]/g, '');
        const price = parseFloat(priceStr);
        if (isNaN(price) || price <= 0) {
          importResults.errors.push(`Product ${handle}: Invalid price (${mainProduct['Variant Price']})`);
          importResults.failed++;
          continue;
        }

        // Parse compare at price (sale price)
        let salePrice: number | null = null;
        if (mainProduct['Variant Compare At Price']) {
          const comparePrice = parseFloat(mainProduct['Variant Compare At Price']);
          if (!isNaN(comparePrice) && comparePrice > price) {
            salePrice = price; // Current price becomes sale price
            // price becomes compare price - but we'll keep price as the selling price
          }
        }

        // Parse stock
        let stock = 0;
        if (mainProduct['Variant Inventory Qty']) {
          stock = parseInt(mainProduct['Variant Inventory Qty']);
          if (isNaN(stock)) stock = 0;
        }

        // Handle category
        let categoryId: string | null = null;
        if (mainProduct['Product Category']) {
          const categoryPath = mainProduct['Product Category'];
          // Try to find existing category or create a simple one
          const categoryName = categoryPath.split('>').pop()?.trim() || categoryPath.trim();
          
          let category = await prisma.category.findFirst({
            where: { 
              OR: [
                { name: { equals: categoryName, mode: 'insensitive' } },
                { slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
              ]
            }
          });

          if (!category) {
            // Create new category
            const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            category = await prisma.category.create({
              data: {
                name: categoryName,
                slug: slug,
                description: `Category for ${categoryName} products`
              }
            });
            importResults.warnings.push(`Created new category: ${categoryName}`);
          }
          categoryId = category.id;
        } else {
          // Use default category
          let defaultCategory = await prisma.category.findFirst({
            where: { slug: 'general' }
          });
          
          if (!defaultCategory) {
            defaultCategory = await prisma.category.create({
              data: {
                name: 'General',
                slug: 'general',
                description: 'General products category'
              }
            });
          }
          categoryId = defaultCategory.id;
        }

        // Create slug from handle or title
        const slug = handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: { 
            OR: [
              { slug: slug },
              { name: title }
            ]
          }
        });

        if (existingProduct) {
          importResults.warnings.push(`Product ${handle}: Already exists, skipping`);
          continue;
        }

        // Collect images
        const images: string[] = [];
        variants.forEach(variant => {
          if (variant['Image Src'] && !images.includes(variant['Image Src'])) {
            images.push(variant['Image Src']);
          }
          if (variant['Variant Image'] && !images.includes(variant['Variant Image'])) {
            images.push(variant['Variant Image']);
          }
        });

        // Calculate total stock from all variants
        const totalStock = variants.reduce((sum, variant) => {
          const variantStock = parseInt(variant['Variant Inventory Qty']) || 0;
          return sum + variantStock;
        }, 0);

        // Determine status
        const status = mainProduct['Status'] === 'draft' ? 'inactive' : 'active';
        const isActive = mainProduct['Status'] !== 'archived' && mainProduct['Published'] !== 'FALSE';

        // Create product - we'll create a simple product without variants for now
        // In a full implementation, you'd handle variants properly
        const newProduct = await prisma.product.create({
          data: {
            name: title,
            slug: slug,
            description: mainProduct['Body (HTML)']?.replace(/<[^>]*>/g, '') || '', // Strip HTML
            price: price,
            salePrice: salePrice,
            categoryId: categoryId as string, // categoryId is guaranteed to be set above
            stock: totalStock || stock,
            image: images[0] || null,
            images: images,
            brand: mainProduct['Vendor'] || null,
            sku: mainProduct['Variant SKU'] || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            featured: false,
            status: status,
            isActive: isActive,
            // Note: sellerId is null for admin imports - these are admin-managed products
            sellerId: null
          }
        });

        importResults.successful++;
        console.log(`Successfully imported product: ${title}`);

      } catch (error) {
        console.error(`Error creating product ${handle}:`, error);
        importResults.errors.push(`Product ${handle}: ${(error as Error).message}`);
        importResults.failed++;
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Clear product cache since we added new products
    clearProductCaches();

    // Add summary information
    const totalProcessed = importResults.successful + importResults.failed;
    const summary = `Import completed: ${importResults.successful} successful, ${importResults.failed} failed, ${importResults.warnings.length} warnings`;
    
    console.log(summary);
    
    res.json({
      message: summary,
      results: importResults
    });

  } catch (error) {
    console.error('CSV import error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to import CSV file' });
  }
});

export default router; 