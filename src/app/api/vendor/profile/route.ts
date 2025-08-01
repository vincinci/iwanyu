import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSessionFromRequest } from '@/lib/auth';
import { z } from 'zod';

const vendorProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessDescription: z.string().optional(),
  businessPhone: z.string().regex(/^(\+250|250)?[0-9]{9}$/, 'Invalid Rwanda phone number'),
  businessAddress: z.string().min(5, 'Business address is required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Only vendors can create vendor profiles' }, { status: 403 });
    }
    
    // Check if vendor profile already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: session.id },
    });
    
    if (existingVendor) {
      return NextResponse.json({ error: 'Vendor profile already exists' }, { status: 400 });
    }
    
    const body = await req.json();
    const validatedData = vendorProfileSchema.parse(body);
    
    const vendor = await prisma.vendor.create({
      data: {
        userId: session.id,
        businessName: validatedData.businessName,
        businessDescription: validatedData.businessDescription,
        businessPhone: validatedData.businessPhone,
        businessAddress: validatedData.businessAddress,
        isApproved: false, // Requires admin approval
        isVerified: false,
      },
    });
    
    return NextResponse.json({
      message: 'Vendor profile created successfully. Pending admin approval.',
      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        businessDescription: vendor.businessDescription,
        businessPhone: vendor.businessPhone,
        businessAddress: vendor.businessAddress,
        isApproved: vendor.isApproved,
        isVerified: vendor.isVerified,
      },
      success: true,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Vendor profile creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create vendor profile' },
      { status: 500 }
    );
  }
}
