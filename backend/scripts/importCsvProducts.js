const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper function to convert CSV to array of objects
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const product = {};
    headers.forEach((header, index) => {
      product[header] = values[index] || '';
    });
    
    products.push(product);
  }
  
  return products;
}

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Helper function to strip HTML tags
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Helper function to get category from Product Category field
function mapCategory(productCategory) {
  const categoryMap = {
    'Apparel & Accessories > Shoes > Sneakers': 'sneakers',
    'Apparel & Accessories > Shoes': 'shoes',
    'Apparel & Accessories > Clothing > Clothing Tops > T-Shirts': 'tshirts',
    'Apparel & Accessories > Clothing > Clothing Tops > Shirts': 'shirts',
    'Apparel & Accessories > Clothing': 'clothing',
    'Apparel & Accessories': 'fashion',
    'Electronics > Computers': 'laptops',
    'Electronics': 'electronics'
  };
  
  // Find the most specific match
  for (const [key, value] of Object.entries(categoryMap)) {
    if (productCategory.includes(key)) {
      return value;
    }
  }
  
  return 'general';
}

async function main() {
  console.log('🧹 Clearing existing products...');
  
  // Clear existing products (this will also clear variants due to cascade)
  await prisma.product.deleteMany({});
  console.log('✅ Existing products cleared');
  
  console.log('📁 Reading CSV file...');
  const csvPath = path.join(__dirname, '../../products_export_1 (1).csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvData = parseCSV(csvContent);
  
  console.log(`📊 Found ${csvData.length} rows in CSV`);
  
  // Get seller (assuming we have one from the seed)
  const seller = await prisma.seller.findFirst({
    where: { status: 'APPROVED' }
  });
  
  if (!seller) {
    throw new Error('No approved seller found. Please run the seed script first.');
  }
  
  // Create categories map
  const categoriesMap = new Map();
  const categories = [
    { name: 'Sneakers', slug: 'sneakers', description: 'Athletic and casual sneakers' },
    { name: 'Shoes', slug: 'shoes', description: 'All types of footwear' },
    { name: 'T-Shirts', slug: 'tshirts', description: 'Casual t-shirts and tops' },
    { name: 'Shirts', slug: 'shirts', description: 'Dress shirts and formal wear' },
    { name: 'Clothing', slug: 'clothing', description: 'General clothing items' },
    { name: 'Fashion', slug: 'fashion', description: 'Fashion and accessories' },
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
    { name: 'Laptops', slug: 'laptops', description: 'Laptops and computers' },
    { name: 'General', slug: 'general', description: 'General products' }
  ];
  
  // Create categories
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    });
    categoriesMap.set(categoryData.slug, category.id);
  }
  
  console.log('✅ Categories created');
  
  // Group CSV rows by Handle (product)
  const productGroups = new Map();
  
  csvData.forEach(row => {
    const handle = row.Handle;
    if (!handle) return;
    
    if (!productGroups.has(handle)) {
      productGroups.set(handle, []);
    }
    productGroups.get(handle).push(row);
  });
  
  console.log(`📦 Processing ${productGroups.size} unique products...`);
  
  let processedCount = 0;
  
  for (const [handle, rows] of productGroups) {
    try {
      const mainRow = rows[0]; // First row has the main product data
      
      if (!mainRow.Title || !mainRow['Price / Rwanda']) {
        console.log(`⚠️ Skipping ${handle} - missing required data`);
        continue;
      }
      
      // Parse price (remove any non-numeric characters except decimal point)
      const priceStr = mainRow['Price / Rwanda'].replace(/[^\d.]/g, '');
      const price = parseFloat(priceStr) || 0;
      
      if (price === 0) {
        console.log(`⚠️ Skipping ${handle} - invalid price`);
        continue;
      }
      
      // Parse compare at price if available
      const compareAtPriceStr = mainRow['Compare At Price / Rwanda'] || '';
      const compareAtPrice = compareAtPriceStr ? parseFloat(compareAtPriceStr.replace(/[^\d.]/g, '')) : null;
      
      // Determine category
      const categorySlug = mapCategory(mainRow['Product Category'] || '');
      const categoryId = categoriesMap.get(categorySlug);
      
      // Create product
      const product = await prisma.product.create({
        data: {
          name: mainRow.Title,
          slug: createSlug(mainRow.Title),
          description: stripHtml(mainRow['Body (HTML)'] || ''),
          shortDescription: stripHtml(mainRow['Body (HTML)'] || '').substring(0, 200),
          price: Math.round(price),
          salePrice: compareAtPrice && compareAtPrice < price ? Math.round(compareAtPrice) : null,
          stock: parseInt(mainRow['Variant Inventory Qty']) || 10,
          sku: mainRow['Variant SKU'] || `SKU-${handle}`,
          brand: mainRow.Vendor || 'Unknown',
          featured: Math.random() > 0.7, // 30% chance of being featured
          categoryId: categoryId,
          sellerId: seller.id,
          images: mainRow['Image Src'] ? [mainRow['Image Src']] : [],
          tags: mainRow.Tags ? mainRow.Tags.split(',').map(tag => tag.trim()) : [],
          isActive: mainRow.Status === 'active',
          avgRating: Math.random() * 2 + 3, // Random rating 3-5
          totalReviews: Math.floor(Math.random() * 50) + 5,
          totalSales: Math.floor(Math.random() * 100) + 10,
          views: Math.floor(Math.random() * 500) + 50
        }
      });
      
      // Create variants if there are multiple rows or variant options
      const variantRows = rows.filter(row => 
        row['Option1 Value'] || row['Option2 Value'] || row['Option3 Value']
      );
      
      if (variantRows.length > 0) {
        for (const variantRow of variantRows) {
          if (!variantRow['Option1 Value'] && !variantRow['Option2 Value'] && !variantRow['Option3 Value']) {
            continue;
          }
          
          const variantPrice = variantRow['Price / Rwanda'] ? 
            parseFloat(variantRow['Price / Rwanda'].replace(/[^\d.]/g, '')) : price;
          
          let variantName = '';
          let variantValue = '';
          
          if (variantRow['Option1 Value']) {
            variantName = variantRow['Option1 Name'] || 'Size';
            variantValue = variantRow['Option1 Value'];
          } else if (variantRow['Option2 Value']) {
            variantName = variantRow['Option2 Name'] || 'Color';
            variantValue = variantRow['Option2 Value'];
          } else if (variantRow['Option3 Value']) {
            variantName = variantRow['Option3 Name'] || 'Style';
            variantValue = variantRow['Option3 Value'];
          }
          
          if (variantName && variantValue) {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                name: variantName,
                value: variantValue,
                price: Math.round(variantPrice),
                stock: parseInt(variantRow['Variant Inventory Qty']) || 5,
                image: variantRow['Variant Image'] || variantRow['Image Src'] || null,
                isActive: true,
                sortOrder: 0
              }
            });
          }
        }
      }
      
      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`📈 Processed ${processedCount} products...`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${handle}:`, error.message);
    }
  }
  
  console.log('🎉 CSV import completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`- Products processed: ${processedCount}`);
  
  // Get final counts
  const finalProductCount = await prisma.product.count();
  const finalVariantCount = await prisma.productVariant.count();
  
  console.log(`- Products in database: ${finalProductCount}`);
  console.log(`- Variants created: ${finalVariantCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 