import api from './api';

export interface WalletSummary {
  availableBalance: number;
  totalRevenue: number;
  totalCommission: number;
  totalPaidOut: number;
  pendingPayouts: number;
  currency: string;
  recentPayouts: Payout[];
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  payoutMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'WALLET_TRANSFER';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference: string;
  narration?: string;
  failureReason?: string;
  completedAt?: string;
  createdAt: string;
  accountDetails: unknown;
}

export interface BankDetails {
  account_bank: string;
  account_number: string;
  account_name: string;
  country: string;
}

export interface MobileMoneyDetails {
  network: string;
  phone_number: string;
  country: string;
}

export interface PayoutRequest {
  amount: number;
  payoutMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY';
  accountDetails: BankDetails | MobileMoneyDetails;
  narration?: string;
}

class WalletApi {
  // Get wallet summary with available balance and earnings
  getWalletSummary = async (): Promise<WalletSummary> => {
    try {
      const response = await api.get('/seller/wallet/summary');
      const apiData = response.data.data;
      return {
        availableBalance: apiData.balance.availableBalance,
        totalRevenue: apiData.balance.totalRevenue,
        totalCommission: 0, // No commission - sellers get full revenue
        totalPaidOut: apiData.balance.totalPaidOut,
        pendingPayouts: apiData.balance.pendingBalance,
        currency: 'RWF',
        recentPayouts: apiData.recentPayouts || []
      };
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // Return default summary if endpoint is missing
        return {
          availableBalance: 0,
          totalRevenue: 0,
          totalCommission: 0,
          totalPaidOut: 0,
          pendingPayouts: 0,
          currency: 'RWF',
          recentPayouts: []
        };
      }
      throw err;
    }
  };

  // Get payout history
  getPayoutHistory = async (page = 1, limit = 20) => {
    const response = await api.get('/seller/wallet/payouts', {
      params: { page, limit }
    });
    return response.data;
  };

  // Get specific payout details
  getPayoutDetails = async (payoutId: string): Promise<Payout> => {
    const response = await api.get(`/seller/wallet/payouts/${payoutId}`);
    return response.data.payout;
  };

  // Get available banks for a country
  getBanks = async (country: string = 'RW') => {
    const response = await api.get(`/seller/wallet/banks?country=${country}`);
    return response.data;
  };

  // Get mobile money networks for a country
  getMobileMoneyNetworks = async (country: string = 'RW') => {
    const response = await api.get(`/seller/wallet/mobile-networks?country=${country}`);
    return response.data;
  };

  // Verify bank account details
  verifyBankAccount = async (accountDetails: BankDetails) => {
    const response = await api.post('/seller/wallet/verify-bank', accountDetails);
    return response.data;
  };

  // Get transfer fee for payout
  getTransferFee = async (amount: number, currency: string = 'RWF') => {
    const response = await api.post('/seller/wallet/transfer-fee', { amount, currency });
    return response.data;
  };

  // Request bank transfer payout
  requestBankPayout = async (payoutData: {
    amount: number;
    accountDetails: BankDetails;
    narration?: string;
  }) => {
    const requestData = {
      amount: payoutData.amount,
      accountBank: payoutData.accountDetails.account_bank,
      accountNumber: payoutData.accountDetails.account_number,
      beneficiaryName: payoutData.accountDetails.account_name,
      narration: payoutData.narration
    };
    const response = await api.post('/seller/wallet/payout/bank', requestData);
    return response.data;
  };

  // Request mobile money payout
  requestMobileMoneyPayout = async (payoutData: {
    amount: number;
    accountDetails: MobileMoneyDetails;
    narration?: string;
  }) => {
    const requestData = {
      amount: payoutData.amount,
      mobileNetwork: payoutData.accountDetails.network,
      mobileNumber: payoutData.accountDetails.phone_number,
      beneficiaryName: 'Mobile Money User', // Default name for mobile money
      narration: payoutData.narration
    };
    const response = await api.post('/seller/wallet/payout/mobile-money', requestData);
    return response.data;
  };

  // Simplified withdraw method that handles both bank transfer and mobile money
  withdraw = async (withdrawalData: {
    amount: number;
    method: 'BANK_TRANSFER' | 'MOBILE_MONEY';
    accountDetails: unknown;
    narration?: string;
  }) => {
    const response = await api.post('/seller/wallet/withdraw', withdrawalData);
    return response.data;
  };
}

export const walletApi = new WalletApi(); 