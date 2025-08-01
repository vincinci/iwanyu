import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const cart = await prisma.cart.findFirst({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    businessName: true,
                    businessAddress: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (!cart) {
      return NextResponse.json({
        items: [],
        total: 0,
        itemCount: 0,
      });
    }
    
    // Calculate totals
    const total = cart.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    const itemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    
    return NextResponse.json({
      items: cart.items,
      total,
      itemCount,
    });
  } catch (error: any) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { productId, quantity = 1, variant = null } = body;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }
    
    // Get session ID from request or generate one
    const sessionId = req.cookies.get('session-id')?.value || 
                     crypto.randomUUID();
    
    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { 
        OR: [
          { userId: session.id },
          { sessionId: sessionId },
        ]
      },
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { 
          userId: session.id,
          sessionId: sessionId,
        },
      });
    }
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variant,
      },
    });
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for this quantity' },
          { status: 400 }
        );
      }
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
          variant,
        },
      });
    }
    
    return NextResponse.json({ message: 'Item added to cart' });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}
