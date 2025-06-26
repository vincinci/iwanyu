import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Attribute {
  name: string;
  values: string[];
}

interface VariantCombination {
  options: string[];
  price: number;
  stock: number;
  sku: string;
  images: string[];
}

interface ShopifyVariantsProps {
  value: VariantCombination[];
  onChange: (variants: VariantCombination[]) => void;
  basePrice: number;
  initialAttributes?: Attribute[];
}

const defaultAttributes = [
  { name: 'Size', values: ['38', '39', '40', '41', '42', '43', '44', '45', '46', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { name: 'Color', values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'] },
];

function cartesianProduct(arr: string[][]): string[][] {
  return arr.reduce<string[][]>(
    (a, b) => a.flatMap(d => b.map(e => [...d, e])),
    [[]]
  );
}

const ShopifyVariants: React.FC<ShopifyVariantsProps> = ({ value, onChange, basePrice, initialAttributes }) => {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes || []);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [editingAttr, setEditingAttr] = useState<number | null>(null);

  // Add attribute
  const addAttribute = () => {
    if (newAttrName.trim() && !attributes.some(a => a.name === newAttrName.trim())) {
      setAttributes([...attributes, { name: newAttrName.trim(), values: [] }]);
      setNewAttrName('');
    }
  };

  // Add value to attribute
  const addValue = (attrIdx: number) => {
    if (newAttrValue.trim() && !attributes[attrIdx].values.includes(newAttrValue.trim())) {
      const updated = [...attributes];
      updated[attrIdx].values.push(newAttrValue.trim());
      setAttributes(updated);
      setNewAttrValue('');
    }
  };

  // Remove attribute
  const removeAttribute = (idx: number) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  // Remove value from attribute
  const removeValue = (attrIdx: number, valIdx: number) => {
    const updated = [...attributes];
    updated[attrIdx].values.splice(valIdx, 1);
    setAttributes(updated);
  };

  // Generate all combinations
  const combinations = attributes.length > 0 && attributes.every(a => a.values.length > 0)
    ? cartesianProduct(attributes.map(a => a.values))
    : [];

  // Sync combinations with editable data
  React.useEffect(() => {
    if (combinations.length === 0) {
      onChange([]);
      return;
    }
    // Keep existing data if possible
    const newVariants: VariantCombination[] = combinations.map(options => {
      const existing = value.find(v => JSON.stringify(v.options) === JSON.stringify(options));
      return existing || {
        options,
        price: basePrice,
        stock: 0,
        sku: '',
        images: []
      };
    });
    onChange(newVariants);
    // eslint-disable-next-line
  }, [JSON.stringify(combinations)]);

  // Update a variant
  const updateVariant = (idx: number, field: keyof VariantCombination, val: string | number | string[]) => {
    const updated = value.map((v, i) => i === idx ? { ...v, [field]: val } : v);
    onChange(updated);
  };

  // Use initialAttributes to initialize state, and sync if editing
  React.useEffect(() => {
    if (initialAttributes) setAttributes(initialAttributes);
  }, [JSON.stringify(initialAttributes)]);

  return (
    <div className="space-y-6 border-2 border-orange-200 bg-orange-50 rounded-lg p-4 relative">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          Product Options
          {attributes.length === 0 && (
            <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full animate-pulse">Add options to create variants</span>
          )}
        </h3>
        <div className="flex flex-wrap gap-4 mb-4">
          {attributes.map((attr, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-800">{attr.name}</span>
                <button type="button" className="text-red-500 hover:text-red-700" onClick={() => removeAttribute(idx)}><X className="h-4 w-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {attr.values.map((val, vIdx) => (
                  <span key={vIdx} className="inline-flex items-center bg-white border border-gray-300 rounded px-2 py-1 text-xs">
                    {val}
                    <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => removeValue(idx, vIdx)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              {editingAttr === idx ? (
                <div className="flex gap-2 mt-2">
                  <input
                    className="border rounded px-2 py-1 text-sm"
                    value={newAttrValue}
                    onChange={e => setNewAttrValue(e.target.value)}
                    placeholder={`Add ${attr.name} value`}
                  />
                  <button type="button" className="text-green-600" onClick={() => { addValue(idx); setEditingAttr(null); }}><Plus className="h-4 w-4" /></button>
                  <button type="button" className="text-gray-400" onClick={() => setEditingAttr(null)}><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <button type="button" className="text-blue-600 text-xs mt-1" onClick={() => setEditingAttr(idx)}>+ Add value</button>
              )}
            </div>
          ))}
          {/* Add Option input always visible */}
          <div className="flex items-center gap-2 mt-2">
            <input
              className="border rounded px-2 py-1 text-sm"
              value={newAttrName}
              onChange={e => setNewAttrName(e.target.value)}
              placeholder="Add option (e.g. Size)"
            />
            <button type="button" className="text-green-600" onClick={addAttribute}><Plus className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
      {combinations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {attributes.map(attr => (
                  <th key={attr.name} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{attr.name}</th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {value.map((variant, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {variant.options.map((opt, oIdx) => (
                    <td key={oIdx} className="px-3 py-2 text-sm">{opt}</td>
                  ))}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-32 px-3 py-2 border-gray-200 rounded-md text-sm"
                      value={variant.price}
                      onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-32 px-3 py-2 border-gray-200 rounded-md text-sm"
                      value={variant.stock}
                      onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-40 px-3 py-2 border-gray-200 rounded-md text-sm"
                      value={variant.sku}
                      onChange={e => updateVariant(idx, 'sku', e.target.value)}
                      placeholder="SKU"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {variant.images && variant.images.length > 0 && variant.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="relative group">
                            <img src={img} alt="Preview" className="w-14 h-14 object-cover rounded border" />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-0.5 text-xs text-red-600 opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                const updatedImages = variant.images.filter((_, i) => i !== imgIdx);
                                updateVariant(idx, 'images', updatedImages);
                              }}
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => {
                          const files = Array.from(e.target.files || []);
                          const urls = files.map(file => URL.createObjectURL(file));
                          updateVariant(idx, 'images', [...(variant.images || []), ...urls]);
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        const updated = value.filter((_, i) => i !== idx);
                        onChange(updated);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Sticky Add Option button for mobile */}
      {attributes.length === 0 && (
        <button
          type="button"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-8 py-3 rounded-full bg-orange-600 text-white font-bold text-lg shadow-lg md:hidden animate-bounce"
          onClick={addAttribute}
        >
          <Plus className="h-6 w-6 mr-2 inline" /> Add Option
        </button>
      )}
    </div>
  );
};

export default ShopifyVariants; 