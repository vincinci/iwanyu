import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSessionFromRequest } from '@/lib/auth';
import { z } from 'zod';

const createProductSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(100, 'Price must be at least 1 RWF'), // in cents
  salePrice: z.number().optional(),
  stock: z.number().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().min(0).default(10),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a vendor with approved profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.id },
    });
    
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 });
    }
    
    if (!vendor.isApproved) {
      return NextResponse.json({ error: 'Vendor account not approved yet' }, { status: 403 });
    }
    
    const body = await req.json();
    const validatedData = createProductSchema.parse(body);
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }
    
    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    });
    
    if (existingProduct) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }
    
    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug exists and make it unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: validatedData.categoryId,
        name: validatedData.name,
        slug: uniqueSlug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription || validatedData.name,
        sku: validatedData.sku,
        price: validatedData.price,
        salePrice: validatedData.salePrice,
        stock: validatedData.stock,
        lowStockThreshold: validatedData.lowStockThreshold,
        images: validatedData.images,
        weight: validatedData.weight,
        dimensions: validatedData.dimensions,
        tags: validatedData.tags,
        isFeatured: validatedData.isFeatured,
        isActive: true,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: 'Product created successfully',
      product,
      success: true,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Product creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
