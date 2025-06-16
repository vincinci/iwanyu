// Remove flutterwave-node-v3 dependency and use direct HTTP calls
// @ts-ignore - flutterwave-node-v3 doesn't have TypeScript declarations
// import Flutterwave from 'flutterwave-node-v3';

// Initialize Flutterwave - no longer needed since we're using direct API calls
// const flw = new Flutterwave(
//   process.env.FLUTTERWAVE_PUBLIC_KEY!,
//   process.env.FLUTTERWAVE_SECRET_KEY!
// );

export interface PaymentInitiationData {
  tx_ref: string;
  amount: number;
  currency: string;
  email: string;
  phone_number?: string;
  name: string;
  title?: string;
  description?: string;
  logo?: string;
  redirect_url: string;
  meta?: Record<string, any>;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
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
    card?: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      token: string;
      expiry: string;
    };
  };
}

export interface TransferData {
  account_bank: string;
  account_number: string;
  amount: number;
  currency: string;
  beneficiary_name: string;
  narration?: string;
  reference?: string;
  debit_currency?: string;
  callback_url?: string;
  meta?: Record<string, any>;
}

export interface MobileMoneyTransferData extends TransferData {
  meta?: {
    sender?: string;
    sender_country?: string;
    mobile_number?: string;
    recipient_address?: string;
    [key: string]: any; // Allow additional properties
  };
}

export interface TransferResponse {
  status: string;
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: string;
    currency: string;
    debit_currency?: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta: any;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: number;
    bank_name: string;
  };
}

export interface BankDetails {
  id: string;
  code: string;
  name: string;
}

export interface AccountVerification {
  status: string;
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
}

class FlutterwaveService {
  /**
   * Initialize a payment
   */
  async initiatePayment(paymentData: PaymentInitiationData) {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      // Use Flutterwave Standard/Hosted checkout which is more reliable
      const payload = {
        tx_ref: paymentData.tx_ref,
        amount: paymentData.amount,
        currency: paymentData.currency,
        redirect_url: paymentData.redirect_url,
        customer: {
          email: paymentData.email,
          phonenumber: paymentData.phone_number,
          name: paymentData.name
        },
        customizations: paymentData.customizations || {
          title: "eCommerce Payment",
          description: "Payment for your order",
          logo: ""
        },
        meta: paymentData.meta || {}
      };

      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json() as any;
      
      if (result.status === 'success') {
        return {
          status: 'success',
          message: 'Payment initialized successfully',
          data: {
            link: result.data.link,
            tx_ref: paymentData.tx_ref
          }
        };
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Flutterwave payment initialization error:', error);
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json() as VerifyPaymentResponse;
      return result;
    } catch (error) {
      console.error('Flutterwave payment verification error:', error);
      throw error;
    }
  }

  /**
   * Initialize a transfer to a bank account
   */
  async initiateTransfer(transferData: TransferData): Promise<TransferResponse> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch('https://api.flutterwave.com/v3/transfers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferData)
      });

      const result = await response.json() as TransferResponse;
      return result;
    } catch (error) {
      console.error('Flutterwave transfer error:', error);
      throw error;
    }
  }

  /**
   * Initialize a mobile money transfer
   */
  async initiateMobileMoneyTransfer(transferData: MobileMoneyTransferData): Promise<TransferResponse> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch('https://api.flutterwave.com/v3/transfers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferData)
      });

      const result = await response.json() as TransferResponse;
      return result;
    } catch (error) {
      console.error('Flutterwave mobile money transfer error:', error);
      throw error;
    }
  }

  /**
   * Get the status of a transfer
   */
  async getTransferStatus(transferId: string): Promise<any> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transfers/${transferId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Flutterwave transfer status error:', error);
      throw error;
    }
  }

  /**
   * Get transfer fee for a specific amount and destination
   */
  async getTransferFee(amount: number, currency: string, type: 'account' | 'mobilemoney' | 'barter' = 'account'): Promise<any> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transfers/fee?amount=${amount}&currency=${currency}&type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Flutterwave transfer fee error:', error);
      throw error;
    }
  }

  /**
   * Get list of banks for a specific country
   */
  async getBanks(country: string): Promise<{ status: string; message: string; data: BankDetails[] }> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/banks/${country}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json() as { status: string; message: string; data: BankDetails[] };
      return result;
    } catch (error) {
      console.error('Flutterwave banks error:', error);
      throw error;
    }
  }

  /**
   * Verify a bank account
   */
  async verifyBankAccount(accountNumber: string, accountBank: string): Promise<AccountVerification> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_number: accountNumber,
          account_bank: accountBank
        })
      });

      const result = await response.json() as AccountVerification;
      return result;
    } catch (error) {
      console.error('Flutterwave bank account verification error:', error);
      throw error;
    }
  }

  /**
   * Get exchange rates for currency conversion
   */
  async getTransferRates(amount: number, sourceCurrency: string, destinationCurrency: string): Promise<any> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transfers/rates?amount=${amount}&source_currency=${sourceCurrency}&destination_currency=${destinationCurrency}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Flutterwave transfer rates error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    if (!process.env.FLUTTERWAVE_SECRET_HASH) {
      console.warn('FLUTTERWAVE_SECRET_HASH not configured. Cannot verify webhook signature.');
      return false;
    }

    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_HASH)
        .update(payload, 'utf8')
        .digest('hex');
      
      return expectedSignature === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Process a refund for a transaction
   */
  async processRefund(transactionId: string): Promise<any> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Flutterwave refund error:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(transactionId: string): Promise<any> {
    if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave credentials not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables.');
    }

    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Flutterwave get transaction error:', error);
      throw error;
    }
  }

  /**
   * Generate payment reference
   */
  generatePaymentReference(prefix: string = 'FLW'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Get supported mobile money networks for a country
   */
  getMobileMoneyNetworks(country: string): { [key: string]: string[] } {
    const networks: { [key: string]: string[] } = {
      'RW': ['MTN', 'AIRTEL'], // Rwanda
      'UG': ['MTN', 'AIRTEL'], // Uganda
      'TZ': ['AIRTEL', 'HALOPESA', 'TIGO', 'VODACOM'], // Tanzania
      'KE': ['MPS'], // Kenya (M-Pesa)
      'GH': ['AIRTELTIGO', 'MTN', 'VODAFONE'], // Ghana
      'CM': ['MTN', 'ORANGEMONEY'], // Cameroon
      'CI': ['MOOV', 'MTN', 'ORANGE', 'WAVE'], // Cote d'Ivoire
      'SN': ['ORANGEMONEY', 'WAVE'], // Senegal
      'ET': ['AMOLEMONEY'] // Ethiopia
    };

    return { [country]: networks[country] || [] };
  }
}

export default new FlutterwaveService(); 