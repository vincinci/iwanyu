import { NextRequest, NextResponse } from 'next/server';
import { validateSessionFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const paymentSchema = z.object({
  cartId: z.string().optional(),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().default('Rwanda'),
  }),
  paymentMethod: z.enum(['mobile_money', 'card']),
  phoneNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Validate session
    const user = await validateSessionFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cartId, deliveryAddress, paymentMethod, phoneNumber } = paymentSchema.parse(body);

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cart: {
          userId: user.id,
          ...(cartId ? { id: cartId } : {}),
        },
      },
      include: {
        product: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalAmount = 0;
    let vendors = new Set();

    for (const item of cartItems) {
      // Check stock availability
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = (item.product.salePrice || item.product.price) * item.quantity;
      totalAmount += itemTotal;
      vendors.add(item.product.vendorId);
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        vendorId: cartItems[0].product.vendorId, // For now, use first vendor
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        total: totalAmount,
        subtotal: totalAmount,
        tax: 0,
        shippingFee: 0,
        shippingAddress: deliveryAddress as any,
        paymentMethod,
        paymentId: null,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.salePrice || item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Initialize Flutterwave payment
    const flutterwaveData = {
      tx_ref: `order_${order.id}_${Date.now()}`,
      amount: totalAmount / 100, // Convert from cents to RWF
      currency: 'RWF',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      payment_options: paymentMethod === 'mobile_money' ? 'mobilemoneyghana,mobilemoneyfranco,mobilemoneyuganda,mobilemoneyzambia,qr,mobilemoneyrwanda,account,mobilemoneytanzania,mobilemoneymalawi,barter,mobilemoneymozambique,card,banktransfer,ach,credit' : 'card',
      customer: {
        email: user.email,
        phone_number: phoneNumber || user.phone || '',
        name: user.name,
      },
      customizations: {
        title: 'iWanyu Payment',
        description: `Payment for order #${order.id}`,
        logo: 'https://iwanyu.rw/logo.png',
      },
      meta: {
        order_id: order.id,
        user_id: user.id,
      },
    };

    // Make request to Flutterwave
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flutterwaveData),
    });

    const flutterwaveResult = await flutterwaveResponse.json();

    if (flutterwaveResult.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment initialization failed', details: flutterwaveResult.message },
        { status: 400 }
      );
    }

    // Update order with payment reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: flutterwaveResult.data.tx_ref,
      },
    });

    // Clear cart after successful order creation
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        totalAmount,
        status: order.status,
      },
      payment: {
        paymentUrl: flutterwaveResult.data.link,
        reference: flutterwaveResult.data.tx_ref,
        amount: totalAmount / 100,
        currency: 'RWF',
      },
    });

  } catch (error: any) {
    console.error('Payment initialization error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
