import express, { Request, Response } from 'express';
import prisma from '../utils/db';

const router = express.Router();

// Cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to clear product-related caches
const clearProductCaches = () => {
  const keysToDelete: string[] = [];
  for (const key of cache.keys()) {
    if (key.startsWith('products:') || key.startsWith('product:')) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`Cleared ${keysToDelete.length} product cache entries`);
};

// Export the cache clearing function for use in other routes
export { clearProductCaches };

// Get all products with ultra-optimized query
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 12, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Create cache key
    const cacheKey = `products:${page}:${limit}:${category || ''}:${search || ''}:${sortBy}:${sortOrder}`;
    
    // Check cache first, but skip cache if no search/category filters and we might have stale empty results
    const cached = cache.get(cacheKey);
    const shouldUseCache = cached && Date.now() - cached.timestamp < CACHE_TTL;
    
    // Skip cache for basic queries that might be stale empty results
    const isBasicQuery = !search && !category;
    if (shouldUseCache && !(isBasicQuery && cached.data?.data?.products?.length === 0)) {
      return res.json(cached.data);
    }

    // Build optimized where clause
    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Ultra-optimized query - only essential fields for listing
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          image: true,
          images: true,
          stock: true,
          featured: true,
          avgRating: true,
          totalReviews: true,
          totalSales: true,
          createdAt: true,
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
        },
        skip,
        take: Number(limit),
        orderBy: {
          [sortBy as string]: sortOrder
        }
      }),
      prisma.product.count({ where })
    ]);

    // Optimize response by calculating derived data
    const optimizedProducts = products.map(product => ({
      ...product,
      discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : null,
      finalPrice: product.salePrice || product.price,
      inStock: product.stock > 0
    }));

    const response = {
      success: true,
      data: {
        products: optimizedProducts,
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

    // Clean old cache entries periodically
    if (cache.size > 100) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product with optimized query (handles both ID and slug)
router.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    // Check cache first
    const cacheKey = `product:${identifier}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // Determine if identifier is an ID (cuid format) or slug
    const isId = /^c[a-z0-9]{24}$/.test(identifier); // CUID format check
    
    const product = await prisma.product.findFirst({
      where: isId 
        ? { id: identifier, isActive: true } // Search by ID and ensure product is active
        : { slug: identifier, isActive: true }, // Search by slug and ensure product is active
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        salePrice: true,
        image: true,
        images: true,
        stock: true,
        sku: true,
        brand: true,
        featured: true,
        avgRating: true,
        totalReviews: true,
        totalSales: true,
        views: true,
        tags: true,
        isActive: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            value: true,
            price: true,
            stock: true,
            image: true
          },
          orderBy: { sortOrder: 'asc' }
        },
        attributes: {
          select: {
            id: true,
            name: true,
            value: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count asynchronously (don't wait)
    prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } }
    }).catch(console.error);

    const response = {
      success: true,
      data: {
        product: {
          ...product,
          discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : null,
          finalPrice: product.salePrice || product.price,
          inStock: product.stock > 0
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
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get featured products (cached heavily)
router.get('/featured/list', async (req: Request, res: Response) => {
  try {
    const { limit = 8 } = req.query;
    const cacheKey = `featured:${limit}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL * 2) { // Cache longer for featured
      return res.json(cached.data);
    }

    const products = await prisma.product.findMany({
      where: {
        featured: true,
        isActive: true,
        stock: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        images: true,
        avgRating: true,
        totalReviews: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: Number(limit),
      orderBy: [
        { totalSales: 'desc' },
        { avgRating: 'desc' }
      ]
    });

    const response = {
      success: true,
      data: {
        products: products.map(product => ({
          ...product,
          discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : null,
          finalPrice: product.salePrice || product.price
        }))
      }
    };

    // Cache for longer
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    res.json(response);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

export default router; 