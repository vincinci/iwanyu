# CSV Import with Product Variants Guide

## Overview

The CSV import feature now supports importing products with variants (sizes, colors, etc.) using the Shopify CSV format. This allows you to create products with multiple variations from a single CSV file.

## Shopify CSV Format for Variants

### Required Columns

- **Handle**: Unique product identifier (same for all variants of a product)
- **Title**: Product name (only required on first row per product)
- **Variant Price**: Price for this specific variant
- **Status**: Product status (active, draft, archived)

### Variant Option Columns

- **Option1 Name**: First variant type (e.g., "Size", "Color")
- **Option1 Value**: First variant value (e.g., "Large", "Red")
- **Option2 Name**: Second variant type (optional)
- **Option2 Value**: Second variant value (optional)
- **Option3 Name**: Third variant type (optional)
- **Option3 Value**: Third variant value (optional)

### Additional Variant Columns

- **Variant Inventory Qty**: Stock quantity for this variant
- **Variant SKU**: Unique SKU for this variant
- **Variant Image**: Specific image URL for this variant
- **Variant Compare At Price**: Original price (for sale pricing)

## Example CSV Structure

```csv
Handle,Title,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Variant SKU,Variant Inventory Qty,Variant Price
cotton-tshirt,Cotton T-Shirt,Size,Small,Color,Red,TSHIRT-S-RED,10,25000
cotton-tshirt,,,Size,Medium,Color,Red,TSHIRT-M-RED,15,25000
cotton-tshirt,,,Size,Large,Color,Red,TSHIRT-L-RED,12,25000
cotton-tshirt,,,Size,Small,Color,Blue,TSHIRT-S-BLUE,8,25000
cotton-tshirt,,,Size,Medium,Color,Blue,TSHIRT-M-BLUE,10,25000
cotton-tshirt,,,Size,Large,Color,Blue,TSHIRT-L-BLUE,15,25000
```

## How Variants Are Processed

### 1. Product Grouping
- All rows with the same **Handle** are grouped together
- The first row contains the main product information
- Subsequent rows contain variant-specific data

### 2. Variant Creation
- Each row creates variants based on Option1, Option2, and Option3 columns
- If a row has `Option1 Name: "Size"` and `Option1 Value: "Large"`, it creates a Size variant with value "Large"
- Multiple option columns can create multiple variants per row

### 3. Variant Properties
- **Price**: Uses `Variant Price` if specified, otherwise inherits product base price
- **Stock**: Uses `Variant Inventory Qty` for individual variant stock
- **SKU**: Uses `Variant SKU` for unique identification
- **Image**: Uses `Variant Image` for variant-specific images

### 4. Duplicate Handling
- Variants with the same name+value combination are automatically deduplicated
- Only unique variants are created per product

## Features

### ✅ Supported Variant Types
- **Size**: XS, S, M, L, XL, XXL, etc.
- **Color**: Red, Blue, Green, Black, White, etc.
- **Material**: Cotton, Polyester, Leather, etc.
- **Style**: Classic, Modern, Vintage, etc.
- **Capacity**: 32GB, 64GB, 128GB, etc.
- **Custom**: Any custom variant type and values

### ✅ Variant Features
- Individual pricing per variant
- Individual stock levels per variant
- Unique SKUs per variant
- Variant-specific images
- Multiple variant types per product (Size + Color)
- Automatic variant deduplication

### ✅ Import Results
- Detailed import summary with variant counts
- Warnings for skipped/invalid variants
- Error reporting for failed variant creation
- Success confirmation with variant details

## Frontend Display

### Product Detail Page
- **Variant Selection**: Interactive buttons/swatches for each variant type
- **Color Swatches**: Visual color selection for color variants
- **Size Buttons**: Standard button selection for size variants
- **Price Updates**: Dynamic price changes based on selected variants
- **Stock Display**: Real-time stock levels per variant combination
- **Validation**: Ensures all required variants are selected before purchase

### Admin Product List
- **Variant Count**: Shows number of variants per product
- **Variant Summary**: Displays variant types and values
- **Stock Breakdown**: Shows stock levels per variant
- **Quick Overview**: Compact variant information in product listings

## Best Practices

### 1. CSV Structure
- Use consistent handles for product grouping
- Fill complete product info only in the first row
- Leave empty cells for repeated product information
- Use clear, descriptive variant names and values

### 2. Variant Naming
- Use standard names: "Size", "Color", "Material", etc.
- Use consistent values: "Small", "Medium", "Large" vs "S", "M", "L"
- Avoid special characters in variant names/values

### 3. Pricing Strategy
- Set base price in the main product row
- Use variant-specific pricing only when necessary
- Consider using "Compare At Price" for sale pricing

### 4. Stock Management
- Set realistic stock levels per variant
- Consider total stock vs. variant stock distribution
- Monitor low-stock variants separately

### 5. Images
- Provide main product image in `Image Src`
- Use `Variant Image` for variant-specific views
- Maintain consistent image quality and dimensions

## Error Handling

### Common Issues
- **Missing Handle**: Each row must have a valid handle
- **Invalid Variant Data**: Variant name and value must be present
- **Duplicate Variants**: Same name+value combinations are automatically merged
- **Invalid Prices**: Non-numeric prices are rejected
- **HTML Content**: HTML tags in handles/titles are filtered out

### Troubleshooting
1. **Check CSV Format**: Ensure proper column headers and data structure
2. **Validate Handles**: Make sure handles are consistent across variant rows
3. **Review Warnings**: Check import results for non-critical issues
4. **Test Small Batches**: Import a few products first to validate format

## Advanced Examples

### Multi-Option Variants
```csv
Handle,Title,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Option3 Name,Option3 Value,Variant Price
smartphone,Smartphone Pro,Storage,128GB,Color,Black,Condition,New,799000
smartphone,,Storage,256GB,Color,Black,Condition,New,899000
smartphone,,Storage,128GB,Color,White,Condition,New,799000
```

### Variable Pricing
```csv
Handle,Title,Option1 Name,Option1 Value,Variant Price,Variant Compare At Price,Variant Inventory Qty
laptop,Gaming Laptop,RAM,8GB,1200000,1400000,10
laptop,,RAM,16GB,1500000,1700000,5
laptop,,RAM,32GB,2000000,2300000,2
```

## Migration from Simple Products

If you have existing simple products and want to add variants:

1. **Export Current Products**: Use the existing export functionality
2. **Add Variant Columns**: Add Option1 Name, Option1 Value, etc.
3. **Duplicate Rows**: Create multiple rows for each variant
4. **Re-import**: Use the CSV import with variant support

## API Integration

The CSV import creates products with full variant support that integrates with:

- **Product Detail Pages**: Automatic variant selection UI
- **Shopping Cart**: Variant-aware cart items
- **Order Management**: Variant tracking in orders
- **Inventory Management**: Individual variant stock tracking
- **Admin Dashboard**: Variant overview and management

## Support

For issues with variant imports:

1. Check the import results for detailed error messages
2. Validate your CSV format against the examples
3. Test with a small subset of products first
4. Review the browser console for detailed error information
5. Ensure all required columns are present and properly formatted

## Future Enhancements

### Planned Features
- **Variant Images Upload**: Direct file upload for variant images
- **Bulk Variant Operations**: Mass update variant pricing/stock
- **Variant Templates**: Pre-defined variant configurations
- **Advanced Variant Rules**: Complex variant combinations and dependencies
- **Variant Analytics**: Performance tracking per variant 