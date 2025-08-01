import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentStatus } from '@/lib/flutterwave';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify webhook signature
    const signature = req.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    
    if (!secretHash) {
      console.error('Flutterwave secret hash not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    if (signature !== secretHash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Process webhook data
    const { data } = body;
    
    if (!data || !data.tx_ref) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }
    
    // Find the order
    const order = await prisma.order.findFirst({
      where: { paymentId: data.tx_ref },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        vendor: true,
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const paymentStatus = getPaymentStatus(data.status);
    
    // Only process if status has changed
    if (order.paymentStatus === paymentStatus) {
      return NextResponse.json({ message: 'Status already updated' }, { status: 200 });
    }
    
    const updateData: any = {
      paymentStatus,
    };
    
    if (paymentStatus === 'COMPLETED') {
      updateData.status = 'CONFIRMED';
      
      // Update product stock
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
      
      // Update vendor revenue
      await prisma.vendor.update({
        where: { id: order.vendorId },
        data: {
          totalRevenue: {
            increment: order.total,
          },
          totalSales: {
            increment: 1,
          },
        },
      });
      
      // You could also send confirmation emails here
      console.log(`Order ${order.orderNumber} payment completed`);
    } else if (paymentStatus === 'FAILED') {
      updateData.status = 'CANCELLED';
      console.log(`Order ${order.orderNumber} payment failed`);
    }
    
    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });
    
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
