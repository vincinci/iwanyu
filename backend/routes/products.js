const express = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');

const router = express.Router();

// Search schema validation
const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  inStock: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_low', 'price_high', 'rating', 'popularity']).default('newest'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// GET /api/products - Get all products with filtering and search
router.get('/', async (req, res) => {
  try {
    // Parse query parameters
    const queryData = {
      query: req.query.query || undefined,
      category: req.query.category || undefined,
      vendor: req.query.vendor || undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      rating: req.query.rating ? Number(req.query.rating) : undefined,
      inStock: req.query.inStock === 'true',
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      sortBy: req.query.sortBy || 'newest',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };
    
    // Validate query parameters
    const validatedQuery = searchSchema.parse(queryData);
    
    // Build where clause
    const where = {
      isActive: true,
    };
    
    if (validatedQuery.query) {
      where.OR = [
        { name: { contains: validatedQuery.query, mode: 'insensitive' } },
        { description: { contains: validatedQuery.query, mode: 'insensitive' } },
        { tags: { hasSome: [validatedQuery.query] } },
      ];
    }
    
    if (validatedQuery.category) {
      where.categoryId = validatedQuery.category;
    }
    
    if (validatedQuery.vendor) {
      where.vendorId = validatedQuery.vendor;
    }
    
    if (validatedQuery.minPrice || validatedQuery.maxPrice) {
      where.price = {};
      if (validatedQuery.minPrice) where.price.gte = validatedQuery.minPrice * 100; // Convert to cents
      if (validatedQuery.maxPrice) where.price.lte = validatedQuery.maxPrice * 100; // Convert to cents
    }
    
    if (validatedQuery.rating) {
      where.rating = { gte: validatedQuery.rating };
    }
    
    if (validatedQuery.inStock) {
      where.stock = { gt: 0 };
    }
    
    if (validatedQuery.tags && validatedQuery.tags.length > 0) {
      where.tags = { hasSome: validatedQuery.tags };
    }
    
    // Build order by
    let orderBy = {};
    switch (validatedQuery.sortBy) {
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'popularity':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    
    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;
    
    // Get products and total count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: validatedQuery.limit,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              rating: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    // Convert prices from cents to RWF
    const productsWithPrices = products.map(product => ({
      ...product,
      price: product.price / 100,
      salePrice: product.salePrice ? product.salePrice / 100 : null,
    }));
    
    const totalPages = Math.ceil(totalCount / validatedQuery.limit);
    
    res.json({
      products: productsWithPrices,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        totalCount,
        totalPages,
        hasNextPage: validatedQuery.page < totalPages,
        hasPrevPage: validatedQuery.page > 1,
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
