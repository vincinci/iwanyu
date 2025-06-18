import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { sellerApi } from '../services/sellerApi';

interface ProductImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ProductImport: React.FC<ProductImportProps> = ({ onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
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
      const response = await sellerApi.importProducts(selectedFile);
      setResults(response.results);
      
      if (response.results.successful > 0) {
        onSuccess();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content safely to avoid JSX parsing issues
    const headers = 'Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Option3 Name,Option3 Value,Variant SKU,Variant Grams,Variant Inventory Tracker,Variant Inventory Qty,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Image Position,Image Alt Text,Gift Card,SEO Title,SEO Description,Google Shopping / Google Product Category,Google Shopping / Gender,Google Shopping / Age Group,Google Shopping / MPN,Google Shopping / Condition,Google Shopping / Custom Product,Variant Image,Variant Weight Unit,Variant Tax Code,Cost per item,Included / United States,Price / United States,Compare At Price / United States,Included / International,Price / International,Compare At Price / International,Status';
    
    const sampleRow1 = [
      'wireless-headphones',
      'Premium Wireless Headphones',
      '"<p>High-quality noise-canceling wireless headphones with 30-hour battery life</p>"',
      'TechPro',
      '"Electronics ' + String.fromCharCode(62) + ' Audio ' + String.fromCharCode(62) + ' Headphones"',
      'Headphones',
      '"Wireless, Audio"',
      'TRUE',
      'Color',
      'Black',
      '', '', '', '', // empty option fields
      'HEADPHONES-001',
      '145',
      '',
      '50',
      'deny',
      'manual',
      '199.99',
      '149.99',
      'TRUE',
      'TRUE',
      '',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      '1',
      'Premium Wireless Headphones',
      'FALSE',
      'Premium Wireless Headphones | Your Store',
      'High-quality wireless headphones',
      '165',
      'unisex',
      'adult',
      'HEADPHONES-001',
      'new',
      'TRUE',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'g',
      '', '', // empty fields
      'TRUE',
      '199.99',
      '149.99',
      'TRUE',
      '199.99',
      '149.99',
      'active'
    ].join(',');
    
    const csvContent = headers + '\n' + sampleRow1;
    
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Import Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!results && (
            <>
              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Import Instructions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Shopify CSV Format Requirements:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Handle</strong>: Unique product identifier (URL slug)</li>
                    <li>• <strong>Title</strong> (required): Product name/title</li>
                    <li>• <strong>Body (HTML)</strong>: Product description (HTML allowed)</li>
                    <li>• <strong>Vendor</strong>: Brand or manufacturer name</li>
                    <li>• <strong>Product Category</strong>: Category path (e.g. "Electronics &gt; Audio &gt; Headphones")</li>
                    <li>• <strong>Variant Price</strong> (required): Product price</li>
                    <li>• <strong>Variant Compare At Price</strong>: Original price (for sales)</li>
                    <li>• <strong>Variant Inventory Qty</strong>: Stock quantity</li>
                    <li>• <strong>Variant SKU</strong>: Stock keeping unit</li>
                    <li>• <strong>Image Src</strong>: Product image URL</li>
                    <li>• <strong>Status</strong>: active, draft, or archived</li>
                    <li>• <strong>Published</strong>: TRUE or FALSE</li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-100 rounded text-xs text-blue-700">
                    <strong>Note:</strong> Multiple rows with the same Handle represent product variants. 
                    Only the first row needs complete product info; subsequent rows can have just variant-specific data.
                  </div>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Shopify CSV Template
                </button>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-gray-400">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Import Complete</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                  <div className="text-sm text-green-800">Products Imported</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-red-800">Failed Imports</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Import Errors:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm text-gray-700 mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          {!results && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
            </>
          )}
          {results && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProductImport; 