# Product Variants Feature Guide

## Overview

The Product Variants feature allows sellers to create different variations of their products (e.g., different sizes, colors, materials, etc.) with individual pricing, stock levels, and SKUs.

## Features

### 1. **Variant Types**
- **Size**: XS, S, M, L, XL, XXL
- **Color**: Red, Blue, Green, Black, White, Yellow
- **Material**: Cotton, Polyester, Leather, Silk, Wool
- **Style**: Classic, Modern, Vintage, Casual, Formal
- **Capacity**: 32GB, 64GB, 128GB, 256GB, 512GB
- **Custom**: Create your own variant types and values

### 2. **Multiple Product Images**
- **Upload Limit**: Up to 5 images per product
- **File Support**: JPG, PNG, GIF, WebP (max 5MB each)
- **Upload Methods**: Drag & drop, file selection, or URL input
- **Main Image**: First image becomes the primary product image
- **Preview**: Real-time preview with ability to remove individual images

### 3. **Variant Properties**
Each variant can have:
- **Name**: The type of variant (e.g., "Size", "Color")
- **Value**: The specific value (e.g., "Large", "Red")
- **Price**: Individual price (optional, defaults to base product price)
- **Stock**: Individual stock quantity
- **SKU**: Unique identifier for the variant (optional)
- **Image**: Specific image for the variant (optional)

## How to Use

### Adding Variants to a Product

1. **Navigate to Add Product Page**
   - Go to `/seller/products/add` or click "Add Product" from seller dashboard

2. **Fill Basic Product Information**
   - Product name, description, category, base price, etc.

3. **Add Product Images** (Up to 5 images)
   - Upload multiple images by drag & drop or file selection
   - Or add image URLs one by one
   - First image becomes the main product image
   - Additional images provide different product views

4. **Add Variants Section**
   - Scroll to the "Product Variants" section
   - Click "Add Variant" button

5. **Configure Variant**
   - **Select Variant Type**: Choose from predefined types or select "Custom"
   - **Select/Enter Value**: Choose from predefined values or enter custom value
   - **Set Price**: Leave empty to use base price, or set specific price
   - **Set Stock**: Required - specify stock quantity for this variant
   - **Add SKU**: Optional unique identifier
   - **Add Image**: Optional specific image URL for this variant

6. **Save Variant**
   - Click "Add Variant" to save
   - Repeat for additional variants

### Managing Existing Variants

- **Edit Variant**: Modify price, stock, SKU, or image directly in the variant card
- **Remove Variant**: Click the "X" button on any variant card
- **Reorder**: Variants are automatically ordered by creation sequence

## Backend Implementation

### Database Schema

```sql
model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  name        String   -- Variant type (e.g., "Size", "Color")
  value       String   -- Variant value (e.g., "Large", "Red")
  price       Float?   -- Optional override price
  stock       Int      @default(0)
  sku         String?  -- Optional SKU
  image       String?  -- Optional variant image
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([productId, name, value])
}
```

### API Endpoints

#### Create Product with Variants
```http
POST /api/seller/products
Content-Type: multipart/form-data

{
  "name": "Sample T-Shirt",
  "description": "A comfortable cotton t-shirt",
  "price": 2500,
  "categoryId": "category-id",
  "stock": 50,
  "variants": [
    {
      "name": "Size",
      "value": "Small",
      "price": 2500,
      "stock": 10,
      "sku": "TSHIRT-S"
    },
    {
      "name": "Size", 
      "value": "Medium",
      "price": 2500,
      "stock": 15,
      "sku": "TSHIRT-M"
    },
    {
      "name": "Size",
      "value": "Large", 
      "price": 2700,
      "stock": 20,
      "sku": "TSHIRT-L"
    }
  ]
}
```

#### Get Products with Variants
```http
GET /api/seller/products
```

Response includes variants:
```json
{
  "id": "product-id",
  "name": "Sample T-Shirt",
  "price": 2500,
  "variants": [
    {
      "id": "variant-id",
      "name": "Size",
      "value": "Small",
      "price": 2500,
      "stock": 10,
      "sku": "TSHIRT-S",
      "sortOrder": 0
    }
  ]
}
```

## Frontend Implementation

### Components

#### ProductVariants Component
- **Location**: `frontend/src/components/ProductVariants.tsx`
- **Props**:
  - `variants`: Array of current variants
  - `onChange`: Callback when variants change
  - `basePrice`: Base product price for reference

#### Integration in AddProduct
```tsx
<ProductVariants
  variants={formData.variants || []}
  onChange={handleVariantsChange}
  basePrice={formData.price}
/>
```

### State Management

```tsx
const [formData, setFormData] = useState<ProductData>({
  // ... other fields
  variants: [],
});

const handleVariantsChange = (variants: ProductData['variants']) => {
  setFormData(prev => ({
    ...prev,
    variants: variants || [],
  }));
};
```

## Usage Examples

### Example 1: Clothing with Sizes and Colors

```json
{
  "name": "Cotton T-Shirt",
  "variants": [
    {"name": "Size", "value": "Small", "stock": 10},
    {"name": "Size", "value": "Medium", "stock": 15},
    {"name": "Size", "value": "Large", "stock": 12},
    {"name": "Color", "value": "Red", "stock": 8},
    {"name": "Color", "value": "Blue", "stock": 10},
    {"name": "Color", "value": "Black", "stock": 15}
  ]
}
```

### Example 2: Electronics with Storage Capacity

```json
{
  "name": "Smartphone",
  "variants": [
    {"name": "Capacity", "value": "128GB", "price": 45000, "stock": 5},
    {"name": "Capacity", "value": "256GB", "price": 55000, "stock": 3},
    {"name": "Capacity", "value": "512GB", "price": 65000, "stock": 2}
  ]
}
```

### Example 3: Custom Variants

```json
{
  "name": "Custom Mug",
  "variants": [
    {"name": "Material", "value": "Ceramic", "stock": 20},
    {"name": "Material", "value": "Stainless Steel", "price": 3500, "stock": 10},
    {"name": "Design", "value": "Plain", "stock": 15},
    {"name": "Design", "value": "Logo Print", "price": 2800, "stock": 8}
  ]
}
```

## Best Practices

### 1. **Variant Naming**
- Use consistent naming conventions
- Keep variant names short and descriptive
- Use title case for better readability

### 2. **Pricing Strategy**
- Set base price for the most common variant
- Use variant-specific pricing for premium options
- Leave price empty to inherit base price

### 3. **Stock Management**
- Set realistic stock levels for each variant
- Monitor variant stock separately from base product
- Update stock levels regularly

### 4. **SKU Management**
- Use consistent SKU patterns
- Include variant identifier in SKU (e.g., PROD-SIZE-COLOR)
- Keep SKUs unique across all variants

### 5. **Images**
- Provide variant-specific images when possible
- Use high-quality images for better conversion
- Maintain consistent image dimensions

## Validation Rules

- **Variant Name**: Required, cannot be empty
- **Variant Value**: Required, cannot be empty
- **Stock**: Required, must be >= 0
- **Price**: Optional, must be > 0 if provided
- **SKU**: Optional, must be unique if provided
- **Unique Constraint**: Each product cannot have duplicate name+value combinations

## Error Handling

### Common Errors
- **"Invalid variants format"**: Check JSON structure
- **"Variant name and value required"**: Ensure both fields are filled
- **"Duplicate variant"**: Same name+value combination already exists
- **"Invalid stock quantity"**: Stock must be a positive number

### Troubleshooting
1. Check browser console for detailed error messages
2. Verify all required fields are filled
3. Ensure variant combinations are unique
4. Check network connectivity for API calls

## Future Enhancements

### Planned Features
- **Variant Images Upload**: File upload for variant-specific images
- **Bulk Variant Import**: CSV import for multiple variants
- **Variant Templates**: Pre-defined variant sets for common products
- **Variant Analytics**: Track performance by variant
- **Variant Combinations**: Support for multiple variant types per product (e.g., Size + Color)

### API Extensions
- **Variant Search**: Filter products by specific variants
- **Variant Inventory**: Advanced stock management
- **Variant Pricing Rules**: Dynamic pricing based on variant combinations

## Support

For issues or questions regarding the Product Variants feature:

1. Check this documentation first
2. Review the browser console for error messages
3. Test with simple variant configurations
4. Verify backend API responses
5. Check database schema and migrations

## Technical Notes

### Database Considerations
- Variants are automatically deleted when parent product is deleted (CASCADE)
- Unique constraint prevents duplicate variant combinations
- Soft delete not implemented for variants (hard delete only)

### Performance
- Variants are loaded with products by default
- Consider pagination for products with many variants
- Index on productId for efficient queries

### Security
- Variant creation requires seller authentication
- Variants inherit product-level permissions
- No additional authorization required for variant operations 