import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSessionFromRequest } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const body = await req.json();
    const { isApproved, isVerified } = body;
    
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        isApproved: isApproved ?? undefined,
        isVerified: isVerified ?? undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: 'Vendor status updated successfully',
      vendor,
      success: true,
    });
  } catch (error: any) {
    console.error('Vendor approval error:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor status' },
      { status: 500 }
    );
  }
}
