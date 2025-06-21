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
  image: string;
}

interface ShopifyVariantsProps {
  value: VariantCombination[];
  onChange: (variants: VariantCombination[]) => void;
  basePrice: number;
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

const ShopifyVariants: React.FC<ShopifyVariantsProps> = ({ value, onChange, basePrice }) => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
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
        image: ''
      };
    });
    onChange(newVariants);
    // eslint-disable-next-line
  }, [JSON.stringify(combinations)]);

  // Update a variant
  const updateVariant = (idx: number, field: keyof VariantCombination, val: string | number) => {
    const updated = value.map((v, i) => i === idx ? { ...v, [field]: val } : v);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product Options</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          {attributes.map((attr, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
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
          <div className="flex items-center gap-2">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
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
                      className="w-full border-gray-200 rounded-md text-sm"
                      value={variant.price}
                      onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-full border-gray-200 rounded-md text-sm"
                      value={variant.stock}
                      onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border-gray-200 rounded-md text-sm"
                      value={variant.sku}
                      onChange={e => updateVariant(idx, 'sku', e.target.value)}
                      placeholder="SKU"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full border-gray-200 rounded-md text-sm"
                      value={variant.image}
                      onChange={e => updateVariant(idx, 'image', e.target.value)}
                      placeholder="Image URL"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShopifyVariants; 