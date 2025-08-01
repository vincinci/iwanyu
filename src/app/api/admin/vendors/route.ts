import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const vendorStats = {
      total: vendors.length,
      approved: vendors.filter(v => v.isApproved).length,
      pending: vendors.filter(v => !v.isApproved).length,
      verified: vendors.filter(v => v.isVerified).length,
    };
    
    return NextResponse.json({
      vendors,
      stats: vendorStats,
      success: true,
    });
  } catch (error: any) {
    console.error('Get vendors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}
