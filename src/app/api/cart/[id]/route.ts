import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSessionFromRequest } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { quantity } = body;
    
    if (!quantity || quantity < 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }
    
    // Find the cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: {
        cart: true,
        product: true,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    if (cartItem.cart.userId !== session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }
    
    // Update quantity or remove if quantity is 0
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: params.id },
      });
      
      return NextResponse.json({ message: 'Item removed from cart' });
    } else {
      await prisma.cartItem.update({
        where: { id: params.id },
        data: { quantity },
      });
      
      return NextResponse.json({ message: 'Cart item updated' });
    }
  } catch (error: any) {
    console.error('Cart item update error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    if (cartItem.cart.userId !== session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await prisma.cartItem.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('Cart item deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
