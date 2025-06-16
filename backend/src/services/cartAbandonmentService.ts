import prisma from '../utils/db';
import brevoService from './brevoService';

interface CartAbandonmentData {
  userId: string;
  email: string;
  name: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalAmount: number;
  checkoutUrl: string;
}

class CartAbandonmentService {
  private abandonmentTimers = new Map<string, NodeJS.Timeout>();
  private readonly ABANDONMENT_DELAY = 30 * 60 * 1000; // 30 minutes
  private readonly REMINDER_DELAY = 24 * 60 * 60 * 1000; // 24 hours for second reminder

  /**
   * Track cart activity and schedule abandonment email
   */
  async trackCartActivity(userId: string) {
    // Clear existing timer if user is active
    this.clearAbandonmentTimer(userId);

    // Set new timer for abandonment email
    const timer = setTimeout(async () => {
      await this.sendAbandonmentEmail(userId);
    }, this.ABANDONMENT_DELAY);

    this.abandonmentTimers.set(userId, timer);
    console.log(`🛒 Cart abandonment timer set for user ${userId} (30 minutes)`);
  }

  /**
   * Clear abandonment timer (when user completes purchase or empties cart)
   */
  clearAbandonmentTimer(userId: string) {
    const existingTimer = this.abandonmentTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.abandonmentTimers.delete(userId);
      console.log(`✅ Cart abandonment timer cleared for user ${userId}`);
    }
  }

  /**
   * Send cart abandonment email
   */
  private async sendAbandonmentEmail(userId: string) {
    try {
      // Get user's current cart items
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true
            }
          },
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              name: true
            }
          }
        }
      });

      if (cartItems.length === 0) {
        console.log(`No cart items found for user ${userId}, skipping abandonment email`);
        return;
      }

      // Check if user has already received abandonment email recently
      const recentAbandonmentEmail = await this.checkRecentAbandonmentEmail(userId);
      if (recentAbandonmentEmail) {
        console.log(`User ${userId} already received abandonment email recently, skipping`);
        return;
      }

      const user = cartItems[0].user;
      if (!user || !user.email) {
        console.log(`No user email found for user ${userId}, skipping abandonment email`);
        return;
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      // Prepare cart data for email
      const cartData: CartAbandonmentData = {
        userId,
        email: user.email,
        name: user.name || user.firstName || 'Valued Customer',
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || undefined
        })),
        totalAmount,
        checkoutUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`
      };

      // Send abandonment email
      await brevoService.sendCartAbandonmentEmail(cartData, {
        email: user.email,
        name: cartData.name
      });

      // Log the abandonment email
      await this.logAbandonmentEmail(userId);

      console.log(`✅ Cart abandonment email sent to ${user.email} for ${cartItems.length} items worth ${totalAmount} RWF`);

      // Schedule reminder email for 24 hours later
      setTimeout(async () => {
        await this.sendReminderEmail(userId);
      }, this.REMINDER_DELAY);

    } catch (error) {
      console.error(`❌ Failed to send cart abandonment email for user ${userId}:`, error);
    }
  }

  /**
   * Send reminder email (second abandonment email)
   */
  private async sendReminderEmail(userId: string) {
    try {
      // Check if cart still has items and user hasn't purchased
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
          user: true
        }
      });

      if (cartItems.length === 0) {
        console.log(`No cart items found for reminder email, user ${userId} may have completed purchase`);
        return;
      }

      // Check if user made any orders in the last 24 hours
      const recentOrder = await prisma.order.findFirst({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (recentOrder) {
        console.log(`User ${userId} made a recent order, skipping reminder email`);
        return;
      }

      // Send reminder with different subject line
      const user = cartItems[0].user;
      const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      const cartData = {
        userId,
        customerName: user.name || user.firstName || 'Valued Customer',
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        totalAmount,
        checkoutUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`
      };

      // Modify template for reminder
      const reminderTemplate = brevoService.getEmailTemplates().cartAbandonment(cartData);
      reminderTemplate.subject = `Last chance! Your cart expires soon - Iwanyu Store`;

      await brevoService.sendEmail({ email: user.email, name: cartData.customerName }, reminderTemplate);

      console.log(`✅ Cart abandonment reminder email sent to ${user.email}`);

    } catch (error) {
      console.error(`❌ Failed to send cart abandonment reminder for user ${userId}:`, error);
    }
  }

  /**
   * Check if user received abandonment email recently (within 24 hours)
   */
  private async checkRecentAbandonmentEmail(userId: string): Promise<boolean> {
    try {
      // You could store this in database, for now using simple time-based check
      // In production, consider adding a cart_abandonment_emails table
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'CART_ABANDONMENT',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
          }
        }
      });

      return !!recentNotification;
    } catch (error) {
      console.error('Error checking recent abandonment email:', error);
      return false;
    }
  }

  /**
   * Log abandonment email in notifications
   */
  private async logAbandonmentEmail(userId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'CART_ABANDONMENT',
          title: 'Cart Abandonment Email Sent',
          message: 'Cart abandonment email was sent to remind about items in cart',
          isRead: true // Mark as read since it's a system notification
        }
      });
    } catch (error) {
      console.error('Error logging abandonment email:', error);
    }
  }

  /**
   * Handle cart item addition (restart abandonment timer)
   */
  async onCartItemAdded(userId: string) {
    console.log(`🛒 Item added to cart for user ${userId}`);
    this.trackCartActivity(userId);
  }

  /**
   * Handle cart item removal
   */
  async onCartItemRemoved(userId: string) {
    console.log(`🗑️ Item removed from cart for user ${userId}`);
    
    // Check if cart is now empty
    const remainingItems = await prisma.cartItem.count({
      where: { userId }
    });

    if (remainingItems === 0) {
      // Cart is empty, clear abandonment timer
      this.clearAbandonmentTimer(userId);
      console.log(`Cart is now empty for user ${userId}, abandonment timer cleared`);
    } else {
      // Still has items, restart timer
      this.trackCartActivity(userId);
    }
  }

  /**
   * Handle cart item update (quantity change)
   */
  async onCartItemUpdated(userId: string) {
    console.log(`📝 Cart item updated for user ${userId}`);
    this.trackCartActivity(userId);
  }

  /**
   * Handle order completion (clear abandonment timer)
   */
  async onOrderCompleted(userId: string) {
    console.log(`✅ Order completed for user ${userId}`);
    this.clearAbandonmentTimer(userId);
  }

  /**
   * Handle user logout (pause abandonment timer)
   */
  async onUserLogout(userId: string) {
    console.log(`👋 User ${userId} logged out`);
    // Don't clear timer completely, just pause it
    // Timer will resume when user logs back in and has items in cart
  }

  /**
   * Handle user login (resume abandonment tracking if cart has items)
   */
  async onUserLogin(userId: string) {
    console.log(`👋 User ${userId} logged in`);
    
    const cartItems = await prisma.cartItem.count({
      where: { userId }
    });

    if (cartItems > 0) {
      console.log(`User ${userId} has ${cartItems} items in cart, starting abandonment tracking`);
      this.trackCartActivity(userId);
    }
  }

  /**
   * Get abandonment statistics
   */
  async getAbandonmentStats() {
    try {
      const totalAbandonmentEmails = await prisma.notification.count({
        where: {
          type: 'CART_ABANDONMENT',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      const activeTimers = this.abandonmentTimers.size;

      return {
        totalAbandonmentEmailsLast30Days: totalAbandonmentEmails,
        activeAbandonmentTimers: activeTimers,
        averageCartValue: 0, // Could be calculated from cart data
        recoveryRate: 0 // Could be calculated by tracking conversions
      };
    } catch (error) {
      console.error('Error getting abandonment stats:', error);
      return null;
    }
  }
}

export default new CartAbandonmentService(); 