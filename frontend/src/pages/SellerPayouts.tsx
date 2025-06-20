import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Wallet } from 'lucide-react';

const SellerPayouts: React.FC = () => {
  const error = await response.json();
  useEffect(() => {
    // Redirect to wallet page since payouts are handled there
    const timer = setTimeout(() => {
      navigate('/seller/wallet');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Wallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payouts</h2>
        <p className="text-gray-600 mb-6">
          Payout management is now part of your wallet. You'll be redirected to your wallet page.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/seller/wallet')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Wallet size={16} />
            Go to Wallet
          </button>
          
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <p className="text-xs text-gray-400">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerPayouts; 