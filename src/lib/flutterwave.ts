import axios from 'axios';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLW_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;

export interface FlutterwaveConfig {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
}

export interface PaymentResponse {
  status: string;
  message: string;
  data?: {
    link: string;
  };
}

export interface VerificationResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
  };
}

class FlutterwaveService {
  private headers = {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  async initializePayment(config: FlutterwaveConfig): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/payments`,
        config,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Flutterwave initialization error:', error.response?.data);
      throw new Error('Payment initialization failed');
    }
  }

  async verifyPayment(transactionId: string): Promise<VerificationResponse> {
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Flutterwave verification error:', error.response?.data);
      throw new Error('Payment verification failed');
    }
  }

  async initializeMobileMoneyPayment(config: {
    tx_ref: string;
    amount: number;
    currency: string;
    email: string;
    phone_number: string;
    fullname: string;
  }): Promise<PaymentResponse> {
    try {
      const payload = {
        ...config,
        type: 'mobile_money_rwanda',
      };

      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/charges?type=mobile_money_rwanda`,
        payload,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Mobile money payment error:', error.response?.data);
      throw new Error('Mobile money payment failed');
    }
  }

  generateTxRef(): string {
    return `iwanyu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convert RWF to the smallest unit (cents)
  convertToSubunits(amount: number): number {
    return Math.round(amount * 100);
  }

  // Convert from subunits back to RWF
  convertFromSubunits(amount: number): number {
    return amount / 100;
  }
}

export const flutterwaveService = new FlutterwaveService();

// Webhook verification
export function verifyFlutterwaveWebhook(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_HASH)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

// Payment status helper
export function getPaymentStatus(flwStatus: string): 'COMPLETED' | 'FAILED' | 'PENDING' {
  switch (flwStatus?.toLowerCase()) {
    case 'successful':
      return 'COMPLETED';
    case 'failed':
    case 'cancelled':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}
