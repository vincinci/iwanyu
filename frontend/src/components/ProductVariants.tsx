import React, { useState } from 'react';
import { Plus, X, Package, DollarSign, Hash, Tag } from 'lucide-react';
import type { ProductVariant } from '../services/sellerApi';

interface ProductVariantsProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice: number;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ variants, onChange, basePrice }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    value: '',
    price: basePrice,
    stock: 0,
    sku: '',
    image: ''
  });

  const addVariant = () => {
    if (newVariant.name.trim() && newVariant.value.trim()) {
      onChange([...variants, { ...newVariant }]);
      setNewVariant({
        name: '',
        value: '',
        price: basePrice,
        stock: 0,
        sku: '',
        image: ''
      });
      setShowAddForm(false);
    }
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onChange(updatedVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = variants.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    );
    onChange(updatedVariants);
  };

  const commonVariantTypes = [
    { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'Color', values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'] },
    { name: 'Material', values: ['Cotton', 'Polyester', 'Leather', 'Silk', 'Wool'] },
    { name: 'Style', values: ['Classic', 'Modern', 'Vintage', 'Casual', 'Formal'] },
    { name: 'Capacity', values: ['32GB', '64GB', '128GB', '256GB', '512GB'] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
          <p className="text-sm text-gray-500">
            Add different variations of your product (size, color, etc.)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Variant
        </button>
      </div>

      {/* Existing Variants */}
      {variants.length > 0 && (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {variant.name}: {variant.value}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (RWF)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder={`${basePrice}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU (Optional)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="SKU-001"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={variant.image || ''}
                    onChange={(e) => updateVariant(index, 'image', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Variant Form */}
      {showAddForm && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Variant</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant Type *
              </label>
              <select
                value={newVariant.name}
                onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value, value: '' })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="">Select variant type</option>
                {commonVariantTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
              {newVariant.name === 'custom' && (
                <input
                  type="text"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Enter custom variant type"
                />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant Value *
              </label>
              {newVariant.name && newVariant.name !== 'custom' ? (
                <select
                  value={newVariant.value}
                  onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                >
                  <option value="">Select {newVariant.name.toLowerCase()}</option>
                  {commonVariantTypes
                    .find(type => type.name === newVariant.name)
                    ?.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  <option value="custom">Custom...</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={newVariant.value}
                  onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Enter variant value"
                />
              )}
              {newVariant.value === 'custom' && (
                <input
                  type="text"
                  value={newVariant.value}
                  onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Enter custom value"
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (RWF)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={newVariant.price || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder={`${basePrice} (base price)`}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Optional)
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={newVariant.sku || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="SKU-001"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={newVariant.image || ''}
              onChange={(e) => setNewVariant({ ...newVariant, image: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              placeholder="https://example.com/variant-image.jpg"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addVariant}
              disabled={!newVariant.name.trim() || !newVariant.value.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Variant
            </button>
          </div>
        </div>
      )}

      {variants.length === 0 && !showAddForm && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No variants</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add variants to offer different options for your product.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Variant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariants; 