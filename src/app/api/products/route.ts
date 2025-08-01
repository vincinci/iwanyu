import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const queryData = {
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      vendor: searchParams.get('vendor') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      inStock: searchParams.get('inStock') === 'true',
      tags: searchParams.get('tags')?.split(',') || undefined,
      sortBy: searchParams.get('sortBy') as any || 'newest',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    };
    
    // Validate query parameters
    const validatedQuery = searchSchema.parse(queryData);
    
    // Build where clause
    const where: any = {
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
    let orderBy: any = {};
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
    
    return NextResponse.json({
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
  } catch (error: any) {
    console.error('Products fetch error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
