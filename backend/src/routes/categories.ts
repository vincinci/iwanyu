import express, { Request, Response } from 'express';
import prisma from '../utils/db';

const router = express.Router();

// Cache for categories
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for categories (they change less frequently)

// Get all categories with ultra-fast caching
router.get('/', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'categories:all';
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        parentId: true,
        level: true,
        sortOrder: true,
        children: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            icon: true,
            parentId: true,
            level: true,
            sortOrder: true,
            _count: {
              select: {
                products: {
                  where: {
                    isActive: true
                  }
                }
              }
            }
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    const response = { 
      success: true, 
      data: { categories } 
    };

    // Cache the response for longer since categories don't change often
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    res.json(response);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category with products
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const cacheKey = `category:${slug}:${page}:${limit}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL / 2) { // Shorter cache for category pages
      return res.json(cached.data);
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        seoTitle: true,
        seoDescription: true
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get products in this category with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: category.id,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          image: true,
          stock: true,
          featured: true,
          avgRating: true,
          totalReviews: true,
          totalSales: true,
          createdAt: true
        },
        skip,
        take: Number(limit),
        orderBy: [
          { featured: 'desc' },
          { totalSales: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.product.count({
        where: {
          categoryId: category.id,
          isActive: true
        }
      })
    ]);

    const response = {
      success: true,
      data: {
        category,
        products: products.map(product => ({
          ...product,
          discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : null,
          finalPrice: product.salePrice || product.price,
          inStock: product.stock > 0
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    };

    // Cache the response
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    res.json(response);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router; 