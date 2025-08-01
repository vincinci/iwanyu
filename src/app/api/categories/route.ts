import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId') || undefined;
    const includeProducts = searchParams.get('includeProducts') === 'true';
    
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: parentId === 'null' ? null : parentId,
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' },
          ],
        },
        ...(includeProducts && {
          products: {
            where: { isActive: true },
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              images: true,
              rating: true,
              reviewCount: true,
            },
          },
        }),
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });
    
    // Convert prices from cents to RWF
    const categoriesWithPrices = categories.map(category => ({
      ...category,
      products: category.products?.map(product => ({
        ...product,
        price: product.price / 100,
        salePrice: product.salePrice ? product.salePrice / 100 : null,
      })),
    }));
    
    return NextResponse.json({
      categories: categoriesWithPrices,
    });
  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
