// Simple Brevo Service for email functionality
// This is a placeholder service that can be extended with actual Brevo integration

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
}

class BrevoService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
  }

  /**
   * Send a simple email (placeholder implementation)
   */
  async sendEmail(
    to: EmailRecipient | EmailRecipient[],
    template: EmailTemplate,
    from?: EmailRecipient
  ): Promise<any> {
    try {
      // For now, just log the email instead of actually sending
      console.log('📧 Email would be sent:', {
        to,
        subject: template.subject,
        from: from || { email: 'noreply@iwanyustore.com', name: 'Iwanyu Store' }
      });
      
      return { success: true, messageId: 'mock-message-id' };
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user: { email: string; name: string }) {
    const template: EmailTemplate = {
      subject: 'Welcome to Iwanyu Store! 🎉',
      htmlContent: `
        <h1>Welcome ${user.name}!</h1>
        <p>Thank you for joining Iwanyu Store. We're excited to have you!</p>
      `,
      textContent: `Welcome ${user.name}! Thank you for joining Iwanyu Store.`
    };

    return this.sendEmail({ email: user.email, name: user.name }, template);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(orderData: any, userContact: { email: string; name: string }) {
    const template: EmailTemplate = {
      subject: `Order Confirmation #${orderData.id} - Iwanyu Store`,
      htmlContent: `
        <h1>Order Confirmed! 🎉</h1>
        <p>Hi ${userContact.name},</p>
        <p>Your order #${orderData.id} has been confirmed.</p>
        <p>Total: ${orderData.totalAmount} RWF</p>
      `,
      textContent: `Order #${orderData.id} confirmed. Total: ${orderData.totalAmount} RWF`
    };

    return this.sendEmail(userContact, template);
  }

  /**
   * Send seller approval email
   */
  async sendSellerApprovalEmail(sellerData: any, userContact: { email: string; name: string }) {
    const template: EmailTemplate = {
      subject: 'Seller Application Approved - Iwanyu Store',
      htmlContent: `
        <h1>Congratulations! 🎉</h1>
        <p>Your seller application has been approved.</p>
        <p>You can now start selling on Iwanyu Store.</p>
      `,
      textContent: 'Your seller application has been approved!'
    };

    return this.sendEmail(userContact, template);
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccessNotification(paymentData: any, userContact: { email: string; name: string }) {
    const template: EmailTemplate = {
      subject: 'Payment Successful - Iwanyu Store',
      htmlContent: `
        <h1>Payment Successful! ✅</h1>
        <p>Your payment of ${paymentData.amount} ${paymentData.currency} has been processed.</p>
      `,
      textContent: `Payment successful: ${paymentData.amount} ${paymentData.currency}`
    };

    return this.sendEmail(userContact, template);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const template: EmailTemplate = {
      subject: 'Reset Your Password - Iwanyu Store',
      htmlContent: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
      `,
      textContent: `Reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    };

    return this.sendEmail({ email }, template);
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedNotification(orderData: any, userContact: { email: string; name: string }) {
    const template: EmailTemplate = {
      subject: `Order #${orderData.id} Shipped - Iwanyu Store`,
      htmlContent: `
        <h1>Your Order is on the Way! 📦</h1>
        <p>Order #${orderData.id} has been shipped.</p>
      `,
      textContent: `Order #${orderData.id} has been shipped.`
    };

    return this.sendEmail(userContact, template);
  }

  /**
   * Send seller payout notification
   */
  async sendSellerPayoutNotification(payoutData: any, sellerContact: { email: string; name: string }) {
    const template: EmailTemplate = {
      subject: 'Payout Processed - Iwanyu Store',
      htmlContent: `
        <h1>Payout Processed! 💰</h1>
        <p>Your payout of ${payoutData.amount} RWF has been processed.</p>
      `,
      textContent: `Payout processed: ${payoutData.amount} RWF`
    };

    return this.sendEmail(sellerContact, template);
  }

  /**
   * Send cart abandonment email
   */
  async sendCartAbandonmentEmail(cartData: any, userContact: { email: string; name: string }) {
    const template: EmailTemplate = {
      subject: 'Complete Your Purchase - Iwanyu Store',
      htmlContent: `
        <h1>Don't Forget Your Items! 🛒</h1>
        <p>Hi ${userContact.name},</p>
        <p>You have items waiting in your cart. Complete your purchase now!</p>
      `,
      textContent: `Complete your purchase at Iwanyu Store!`
    };

    return this.sendEmail(userContact, template);
  }
}

// Export singleton instance
const brevoService = new BrevoService();
export default brevoService; 