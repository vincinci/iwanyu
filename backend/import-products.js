const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Database configuration
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Category mapping based on existing categories
const categoryMapping = {
  'Apparel & Accessories > Shoes > Sneakers': 'cmbpqmg4s000350snxwmdw6dy', // Sneakers & Shoes
  'Apparel & Accessories > Clothing > Clothing Tops > T-Shirts': 'cmbpr506t00of50xmxdl0c8ou', // Fashion & Clothing
  'Apparel & Accessories > Clothing > Clothing Tops > Shirts': 'cmbpr506t00of50xmxdl0c8ou', // Fashion & Clothing
  'sports-jerseys': 'cmbpqmfba000150sn14i6miaa', // Sports Jerseys
  'laptops': 'cmbpqmfr4000250snqmulwd47', // Laptops & Computers
  'default': 'cmbpr506t00of50xmxdl0c8ou' // Fashion & Clothing as default
};

// Function to determine category ID
function getCategoryId(productCategory, type, title) {
  if (productCategory && categoryMapping[productCategory]) {
    return categoryMapping[productCategory];
  }
  
  // Smart category detection based on title/type
  const titleLower = (title || '').toLowerCase();
  
  if (titleLower.includes('balance') || titleLower.includes('jordan') || titleLower.includes('adidas') || titleLower.includes('nike') || titleLower.includes('samba')) {
    return categoryMapping['Apparel & Accessories > Shoes > Sneakers'];
  }
  
  if (titleLower.includes('t-shirt') || titleLower.includes('shirt')) {
    return categoryMapping['Apparel & Accessories > Clothing > Clothing Tops > T-Shirts'];
  }
  
  if (titleLower.includes('jersey') || titleLower.includes('chelsea') || titleLower.includes('milan') || titleLower.includes('barcelona')) {
    return categoryMapping['sports-jerseys'];
  }
  
  if (titleLower.includes('hp') || titleLower.includes('laptop') || titleLower.includes('probook')) {
    return categoryMapping['laptops'];
  }
  
  return categoryMapping['default'];
}

// Function to clean and convert price
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

// Function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Function to clean HTML from description
function cleanDescription(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .trim()
    .substring(0, 500);
}

// Main import function
async function importProducts() {
  console.log('🚀 Starting product import...');
  
  const csvPath = path.join(__dirname, 'products_export_1 (1).csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    return;
  }
  
  const products = new Map(); // Store products by handle
  let rowCount = 0;
  
  // Read and parse CSV
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        const handle = row.Handle;
        const title = row.Title;
        
        // Skip empty rows or header artifacts
        if (!handle || !title || title.includes('<') || handle.includes('<')) {
          return;
        }
        
        // Initialize product if not exists
        if (!products.has(handle)) {
          products.set(handle, {
            handle,
            title,
            description: cleanDescription(row['Body (HTML)']),
            vendor: row.Vendor || 'iwanyu.store',
            productCategory: row['Product Category'],
            type: row.Type,
            published: row.Published === 'true',
            basePrice: parsePrice(row['Variant Price']),
            comparePrice: parsePrice(row['Variant Compare At Price']),
            images: [],
            variants: [],
            seoTitle: row['SEO Title'] || title,
            seoDescription: row['SEO Description'] || cleanDescription(row['Body (HTML)']).substring(0, 160)
          });
        }
        
        const product = products.get(handle);
        
        // Add image if exists and not already added
        const imageSrc = row['Image Src'];
        if (imageSrc && !product.images.includes(imageSrc)) {
          product.images.push(imageSrc);
        }
        
        // Add variant
        const option1Value = row['Option1 Value'];
        const option2Value = row['Option2 Value'];
        const variantPrice = parsePrice(row['Variant Price']);
        const variantQty = parseInt(row['Variant Inventory Qty']) || 5;
        
        if (option1Value) {
          const variantKey = `${option1Value}-${option2Value || ''}`;
          const existingVariant = product.variants.find(v => v.key === variantKey);
          
          if (!existingVariant && variantPrice > 0) {
            product.variants.push({
              key: variantKey,
              name: row['Option1 Name'] || 'Size',
              value: option1Value,
              size: option2Value || null,
              price: variantPrice,
              stock: variantQty,
              image: row['Variant Image'] || imageSrc
            });
          }
        }
      })
      .on('end', async () => {
        console.log(`📊 Processed ${rowCount} rows, found ${products.size} unique products`);
        
        let imported = 0;
        let errors = 0;
        
        for (const [handle, productData] of products) {
          try {
            const categoryId = getCategoryId(productData.productCategory, productData.type, productData.title);
            const slug = createSlug(productData.title);
            
            // Prepare main product data
            const productCreateData = {
              name: productData.title,
              slug: `${slug}-${Date.now()}-${imported}`, // Add timestamp and counter to ensure uniqueness
              description: productData.description,
              shortDescription: productData.description.substring(0, 100),
              price: productData.basePrice,
              salePrice: productData.comparePrice && productData.comparePrice < productData.basePrice ? productData.comparePrice : null,
              image: productData.images[0] || null,
              images: productData.images.slice(0, 5), // Limit to 5 images
              stock: Math.max(productData.variants.reduce((sum, v) => sum + v.stock, 0), 10),
              sku: `IWANYU-${handle.toUpperCase()}-${imported}`,
              brand: productData.vendor,
              featured: imported < 20, // Make first 20 products featured
              status: 'active',
              isActive: productData.published,
              avgRating: 0,
              totalReviews: 0,
              totalSales: 0,
              views: 0,
              seoTitle: productData.seoTitle,
              seoDescription: productData.seoDescription,
              categoryId: categoryId,
              sellerId: null // Set to null for admin products
            };
            
            // Create the product
            const createdProduct = await prisma.product.create({
              data: productCreateData
            });
            
            // Create variants if any
            if (productData.variants.length > 0) {
              for (const variant of productData.variants.slice(0, 10)) { // Limit variants
                try {
                  await prisma.productVariant.create({
                    data: {
                      productId: createdProduct.id,
                      name: variant.name,
                      value: variant.value,
                      price: variant.price,
                      stock: variant.stock,
                      image: variant.image,
                      isActive: true,
                      sortOrder: 0
                    }
                  });
                } catch (variantError) {
                  console.log(`⚠️  Variant creation failed for ${productData.title}: ${variant.value}`);
                }
              }
            }
            
            imported++;
            console.log(`✅ Imported: ${productData.title} (${productData.variants.length} variants)`);
            
            // Add delay to prevent overwhelming the database
            if (imported % 10 === 0) {
              console.log(`📈 Progress: ${imported} products imported...`);
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
          } catch (error) {
            errors++;
            console.error(`❌ Error importing ${productData.title}:`, error.message);
          }
        }
        
        console.log(`\n🎉 Import completed!`);
        console.log(`✅ Successfully imported: ${imported} products`);
        console.log(`❌ Errors: ${errors} products`);
        
        await prisma.$disconnect();
        resolve();
      })
      .on('error', reject);
  });
}

// Run the import
if (require.main === module) {
  importProducts()
    .then(() => {
      console.log('✨ Import process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importProducts }; 