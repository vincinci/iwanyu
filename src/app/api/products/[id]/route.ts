import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const product = await prisma.product.findUnique({
      where: { 
        id: id,
        isActive: true 
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessPhone: true,
            rating: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            cartItems: true,
          },
        },
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Calculate average rating from existing rating field
    const avgRating = product.rating || 0;
    
    return NextResponse.json({
      product: {
        ...product,
        averageRating: Number(avgRating.toFixed(1)),
        totalReviews: product._count.reviews,
        totalFavorites: product._count.favorites,
        inCartCount: product._count.cartItems,
      },
      success: true,
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
