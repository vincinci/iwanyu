import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const EditProduct: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // For now, redirect to products page since edit functionality is not implemented
    const timer = setTimeout(() => {
      navigate('/seller/products');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Product</h2>
        <p className="text-gray-600 mb-6">
          Product editing functionality is coming soon. You'll be redirected to your products page.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Product ID: {id}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/seller/products')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
          
          <p className="text-xs text-gray-400">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProduct; 