import prisma from '../utils/db';
import brevoService from './brevoService';

interface EmailTrigger {
  type: string;
  delay?: number;
  conditions?: any;
  template: string;
}

interface EmailWorkflow {
  name: string;
  triggers: EmailTrigger[];
  isActive: boolean;
}

class EmailAutomationService {
  private workflows: Map<string, EmailWorkflow> = new Map();
  private scheduledEmails: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeWorkflows();
  }

  private initializeWorkflows() {
    // Welcome Series (like Amazon)
    this.workflows.set('welcome-series', {
      name: 'Welcome Email Series',
      triggers: [
        { type: 'user-registered', delay: 0, template: 'welcome' },
        { type: 'user-registered', delay: 24 * 60 * 60 * 1000, template: 'welcome-day2' },
        { type: 'user-registered', delay: 7 * 24 * 60 * 60 * 1000, template: 'welcome-week1' }
      ],
      isActive: true
    });

    // Order Journey (like AliExpress)
    this.workflows.set('order-journey', {
      name: 'Complete Order Journey',
      triggers: [
        { type: 'order-placed', delay: 0, template: 'order-confirmation' },
        { type: 'order-placed', delay: 2 * 60 * 60 * 1000, template: 'order-processing' },
        { type: 'order-shipped', delay: 0, template: 'order-shipped' },
        { type: 'order-delivered', delay: 0, template: 'order-delivered' },
        { type: 'order-delivered', delay: 3 * 24 * 60 * 60 * 1000, template: 'review-request' }
      ],
      isActive: true
    });

    // Cart Abandonment Series
    this.workflows.set('cart-abandonment', {
      name: 'Cart Abandonment Recovery',
      triggers: [
        { type: 'cart-abandoned', delay: 30 * 60 * 1000, template: 'cart-abandonment-1' },
        { type: 'cart-abandoned', delay: 24 * 60 * 60 * 1000, template: 'cart-abandonment-2' },
        { type: 'cart-abandoned', delay: 3 * 24 * 60 * 60 * 1000, template: 'cart-abandonment-final' }
      ],
      isActive: true
    });

    // Browse Abandonment (like Amazon recommendations)
    this.workflows.set('browse-abandonment', {
      name: 'Browse Abandonment Recovery',
      triggers: [
        { type: 'browse-abandoned', delay: 2 * 60 * 60 * 1000, template: 'browse-abandonment' },
        { type: 'browse-abandoned', delay: 24 * 60 * 60 * 1000, template: 'personalized-recommendations' }
      ],
      isActive: true
    });

    // Win-back Campaign
    this.workflows.set('win-back', {
      name: 'Win-back Inactive Users',
      triggers: [
        { type: 'user-inactive-30days', delay: 0, template: 'win-back-30' },
        { type: 'user-inactive-60days', delay: 0, template: 'win-back-60' },
        { type: 'user-inactive-90days', delay: 0, template: 'win-back-final' }
      ],
      isActive: true
    });

    // Price Drop Alerts (like Amazon)
    this.workflows.set('price-alerts', {
      name: 'Price Drop Notifications',
      triggers: [
        { type: 'price-drop', delay: 0, template: 'price-drop-alert' },
        { type: 'back-in-stock', delay: 0, template: 'back-in-stock' }
      ],
      isActive: true
    });
  }

  /**
   * Trigger email workflow
   */
  async triggerWorkflow(workflowName: string, triggerType: string, userData: any, additionalData?: any) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow || !workflow.isActive) return;

    const triggers = workflow.triggers.filter(t => t.type === triggerType);
    
    for (const trigger of triggers) {
      const emailId = `${userData.userId || userData.email}-${workflowName}-${triggerType}-${Date.now()}`;
      
      if (trigger.delay && trigger.delay > 0) {
        // Schedule email
        const timeout = setTimeout(async () => {
          await this.sendWorkflowEmail(trigger.template, userData, additionalData);
          this.scheduledEmails.delete(emailId);
        }, trigger.delay);
        
        this.scheduledEmails.set(emailId, timeout);
        console.log(`📅 Scheduled ${trigger.template} email for ${userData.email} in ${trigger.delay}ms`);
      } else {
        // Send immediately
        await this.sendWorkflowEmail(trigger.template, userData, additionalData);
      }
    }
  }

  /**
   * Send workflow email based on template
   */
  private async sendWorkflowEmail(template: string, userData: any, additionalData?: any) {
    try {
      const userContact = {
        email: userData.email,
        name: userData.name || userData.firstName || 'Valued Customer'
      };

      switch (template) {
        case 'welcome':
          await brevoService.sendWelcomeEmail(userContact);
          break;

        case 'welcome-day2':
          await this.sendWelcomeDay2Email(userContact);
          break;

        case 'welcome-week1':
          await this.sendWelcomeWeek1Email(userContact);
          break;

        case 'order-confirmation':
          await brevoService.sendOrderConfirmation(additionalData, userContact);
          break;

        case 'order-processing':
          await this.sendOrderProcessingEmail(additionalData, userContact);
          break;

        case 'order-shipped':
          await this.sendOrderShippedEmail(additionalData, userContact);
          break;

        case 'order-delivered':
          await this.sendOrderDeliveredEmail(additionalData, userContact);
          break;

        case 'review-request':
          await this.sendReviewRequestEmail(additionalData, userContact);
          break;

        case 'cart-abandonment-1':
          await brevoService.sendCartAbandonmentEmail(additionalData, userContact);
          break;

        case 'cart-abandonment-2':
        case 'cart-abandonment-final':
          await brevoService.sendCartAbandonmentEmail(additionalData, userContact);
          break;

        case 'browse-abandonment':
        case 'personalized-recommendations':
        case 'win-back-30':
        case 'win-back-60':
        case 'win-back-final':
        case 'price-drop-alert':
        case 'back-in-stock':
          // Use basic welcome email for now - can be enhanced later
          await brevoService.sendWelcomeEmail(userContact);
          break;

        default:
          console.warn(`Unknown email template: ${template}`);
      }

      console.log(`✅ Sent ${template} email to ${userContact.email}`);
    } catch (error) {
      console.error(`❌ Failed to send ${template} email:`, error);
    }
  }

  /**
   * Welcome Day 2 Email
   */
  private async sendWelcomeDay2Email(userContact: any) {
    const template = {
      subject: 'Discover Amazing Deals - Iwanyu Store',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #f97316;">Iwanyu Store</h2>
          </div>
          <h1 style="color: #f97316; text-align: center;">Welcome back, ${userContact.name}! 🎉</h1>
          <p>We're excited to have you as part of the Iwanyu Store family!</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🔥 Today's Hot Deals</h3>
            <div style="display: grid; gap: 15px;">
              <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px;">
                <h4 style="margin: 0; color: #f97316;">Electronics - Up to 50% OFF</h4>
                <p style="margin: 5px 0; color: #6b7280;">Latest smartphones, laptops, and gadgets</p>
              </div>
              <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px;">
                <h4 style="margin: 0; color: #f97316;">Fashion - Buy 2 Get 1 FREE</h4>
                <p style="margin: 5px 0; color: #6b7280;">Trendy clothing and accessories</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">Shop Now</a>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">💡 Pro Tips for Shopping</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Add items to wishlist to track price drops</li>
              <li>Enable notifications for exclusive deals</li>
              <li>Follow your favorite sellers for updates</li>
            </ul>
          </div>
        </div>
      `,
      textContent: `Welcome back to Iwanyu Store! Check out today's hot deals and start shopping.`
    };

    return brevoService.sendEmail(userContact, template);
  }

  /**
   * Welcome Week 1 Email
   */
  private async sendWelcomeWeek1Email(userContact: any) {
    const template = {
      subject: 'Your First Week at Iwanyu Store - Special Offer Inside! 🎁',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #f97316;">Iwanyu Store</h2>
          </div>
          <h1 style="color: #f97316; text-align: center;">It's been a week, ${userContact.name}! 🎉</h1>
          <p>We hope you're enjoying exploring Iwanyu Store. As a thank you for joining us, here's a special gift!</p>
          
          <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 28px;">15% OFF</h2>
            <p style="color: white; margin: 10px 0; font-size: 18px;">Your First Order</p>
            <div style="background: white; color: #f97316; padding: 10px 20px; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 20px; margin: 10px 0;">
              WELCOME15
            </div>
            <p style="color: white; margin: 0; font-size: 14px;">Valid for 7 days • Minimum order 20,000 RWF</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">Start Shopping</a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🌟 Why Choose Iwanyu Store?</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li>✅ Free shipping on orders over 20,000 RWF</li>
              <li>✅ 30-day hassle-free returns</li>
              <li>✅ 24/7 customer support</li>
              <li>✅ Secure payment options</li>
              <li>✅ Fast delivery across Rwanda</li>
            </ul>
          </div>
        </div>
      `,
      textContent: `It's been a week at Iwanyu Store! Use code WELCOME15 for 15% off your first order.`
    };

    return brevoService.sendEmail(userContact, template);
  }

  /**
   * Order Processing Email
   */
  private async sendOrderProcessingEmail(orderData: any, userContact: any) {
    const template = {
      subject: `Your Order #${orderData.id} is Being Prepared - Iwanyu Store`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #f97316;">Iwanyu Store</h2>
          </div>
          <h1 style="color: #f97316; text-align: center;">Great News! Your Order is Being Prepared 📦</h1>
          <p>Hi ${userContact.name},</p>
          <p>We're working hard to get your order ready for shipment. Here's what's happening:</p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">📋 Order Status: Processing</h3>
            <p style="color: #1e40af; margin: 0;">Order #${orderData.id} • Placed on ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📦 What's Next?</h3>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <div style="width: 20px; height: 20px; background: #10b981; border-radius: 50%; margin-right: 15px;"></div>
              <span style="color: #6b7280;">Order Confirmed ✅</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <div style="width: 20px; height: 20px; background: #f97316; border-radius: 50%; margin-right: 15px;"></div>
              <span style="color: #1f2937; font-weight: bold;">Processing 🔄</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <div style="width: 20px; height: 20px; background: #e5e7eb; border-radius: 50%; margin-right: 15px;"></div>
              <span style="color: #9ca3af;">Shipped 🚚</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0;">
              <div style="width: 20px; height: 20px; background: #e5e7eb; border-radius: 50%; margin-right: 15px;"></div>
              <span style="color: #9ca3af;">Delivered 📍</span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderData.id}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Order</a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Expected processing time: 1-2 business days. You'll receive another email once your order ships.
          </p>
        </div>
      `,
      textContent: `Your order #${orderData.id} is being processed. Track your order at ${process.env.FRONTEND_URL}/orders/${orderData.id}`
    };

    return brevoService.sendEmail(userContact, template);
  }

  /**
   * Order Shipped Email
   */
  private async sendOrderShippedEmail(orderData: any, userContact: any) {
    const template = {
      subject: `Your Order #${orderData.id} Has Shipped! 🚚 - Iwanyu Store`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #f97316;">Iwanyu Store</h2>
          </div>
          <h1 style="color: #f97316; text-align: center;">Your Order is On Its Way! 🚚</h1>
          <p>Hi ${userContact.name},</p>
          <p>Exciting news! Your order has been shipped and is on its way to you.</p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">📦 Shipped Successfully</h3>
            <p style="color: #059669; margin: 5px 0;">Order #${orderData.id}</p>
            <p style="color: #059669; margin: 5px 0;">Tracking: ${orderData.trackingNumber || 'TRK' + Date.now()}</p>
            <p style="color: #059669; margin: 0;">Estimated delivery: 2-3 business days</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderData.id}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">Track Package</a>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📱 Stay Updated</h3>
            <p style="color: #92400e; margin: 0;">You'll receive SMS updates about your delivery. Make sure someone is available to receive your package.</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📞 Need Help?</h3>
            <p style="color: #4b5563; margin: 0;">Contact our support team at <a href="mailto:support@iwanyustore.com" style="color: #f97316;">support@iwanyustore.com</a> or call us at +250 123 456 789</p>
          </div>
        </div>
      `,
      textContent: `Your order #${orderData.id} has shipped! Track it at ${process.env.FRONTEND_URL}/orders/${orderData.id}`
    };

    return brevoService.sendEmail(userContact, template);
  }

  /**
   * Order Delivered Email
   */
  private async sendOrderDeliveredEmail(orderData: any, userContact: any) {
    const template = {
      subject: `Order #${orderData.id} Delivered! How was your experience? ⭐ - Iwanyu Store`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #f97316;">Iwanyu Store</h2>
          </div>
          <h1 style="color: #f97316; text-align: center;">Your Order Has Been Delivered! 🎉</h1>
          <p>Hi ${userContact.name},</p>
          <p>Great news! Your order has been successfully delivered. We hope you love your new items!</p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #059669; margin-top: 0;">✅ Delivered Successfully</h3>
            <p style="color: #059669; margin: 5px 0;">Order #${orderData.id}</p>
            <p style="color: #059669; margin: 0;">Delivered on ${new Date().toLocaleDateString()}</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📦 Package Not Received?</h3>
            <p style="color: #92400e; margin: 0;">If you haven't received your package, please contact us immediately at <a href="mailto:support@iwanyustore.com" style="color: #f97316;">support@iwanyustore.com</a></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderData.id}" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">View Order Details</a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">💝 Thank You for Shopping With Us!</h3>
            <p style="color: #4b5563;">We appreciate your business and hope you're completely satisfied with your purchase.</p>
            <p style="color: #4b5563; margin: 0;">Don't forget to check out our latest deals and new arrivals!</p>
          </div>
        </div>
      `,
      textContent: `Your order #${orderData.id} has been delivered! View details at ${process.env.FRONTEND_URL}/orders/${orderData.id}`
    };

    return brevoService.sendEmail(userContact, template);
  }

  /**
   * Review Request Email
   */
  private async sendReviewRequestEmail(orderData: any, userContact: any) {
    const template = {
      subject: `How was your recent purchase? Share your review! ⭐ - Iwanyu Store`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #f97316;">Iwanyu Store</h2>
          </div>
          <h1 style="color: #f97316; text-align: center;">How was your experience? ⭐</h1>
          <p>Hi ${userContact.name},</p>
          <p>We hope you're enjoying your recent purchase from Iwanyu Store! Your feedback helps us improve and helps other customers make informed decisions.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📝 Share Your Experience</h3>
            <p style="color: #4b5563;">Order #${orderData.id} • Delivered ${new Date().toLocaleDateString()}</p>
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 24px; margin: 10px 0;">⭐⭐⭐⭐⭐</div>
              <p style="color: #6b7280; margin: 0;">Rate your experience</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderData.id}/review" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">Write a Review</a>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">🎁 Review Reward</h3>
            <p style="color: #92400e; margin: 0;">Leave a review and get 5% off your next order! Coupon code will be sent after review submission.</p>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">❓ Need Help?</h3>
            <p style="color: #1e40af; margin: 0;">If you're not completely satisfied with your purchase, please contact our support team at <a href="mailto:support@iwanyustore.com" style="color: #f97316;">support@iwanyustore.com</a></p>
          </div>
        </div>
      `,
      textContent: `How was your recent purchase? Share your review for order #${orderData.id} at ${process.env.FRONTEND_URL}/orders/${orderData.id}/review`
    };

    return brevoService.sendEmail(userContact, template);
  }

  /**
   * Cancel scheduled email
   */
  cancelScheduledEmail(emailId: string) {
    const timeout = this.scheduledEmails.get(emailId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledEmails.delete(emailId);
      console.log(`❌ Cancelled scheduled email: ${emailId}`);
    }
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStats() {
    return {
      activeWorkflows: Array.from(this.workflows.values()).filter(w => w.isActive).length,
      totalWorkflows: this.workflows.size,
      scheduledEmails: this.scheduledEmails.size,
      workflows: Array.from(this.workflows.entries()).map(([key, workflow]) => ({
        key,
        name: workflow.name,
        isActive: workflow.isActive,
        triggerCount: workflow.triggers.length
      }))
    };
  }
}

export default new EmailAutomationService(); 