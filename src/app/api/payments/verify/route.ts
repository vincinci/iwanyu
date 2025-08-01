import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { flutterwaveService, getPaymentStatus } from '@/lib/flutterwave';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction_id, tx_ref } = body;
    
    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    // Verify payment with Flutterwave
    const verificationResponse = await flutterwaveService.verifyPayment(transaction_id);
    
    if (verificationResponse.status === 'success' && verificationResponse.data) {
      const paymentData = verificationResponse.data;
      
      // Find the order
      const order = await prisma.order.findFirst({
        where: { paymentId: paymentData.tx_ref },
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
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      // Check if amounts match
      const expectedAmount = order.total / 100; // Convert from cents
      if (paymentData.amount !== expectedAmount) {
        return NextResponse.json(
          { error: 'Amount mismatch' },
          { status: 400 }
        );
      }
      
      const paymentStatus = getPaymentStatus(paymentData.status);
      
      // Update order based on payment status
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
      } else if (paymentStatus === 'FAILED') {
        updateData.status = 'CANCELLED';
      }
      
      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });
      
      return NextResponse.json({
        message: 'Payment verified successfully',
        status: paymentStatus,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: updateData.status || order.status,
          paymentStatus,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
