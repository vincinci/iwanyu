const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper function to parse CSV
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

// Helper functions
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

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
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (productCategory.includes(key)) {
      return value;
    }
  }
  
  return 'general';
}

async function main() {
  console.log('🚀 Importing products with variants from CSV data...');
  
  // Get seller
  const seller = await prisma.seller.findFirst({ where: { status: 'APPROVED' } });
  if (!seller) throw new Error('No approved seller found');
  
  // Create categories
  const categories = [
    { name: 'Sneakers', slug: 'sneakers', description: 'Athletic and casual sneakers' },
    { name: 'T-Shirts', slug: 'tshirts', description: 'Casual t-shirts and tops' },
    { name: 'Sports', slug: 'sports', description: 'Sports jerseys and equipment' },
    { name: 'Laptops', slug: 'laptops', description: 'Laptops and computers' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home and kitchen items' }
  ];
  
  const categoryMap = new Map();
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
    categoryMap.set(cat.slug, category.id);
  }
  
  // Products with their variants
  const productsWithVariants = [
    {
      name: 'New Balance 1906R',
      slug: 'new-balance-1906r',
      description: 'The 1906R features a combination of flexible ACTEVA LITE cushioning, shock absorbing N-ergy, and segmented ABZORB SBS pods at the heel.',
      price: 37000,
      brand: 'New Balance',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/m1906rer_nb_02_i.webp?v=1746569363'],
      variants: [
        { name: 'Size', value: '39', stock: 5, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/m1906rer_nb_02_i.webp?v=1746569363' },
        { name: 'Size', value: '40', stock: 5, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/m1906rer_nb_05_i.webp?v=1746569375' },
        { name: 'Size', value: '41', stock: 5, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/m1906rer_nb_07_i.webp?v=1746569389' },
        { name: 'Size', value: '42', stock: 5, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/m1906rer_nb_06_i.webp?v=1746569397' },
        { name: 'Size', value: '43', stock: 5 },
        { name: 'Size', value: '44', stock: 5 },
        { name: 'Size', value: '45', stock: 5 }
      ]
    },
    {
      name: 'Adidas Sambae Shoes',
      slug: 'adidas-sambae-shoes',
      description: 'These adidas Sambae shoes breathe new life into a classic with a modernized perspective.',
      price: 33000,
      brand: 'Adidas',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/Sambae_Shoes_Black_JI1350_01_standard.jpg?v=1746568290'],
      variants: [
        { name: 'Size', value: '39', stock: 3, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/Sambae_Shoes_Black_JI1350_01_standard.jpg?v=1746568290' },
        { name: 'Size', value: '40', stock: 3, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/Sambae_Shoes_Black_JI1350_02_standard_hover.jpg?v=1746568307' },
        { name: 'Size', value: '41', stock: 3, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/Sambae_Shoes_Black_JI1350_03_standard.jpg?v=1746568321' },
        { name: 'Size', value: '42', stock: 3, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/Sambae_Shoes_Black_JI1350_06_standard.jpg?v=1746568341' },
        { name: 'Size', value: '43', stock: 3 },
        { name: 'Size', value: '44', stock: 3 },
        { name: 'Size', value: '45', stock: 3 }
      ]
    },
    {
      name: 'Lee T-shirt',
      slug: 'lee-t-shirt',
      description: 'Comfortable cotton t-shirt for everyday wear, available in multiple colors and sizes',
      price: 23000,
      salePrice: 19600,
      brand: 'Lee',
      categoryId: categoryMap.get('tshirts'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/382D12E4-D536-4899-A93A-FFAA4F6E7D82.jpg?v=1746553269'],
      variants: [
        // White variants
        { name: 'Color-Size', value: 'White-L', stock: 8, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/382D12E4-D536-4899-A93A-FFAA4F6E7D82.jpg?v=1746553269' },
        { name: 'Color-Size', value: 'White-M', stock: 8, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/A4F487E2-2285-48EA-8381-171B4A8A7541.jpg?v=1746553269' },
        { name: 'Color-Size', value: 'White-XL', stock: 8, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/D1CE1846-CE43-4959-90AB-0CD149518CE6.jpg?v=1746553269' },
        { name: 'Color-Size', value: 'White-XXL', stock: 8, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/7179F1E3-EC0F-4ADE-AA38-06579EB58E5C.jpg?v=1746553269' },
        // Black variants
        { name: 'Color-Size', value: 'Black-L', stock: 8, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/6D38F67E-858D-426B-A144-5DBD32EB2714.jpg?v=1746553269' },
        { name: 'Color-Size', value: 'Black-M', stock: 8 },
        { name: 'Color-Size', value: 'Black-XL', stock: 8 },
        { name: 'Color-Size', value: 'Black-XXL', stock: 8 },
        // Other colors
        { name: 'Color-Size', value: 'Silver-L', stock: 6 },
        { name: 'Color-Size', value: 'Silver-M', stock: 6 },
        { name: 'Color-Size', value: 'Brown-L', stock: 6 },
        { name: 'Color-Size', value: 'Navy-L', stock: 6 },
        { name: 'Color-Size', value: 'Red-L', stock: 6 },
        { name: 'Color-Size', value: 'Green-L', stock: 6 }
      ]
    },
    {
      name: 'Tommy T-shirt',
      slug: 'tommy-t-shirt',
      description: 'Premium Tommy Hilfiger t-shirt with classic styling, available in multiple colors',
      price: 23000,
      brand: 'Tommy Hilfiger',
      categoryId: categoryMap.get('tshirts'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/4E2BE85A-0216-4F78-91FA-D9F342E8F1B2.jpg?v=1746553258'],
      variants: [
        { name: 'Color-Size', value: 'Red-L', stock: 6, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/4E2BE85A-0216-4F78-91FA-D9F342E8F1B2.jpg?v=1746553258' },
        { name: 'Color-Size', value: 'Red-M', stock: 6, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/55E48DB8-984B-4877-8860-1C56FADC3B3B.jpg?v=1746553258' },
        { name: 'Color-Size', value: 'Red-XL', stock: 6, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/074E7F7F-5C0D-46F7-9E16-D7E73252C9DD.jpg?v=1746553258' },
        { name: 'Color-Size', value: 'Red-XXL', stock: 6, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/81D731DA-A17C-4EBE-904C-2E2565FE16E1.jpg?v=1746553258' },
        { name: 'Color-Size', value: 'Green-L', stock: 6, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/410246B7-9405-48DD-A3A5-FB35692B8D33.jpg?v=1746553258' },
        { name: 'Color-Size', value: 'Green-M', stock: 6 },
        { name: 'Color-Size', value: 'Black-L', stock: 6 },
        { name: 'Color-Size', value: 'Brown-L', stock: 6 },
        { name: 'Color-Size', value: 'Blue-L', stock: 6 },
        { name: 'Color-Size', value: 'Yellow-L', stock: 6 }
      ]
    },
    {
      name: 'Chelsea Away 2024-2025',
      slug: 'chelsea-away-2024-2025',
      description: 'Official Chelsea FC away jersey for 2024-2025 season',
      price: 28000,
      salePrice: 25200,
      brand: 'Chelsea FC',
      categoryId: categoryMap.get('sports'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/A10A2752-D4FF-490E-86B5-997062F4F8FA.jpg?v=1746553235'],
      variants: [
        { name: 'Size', value: 'S', stock: 8, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/A10A2752-D4FF-490E-86B5-997062F4F8FA.jpg?v=1746553235' },
        { name: 'Size', value: 'M', stock: 8, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/FA284566-D224-4126-9828-0BA23F689596.jpg?v=1746553235' },
        { name: 'Size', value: 'L', stock: 8 },
        { name: 'Size', value: 'XL', stock: 8 },
        { name: 'Size', value: 'XXL', stock: 8 }
      ]
    },
    {
      name: 'Jordan Sneakers',
      slug: 'jordan-sneakers',
      description: 'Premium Jordan basketball sneakers with authentic design',
      price: 35000,
      brand: 'Jordan',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/B1BC3745-F1D8-4BE3-95C4-97EF33FE6807.jpg?v=1746553276'],
      variants: [
        { name: 'Size', value: '41', stock: 4, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/B1BC3745-F1D8-4BE3-95C4-97EF33FE6807.jpg?v=1746553276' },
        { name: 'Size', value: '42', stock: 4, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/2FF8CF9B-48CF-4B0F-87D6-BB0C7530913B.jpg?v=1746553276' },
        { name: 'Size', value: '43', stock: 4, image: 'https://cdn.shopify.com/s/files/1/0748/5076/2982/files/DF6E41CA-8FA9-4AB9-8599-F7DAFDC93563.jpg?v=1746553276' },
        { name: 'Size', value: '44', stock: 4 }
      ]
    }
  ];
  
  console.log('📦 Creating products with variants...');
  
  for (const productData of productsWithVariants) {
    // Create product
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        shortDescription: productData.description.substring(0, 200),
        price: productData.price,
        salePrice: productData.salePrice || null,
        stock: productData.variants.reduce((sum, v) => sum + v.stock, 0),
        sku: `SKU-${productData.slug}`,
        brand: productData.brand,
        featured: Math.random() > 0.6,
        sellerId: seller.id,
        categoryId: productData.categoryId,
        images: productData.images,
        tags: [productData.brand.toLowerCase().replace(/\s+/g, '-'), 'variants', 'imported'],
        isActive: true,
        avgRating: Math.random() * 2 + 3,
        totalReviews: Math.floor(Math.random() * 50) + 5,
        totalSales: Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 500) + 50
      }
    });
    
    console.log(`✅ Created product: ${product.name}`);
    
    // Create variants
    for (let i = 0; i < productData.variants.length; i++) {
      const variant = productData.variants[i];
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: variant.name,
          value: variant.value,
          price: variant.price || productData.price,
          stock: variant.stock,
          image: variant.image || null,
          isActive: true,
          sortOrder: i
        }
      });
    }
    
    console.log(`   📝 Created ${productData.variants.length} variants`);
  }
  
  console.log('🎉 Import with variants completed!');
  
  const finalProductCount = await prisma.product.count();
  const finalVariantCount = await prisma.productVariant.count();
  
  console.log(`📊 Final Summary:`);
  console.log(`- Products created: ${finalProductCount}`);
  console.log(`- Variants created: ${finalVariantCount}`);
  console.log(`- Average variants per product: ${(finalVariantCount / finalProductCount).toFixed(1)}`);
}

main()
  .catch(e => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 