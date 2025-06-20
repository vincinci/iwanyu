import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Download, 
  ArrowLeft,
  Info,
  Package,
  Users,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { adminApi } from '../../services/adminApi';

interface ImportResults {
  successful: number;
  failed: number;
  errors: string[];
  warnings?: string[];
}

const AdminCsvImport: React.FC = () => {
  const { user } = useAuth();
  const 
  const { showSuccess, showError } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
        setResults(null);
      } else {
        setError('Please select a CSV file');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const 
      setResults(response.results);
      
      if (response.results.successful > 0) {
        showSuccess(
          'Import Completed',
          `Successfully imported ${response.results.successful} products.`
        );
      }
      
      if (response.results.failed > 0) {
        showError(
          'Import Issues',
          `${response.results.failed} products failed to import. Check details below.`
        );
      }
    } catch (err) {
      setError((err as Error).message);
      showError('Import Failed', (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content matching the Shopify template format
    const headers = [
      'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
      'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
      'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 
      'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
      'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position',
      'Image Alt Text', 'Gift Card', 'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category',
      'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN', 
      'Google Shopping / Condition', 'Google Shopping / Custom Product', 'Variant Image', 
      'Variant Weight Unit', 'Variant Tax Code', 'Cost per item', 'Included / United States',
      'Price / United States', 'Compare At Price / United States', 'Included / International',
      'Price / International', 'Compare At Price / International', 'Status'
    ].join(',');

    // Sample product row
    const sampleRow = [
      'wireless-headphones',
      'Premium Wireless Headphones',
      '"<p>High-quality noise-canceling wireless headphones with 30-hour battery life and premium sound quality.</p>"',
      'TechPro',
      'Electronics > Audio > Headphones',
      'Headphones',
      '"Wireless, Audio, Electronics"',
      'TRUE',
      'Color', 'Black', 'Size', 'Standard', '', '',
      'WH-001-BLK',
      '300',
      'shopify',
      '50',
      'deny',
      'manual',
      '199.99',
      '249.99',
      'TRUE',
      'TRUE',
      '123456789',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      '1',
      'Premium Wireless Headphones in Black',
      'FALSE',
      'Premium Wireless Headphones | Your Store',
      'High-quality wireless headphones with noise canceling',
      '166', // Electronics > Audio
      'unisex',
      'adult',
      'WH-001',
      'new',
      'TRUE',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'g',
      '',
      '120.00',
      'TRUE',
      '199.99',
      '249.99',
      'TRUE',
      '199.99',
      '249.99',
      'active'
    ].join(',');

    // Second variant (white color)
    const variantRow = [
      'wireless-headphones', '', '', '', '', '', '', '',
      'Color', 'White', 'Size', 'Standard', '', '',
      'WH-001-WHT',
      '300',
      'shopify',
      '30',
      'deny',
      'manual',
      '199.99',
      '249.99',
      'TRUE',
      'TRUE',
      '123456790',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      '2',
      'Premium Wireless Headphones in White',
      '', '', '', '', '', '', '', '', '',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      'g',
      '',
      '120.00',
      '', '', '', '', '', '', ''
    ].join(',');

    const csvContent = [headers, sampleRow, variantRow].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopify-product-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CSV Product Import</h1>
              <p className="text-gray-600">
                Import products in bulk using Shopify CSV format
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Instructions Section */}
          {!results && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Instructions</h2>
              
              {/* Format Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Shopify CSV Format Requirements</h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-1">Required Fields:</h4>
                          <ul className="space-y-1 text-xs">
                            <li>• <strong>Handle</strong>: Unique product identifier</li>
                            <li>• <strong>Title</strong>: Product name</li>
                            <li>• <strong>Variant Price</strong>: Product price</li>
                            <li>• <strong>Status</strong>: active, draft, or archived</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Optional Fields:</h4>
                          <ul className="space-y-1 text-xs">
                            <li>• <strong>Body (HTML)</strong>: Product description</li>
                            <li>• <strong>Vendor</strong>: Brand/manufacturer</li>
                            <li>• <strong>Product Category</strong>: Category path</li>
                            <li>• <strong>Image Src</strong>: Product image URL</li>
                            <li>• <strong>Variant Inventory Qty</strong>: Stock quantity</li>
                            <li>• <strong>Variant Compare At Price</strong>: Original price</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 rounded text-xs">
                        <strong>Variants:</strong> Multiple rows with the same Handle represent product variants. 
                        Only the first row needs complete product info; subsequent rows need only variant-specific data.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="mb-6">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Shopify CSV Template
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Download a sample CSV file with the correct format and example data
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop your CSV file
                    </p>
                    <p className="text-xs text-gray-500">CSV files only, max 10MB</p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-gray-400">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-900">Import Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || isUploading}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import Products
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Import Results</h2>
                <button
                  onClick={resetImport}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Import Another File
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600">Successful</p>
                      <p className="text-2xl font-bold text-green-900">{results.successful}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-sm text-red-600">Failed</p>
                      <p className="text-2xl font-bold text-red-900">{results.failed}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-600">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-900">{results.warnings?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600">Total Processed</p>
                      <p className="text-2xl font-bold text-blue-900">{results.successful + results.failed}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {results.errors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Import Errors</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {results.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {results.warnings && results.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Warnings</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {results.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Next Steps</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    View imported products in Product Management
                  </button>
                  {results.failed > 0 && (
                    <p className="text-sm text-gray-600">
                      Fix the errors above and re-import the failed products
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCsvImport; 