import React, { useState } from 'react';
import { Plus, X, Package, DollarSign, Hash, Tag } from 'lucide-react';
import type { ProductVariant } from '../services/sellerApi';

interface ProductVariantsProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice: number;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ variants, onChange, basePrice }) => {
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    value: '',
    price: basePrice,
    stock: 0,
    sku: '',
    image: ''
  });

  const shoeSizes = ['38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const commonVariantTypes = [
    { name: 'Size', values: [...shoeSizes, 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'Color', values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'] },
    { name: 'Material', values: ['Cotton', 'Polyester', 'Leather', 'Silk', 'Wool'] },
    { name: 'Style', values: ['Classic', 'Modern', 'Vintage', 'Casual', 'Formal'] },
    { name: 'Capacity', values: ['32GB', '64GB', '128GB', '256GB', '512GB'] }
  ];

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updated = variants.map((v, i) => i === index ? { ...v, [field]: value } : v);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (newVariant.name.trim() && newVariant.value.trim()) {
      onChange([...variants, { ...newVariant }]);
      setNewVariant({ name: '', value: '', price: basePrice, stock: 0, sku: '', image: '' });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {variants.map((variant, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {/* Type */}
              <td className="px-3 py-2">
                <select
                  className="w-full border-gray-200 rounded-md text-sm"
                  value={variant.name}
                  onChange={e => handleVariantChange(idx, 'name', e.target.value)}
                >
                  <option value="">Type</option>
                  {commonVariantTypes.map(type => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                  ))}
                  <option value="custom">Custom...</option>
                </select>
              </td>
              {/* Value */}
              <td className="px-3 py-2">
                {variant.name && variant.name !== 'custom' ? (
                  <select
                    className="w-full border-gray-200 rounded-md text-sm"
                    value={variant.value}
                    onChange={e => handleVariantChange(idx, 'value', e.target.value)}
                  >
                    <option value="">Value</option>
                    {(commonVariantTypes.find(type => type.name === variant.name)?.values || []).map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                    <option value="custom">Custom...</option>
                  </select>
                ) : (
                  <input
                    className="w-full border-gray-200 rounded-md text-sm"
                    value={variant.value}
                    onChange={e => handleVariantChange(idx, 'value', e.target.value)}
                    placeholder="Value"
                  />
                )}
              </td>
              {/* Price */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  className="w-full border-gray-200 rounded-md text-sm"
                  value={variant.price || ''}
                  onChange={e => handleVariantChange(idx, 'price', parseFloat(e.target.value) || 0)}
                  placeholder={`${basePrice}`}
                  min="0"
                />
              </td>
              {/* Stock */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  className="w-full border-gray-200 rounded-md text-sm"
                  value={variant.stock || ''}
                  onChange={e => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                />
              </td>
              {/* SKU */}
              <td className="px-3 py-2">
                <input
                  className="w-full border-gray-200 rounded-md text-sm"
                  value={variant.sku || ''}
                  onChange={e => handleVariantChange(idx, 'sku', e.target.value)}
                  placeholder="SKU"
                />
              </td>
              {/* Image */}
              <td className="px-3 py-2">
                <input
                  className="w-full border-gray-200 rounded-md text-sm"
                  value={variant.image || ''}
                  onChange={e => handleVariantChange(idx, 'image', e.target.value)}
                  placeholder="Image URL"
                />
              </td>
              {/* Remove */}
              <td className="px-3 py-2 text-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove variant"
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {/* Quick-add row */}
          <tr className="bg-gray-50">
            <td className="px-3 py-2">
              <select
                className="w-full border-gray-200 rounded-md text-sm"
                value={newVariant.name}
                onChange={e => setNewVariant({ ...newVariant, name: e.target.value, value: '' })}
              >
                <option value="">Type</option>
                {commonVariantTypes.map(type => (
                  <option key={type.name} value={type.name}>{type.name}</option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </td>
            <td className="px-3 py-2">
              {newVariant.name && newVariant.name !== 'custom' ? (
                <select
                  className="w-full border-gray-200 rounded-md text-sm"
                  value={newVariant.value}
                  onChange={e => setNewVariant({ ...newVariant, value: e.target.value })}
                >
                  <option value="">Value</option>
                  {(commonVariantTypes.find(type => type.name === newVariant.name)?.values || []).map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                  <option value="custom">Custom...</option>
                </select>
              ) : (
                <input
                  className="w-full border-gray-200 rounded-md text-sm"
                  value={newVariant.value}
                  onChange={e => setNewVariant({ ...newVariant, value: e.target.value })}
                  placeholder="Value"
                />
              )}
            </td>
            <td className="px-3 py-2">
              <input
                type="number"
                className="w-full border-gray-200 rounded-md text-sm"
                value={newVariant.price || ''}
                onChange={e => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                placeholder={`${basePrice}`}
                min="0"
              />
            </td>
            <td className="px-3 py-2">
              <input
                type="number"
                className="w-full border-gray-200 rounded-md text-sm"
                value={newVariant.stock || ''}
                onChange={e => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="0"
              />
            </td>
            <td className="px-3 py-2">
              <input
                className="w-full border-gray-200 rounded-md text-sm"
                value={newVariant.sku || ''}
                onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                placeholder="SKU"
              />
            </td>
            <td className="px-3 py-2">
              <input
                className="w-full border-gray-200 rounded-md text-sm"
                value={newVariant.image || ''}
                onChange={e => setNewVariant({ ...newVariant, image: e.target.value })}
                placeholder="Image URL"
              />
            </td>
            <td className="px-3 py-2 text-center">
              <button
                type="button"
                onClick={handleAdd}
                className="text-green-600 hover:text-green-800 p-1"
                title="Add variant"
              >
                <Plus className="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductVariants; 