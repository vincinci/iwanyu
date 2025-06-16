import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import brevoService from '../services/brevoService';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath: string;
    
    // Use different directories for different file types
    if (file.fieldname === 'nationalId') {
      uploadPath = 'uploads/national-ids/';
    } else if (file.fieldname === 'productImage') {
      uploadPath = 'uploads/products/';
    } else {
      uploadPath = 'uploads/';
    }
    
    // Ensure the directory exists
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    if (file.fieldname === 'nationalId') {
      cb(null, 'national-id-' + uniqueSuffix + path.extname(file.originalname));
    } else if (file.fieldname === 'productImage') {
      cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    } else {
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Allow images and PDFs for national ID, only images for products
  if (file.fieldname === 'nationalId') {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed for national ID'), false);
    }
  } else if (file.fieldname === 'productImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for products'), false);
    }
  } else {
    cb(new Error('Unknown field'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

// Create seller profile (become a seller)
router.post('/become-seller', authenticateToken, upload.single('nationalId'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { 
      businessName, 
      businessEmail, 
      businessPhone, 
      businessAddress,
      businessDescription,
      businessType 
    } = req.body;

    // Validate required fields
    if (!businessName || !businessEmail) {
      res.status(400).json({ 
        error: 'Business name and business email are required',
        details: {
          businessName: !businessName ? 'Business name is required' : null,
          businessEmail: !businessEmail ? 'Business email is required' : null
        }
      });
      return;
    }

    // Check if user already has a seller profile
    const existingSeller = await prisma.seller.findFirst({
      where: { userId }
    });

    if (existingSeller) {
      res.status(400).json({ error: 'User already has a seller profile' });
      return;
    }

    // Check if business email is already taken
    const existingBusinessEmail = await prisma.seller.findFirst({
      where: { businessEmail }
    });

    if (existingBusinessEmail) {
      res.status(400).json({ 
        error: 'Business email is already registered',
        details: { businessEmail: 'This email is already associated with another seller account' }
      });
      return;
    }

    // Get the uploaded file path if present
    const nationalId = req.file ? req.file.path : null;

    // Log the creation attempt for debugging
    console.log('Creating seller profile:', {
      userId,
      businessName,
      businessEmail,
      businessPhone,
      nationalIdUploaded: !!nationalId
    });

    // Create seller profile
    const seller = await prisma.seller.create({
      data: {
        userId,
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        businessDescription,
        businessType,
        nationalId,
        status: 'PENDING', // Default to pending approval
      }
    });

    // Update user role to SELLER
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'SELLER' }
    });

    console.log('Seller profile created successfully:', seller.id);

    res.status(201).json({
      message: 'Seller profile created successfully',
      seller
    });
  } catch (error) {
    console.error('Seller creation error:', error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const target = (error as any).meta?.target;
      if (target?.includes('businessEmail')) {
        res.status(400).json({ 
          error: 'Business email is already registered',
          details: { businessEmail: 'This email is already associated with another seller account' }
        });
        return;
      }
      if (target?.includes('userId')) {
        res.status(400).json({ error: 'User already has a seller profile' });
        return;
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to create seller profile',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Get seller profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const seller = await prisma.seller.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller profile not found' });
      return;
    }

    res.json(seller);
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ error: 'Failed to get seller profile' });
  }
});

// Update seller profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const updateData = req.body;

    const seller = await prisma.seller.updateMany({
      where: { userId },
      data: updateData
    });

    if (seller.count === 0) {
      res.status(404).json({ error: 'Seller profile not found' });
      return;
    }

    res.json({ message: 'Seller profile updated successfully' });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({ error: 'Failed to update seller profile' });
  }
});

// Get seller dashboard stats
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get seller info
    const seller = await prisma.seller.findFirst({
      where: { userId }
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller profile not found' });
      return;
    }

    // Get active product count only (excludes soft-deleted products)
    const productCount = await prisma.product.count({
      where: { 
        sellerId: seller.id,
        isActive: true // Only count active products
      }
    });

    // Get total sales (orders containing seller's products)
    // This includes ALL historical sales, even from deleted products
    const totalSales = await prisma.orderItem.aggregate({
      where: {
        product: {
          sellerId: seller.id
          // Note: We don't filter by isActive here to preserve historical sales data
        }
      },
      _sum: {
        quantity: true
      },
      _count: true
    });

    // Get recent orders (including orders from deleted products for complete history)
    const recentOrders = await prisma.orderItem.findMany({
      where: {
        product: {
          sellerId: seller.id
          // Note: We don't filter by isActive here to show complete order history
        }
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        product: {
          select: {
            name: true,
            price: true,
            image: true,
            isActive: true // Include this to show if product is still active
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    res.json({
      productCount, // Only active products
      totalSales: totalSales._sum.quantity || 0, // All historical sales
      totalOrders: totalSales._count || 0, // All historical orders
      recentOrders // All recent orders (with product status)
    });
  } catch (error) {
    console.error('Get seller dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get seller's products (only active products for management)
router.get('/products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get seller info
    const seller = await prisma.seller.findFirst({
      where: { userId }
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller profile not found' });
      return;
    }

    // Get seller's active products only (excludes soft-deleted products)
    const products = await prisma.product.findMany({
      where: { 
        sellerId: seller.id,
        isActive: true // Only show active products in management interface
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Create a new product
router.post('/products', authenticateToken, upload.single('productImage'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get seller info and check if approved
    const seller = await prisma.seller.findFirst({
      where: { userId }
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller profile not found' });
      return;
    }

    if (seller.status !== 'APPROVED') {
      res.status(403).json({ error: 'Seller account must be approved to add products' });
      return;
    }

    // Check product limit (10 products max for sellers)
    const existingProductsCount = await prisma.product.count({
      where: {
        sellerId: seller.id,
        isActive: true
      }
    });

    if (existingProductsCount >= 10) {
      res.status(403).json({ 
        error: 'Product limit exceeded. Sellers can only have a maximum of 10 active products.',
        details: {
          currentCount: existingProductsCount,
          maxAllowed: 10
        }
      });
      return;
    }

    const {
      name,
      description,
      price,
      salePrice,
      categoryId,
      stock,
      image,
      images,
      brand,
      sku
    } = req.body;

    // Use uploaded file path if available, otherwise use provided image URL
    const productImage = req.file ? req.file.path : image;

    // Create slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() + '-' + Date.now();

    // Prepare images array - include the main image if it exists
    let productImages: string[] = [];
    if (images && Array.isArray(images)) {
      productImages = images;
    } else if (images && typeof images === 'string') {
      try {
        productImages = JSON.parse(images);
      } catch {
        productImages = [images];
      }
    }

    // Add main image to images array if not already included
    if (productImage && !productImages.includes(productImage)) {
      productImages.unshift(productImage); // Add as first image
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        categoryId,
        sellerId: seller.id,
        stock: parseInt(stock) || 0,
        image: productImage,
        images: productImages,
        brand,
        sku,
        featured: false,
        status: 'active',
        isActive: true
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/products/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const productId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get seller info
    const seller = await prisma.seller.findFirst({
      where: { userId }
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller profile not found' });
      return;
    }

    // Check if product belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: seller.id
      }
    });

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found or not owned by seller' });
      return;
    }

    const updateData = req.body;
    
    // Update numerical fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.salePrice) updateData.salePrice = parseFloat(updateData.salePrice);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
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

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product (soft delete - preserves historical data)
router.delete('/products/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const productId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get seller info
    const seller = await prisma.seller.findFirst({
      where: { userId }
    });

    if (!seller) {
      res.status(404).json({ error: 'Seller profile not found' });
      return;
    }

    // Check if product belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: seller.id
      }
    });

    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found or not owned by seller' });
      return;
    }

    // Soft delete: Set isActive to false instead of deleting
    // This preserves all historical data (orders, sales, statistics)
    await prisma.product.update({
      where: { id: productId },
      data: { 
        isActive: false,
        status: 'deleted',
        updatedAt: new Date()
      }
    });

    res.json({ 
      message: 'Product deleted successfully',
      note: 'Product has been deactivated. Historical sales data is preserved.'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router; 