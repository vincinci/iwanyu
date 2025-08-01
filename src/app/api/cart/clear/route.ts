import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSessionFromRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    const session = await validateSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId: session.id },
    });
    
    if (!cart) {
      return NextResponse.json({ message: 'Cart is already empty' });
    }
    
    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    
    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
