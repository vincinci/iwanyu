import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../services/walletApi';
import { formatPrice } from '../utils/currency';

interface WithdrawFormProps {
  availableBalance: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ 
  availableBalance, 
  onSuccess, 
  onCancel 
}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'MOBILE_MONEY'>('BANK_TRANSFER');
  const [accountDetails, setAccountDetails] = useState({
    // Bank transfer fields
    account_bank: '',
    account_number: '',
    account_name: '',
    // Mobile money fields
    network: '',
    phone_number: ''
  });
  const [narration, setNarration] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: walletApi.withdraw,
    onSuccess: (data) => {
      // Refresh wallet data
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payout-history'] });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setAmount('');
      setAccountDetails({
        account_bank: '',
        account_number: '',
        account_name: '',
        network: '',
        phone_number: ''
      });
      setNarration('');
      setErrors({});
      
      alert(`Withdrawal initiated successfully! Reference: ${data.data.reference}`);
    },
    onError: (error: any) => {
      console.error('Withdrawal error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to process withdrawal';
      setErrors({ general: errorMessage });
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (!amount || isNaN(withdrawAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (withdrawAmount < 1000) {
      newErrors.amount = 'Minimum withdrawal is RWF 1,000';
    } else if (withdrawAmount > availableBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    }

    // Validate account details based on method
    if (method === 'BANK_TRANSFER') {
      if (!accountDetails.account_bank) {
        newErrors.account_bank = 'Please select a bank';
      }
      if (!accountDetails.account_number) {
        newErrors.account_number = 'Please enter account number';
      }
      if (!accountDetails.account_name) {
        newErrors.account_name = 'Please enter account holder name';
      }
    } else if (method === 'MOBILE_MONEY') {
      if (!accountDetails.network) {
        newErrors.network = 'Please select mobile network';
      }
      if (!accountDetails.phone_number) {
        newErrors.phone_number = 'Please enter phone number';
      }
      if (!accountDetails.account_name) {
        newErrors.account_name = 'Please enter account holder name';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const withdrawalData = {
      amount: parseFloat(amount),
      method,
      accountDetails: method === 'BANK_TRANSFER' 
        ? {
            account_bank: accountDetails.account_bank,
            account_number: accountDetails.account_number,
            account_name: accountDetails.account_name
          }
        : {
            network: accountDetails.network,
            phone_number: accountDetails.phone_number,
            account_name: accountDetails.account_name
          },
      narration: narration || undefined
    };

    await withdrawMutation.mutateAsync(withdrawalData);
  };

  const rwandanBanks = [
    { code: '011', name: 'Bank of Kigali' },
    { code: '002', name: 'Banque Populaire du Rwanda' },
    { code: '003', name: 'I&M Bank Rwanda' },
    { code: '004', name: 'GT Bank Rwanda' },
    { code: '005', name: 'Access Bank Rwanda' },
    { code: '006', name: 'Urwego Opportunity Bank' },
    { code: '007', name: 'Development Bank of Rwanda' },
    { code: '008', name: 'KCB Bank Rwanda' },
    { code: '009', name: 'Cogebanque' },
    { code: '010', name: 'Equity Bank Rwanda' }
  ];

  const mobileNetworks = [
    { code: 'MTN', name: 'MTN Mobile Money' },
    { code: 'AIRTEL', name: 'Airtel Money' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Withdraw Funds</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            Available Balance: <span className="font-bold">{formatPrice(availableBalance)}</span>
          </p>
        </div>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{errors.general}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount (RWF)
          </label>
          <div className="relative">
            <input
              id="withdraw-amount"
              name="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              min="1000"
              max={availableBalance}
            />
            <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Minimum: RWF 1,000 • Maximum: {formatPrice(availableBalance)}
          </p>
        </div>

        {/* Withdrawal Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Withdrawal Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod('BANK_TRANSFER')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'BANK_TRANSFER'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium">Bank Transfer</span>
              <p className="text-xs text-gray-500 mt-1">1-3 business days</p>
            </button>
            
            <button
              type="button"
              onClick={() => setMethod('MOBILE_MONEY')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method === 'MOBILE_MONEY'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium">Mobile Money</span>
              <p className="text-xs text-gray-500 mt-1">5-30 minutes</p>
            </button>
          </div>
        </div>

        {/* Account Details */}
        {method === 'BANK_TRANSFER' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Bank Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank
              </label>
              <select
                id="withdraw-bank"
                name="bank"
                value={accountDetails.account_bank}
                onChange={(e) => setAccountDetails({ ...accountDetails, account_bank: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.account_bank ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Bank</option>
                {rwandanBanks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              {errors.account_bank && (
                <p className="mt-1 text-sm text-red-600">{errors.account_bank}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                id="withdraw-account-number"
                name="accountNumber"
                type="text"
                value={accountDetails.account_number}
                onChange={(e) => setAccountDetails({ ...accountDetails, account_number: e.target.value })}
                placeholder="Enter account number"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.account_number ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.account_number && (
                <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountDetails.account_name}
                onChange={(e) => setAccountDetails({ ...accountDetails, account_name: e.target.value })}
                placeholder="Enter account holder name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.account_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.account_name && (
                <p className="mt-1 text-sm text-red-600">{errors.account_name}</p>
              )}
            </div>
          </div>
        )}

        {method === 'MOBILE_MONEY' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Mobile Money Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Network
              </label>
              <select
                value={accountDetails.network}
                onChange={(e) => setAccountDetails({ ...accountDetails, network: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.network ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Network</option>
                {mobileNetworks.map((network) => (
                  <option key={network.code} value={network.code}>
                    {network.name}
                  </option>
                ))}
              </select>
              {errors.network && (
                <p className="mt-1 text-sm text-red-600">{errors.network}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={accountDetails.phone_number}
                onChange={(e) => setAccountDetails({ ...accountDetails, phone_number: e.target.value })}
                placeholder="e.g., 0788888888"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.phone_number ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountDetails.account_name}
                onChange={(e) => setAccountDetails({ ...accountDetails, account_name: e.target.value })}
                placeholder="Enter account holder name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.account_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.account_name && (
                <p className="mt-1 text-sm text-red-600">{errors.account_name}</p>
              )}
            </div>
          </div>
        )}

        {/* Narration (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (Optional)
          </label>
          <input
            type="text"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="Add a note for this withdrawal"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">
            {narration.length}/100 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={withdrawMutation.isPending}
            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Withdraw Funds'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default WithdrawForm; 