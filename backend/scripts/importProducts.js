const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📁 Importing products from CSV data...');
  
  // Get seller
  const seller = await prisma.seller.findFirst({
    where: { status: 'APPROVED' }
  });
  
  if (!seller) {
    throw new Error('No approved seller found');
  }
  
  // Create categories
  const categories = [
    { name: 'Sneakers', slug: 'sneakers', description: 'Athletic and casual sneakers' },
    { name: 'T-Shirts', slug: 'tshirts', description: 'Casual t-shirts and tops' },
    { name: 'Laptops', slug: 'laptops', description: 'Laptops and computers' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home and kitchen items' },
    { name: 'Sports', slug: 'sports', description: 'Sports jerseys and equipment' }
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
  
  // Products from CSV
  const products = [
    {
      name: 'New Balance 740',
      slug: 'new-balance-740',
      description: 'The original 740 was the kind of daily runner that would be worn into the ground with heavy miles and bought all over again.',
      price: 35000,
      salePrice: 33000,
      stock: 25,
      brand: 'New Balance',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/u740gs2_nb_02_i_0914f1b8-abfe-4c80-8512-4079319c9f6a.webp?v=1746568697']
    },
    {
      name: 'Adidas Sambae Shoes',
      slug: 'adidas-sambae-shoes',
      description: 'These adidas Sambae shoes breathe new life into a classic with a modernized perspective.',
      price: 33000,
      stock: 15,
      brand: 'Adidas',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/Sambae_Shoes_Black_JI1350_01_standard.jpg?v=1746568290']
    },
    {
      name: 'Jordan Sneakers',
      slug: 'jordan-sneakers',
      description: 'Premium Jordan basketball sneakers with authentic design',
      price: 35000,
      stock: 12,
      brand: 'Jordan',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/B1BC3745-F1D8-4BE3-95C4-97EF33FE6807.jpg?v=1746553276']
    },
    {
      name: 'Lee T-shirt',
      slug: 'lee-t-shirt',
      description: 'Comfortable cotton t-shirt for everyday wear, available in multiple colors',
      price: 23000,
      salePrice: 19600,
      stock: 50,
      brand: 'Lee',
      categoryId: categoryMap.get('tshirts'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/382D12E4-D536-4899-A93A-FFAA4F6E7D82.jpg?v=1746553269']
    },
    {
      name: 'Tommy T-shirt',
      slug: 'tommy-t-shirt',
      description: 'Premium Tommy Hilfiger t-shirt with classic styling',
      price: 23000,
      stock: 40,
      brand: 'Tommy Hilfiger',
      categoryId: categoryMap.get('tshirts'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/4E2BE85A-0216-4F78-91FA-D9F342E8F1B2.jpg?v=1746553258']
    },
    {
      name: 'Zara T-shirt',
      slug: 'zara-t-shirt',
      description: 'Stylish Zara t-shirt with modern fit and premium materials',
      price: 23000,
      stock: 35,
      brand: 'Zara',
      categoryId: categoryMap.get('tshirts'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/9F0960F3-96D9-452D-AFB2-9D7250B4A78B.jpg?v=1746553246']
    },
    {
      name: 'Chelsea Away 2024-2025',
      slug: 'chelsea-away-2024-2025',
      description: 'Official Chelsea FC away jersey for 2024-2025 season',
      price: 28000,
      salePrice: 25200,
      stock: 30,
      brand: 'Chelsea FC',
      categoryId: categoryMap.get('sports'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/A10A2752-D4FF-490E-86B5-997062F4F8FA.jpg?v=1746553235']
    },
    {
      name: 'Chelsea Home 2024-2025',
      slug: 'chelsea-home-2024-2025',
      description: 'Official Chelsea FC home jersey for 2024-2025 season',
      price: 28000,
      salePrice: 25200,
      stock: 25,
      brand: 'Chelsea FC',
      categoryId: categoryMap.get('sports'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/546A43F3-2B9E-4B98-8DCF-10A52102F916.jpg?v=1746553230']
    },
    {
      name: 'AC Milan 2024-2025',
      slug: 'ac-milan-2024-2025',
      description: 'Official AC Milan jersey for 2024-2025 season',
      price: 28000,
      salePrice: 25200,
      stock: 20,
      brand: 'AC Milan',
      categoryId: categoryMap.get('sports'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/B79C133B-CA6D-48B5-8FB3-139EBF59E6B8.jpg?v=1746553224']
    },
    {
      name: 'New Balance WRPD Runner',
      slug: 'new-balance-wrpd-runner',
      description: 'The WRPD Runner features unique design with curved contours of the full-length FuelCell midsole',
      price: 34000,
      salePrice: 30600,
      stock: 18,
      brand: 'New Balance',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/11D91907-F4EF-4469-A27B-17ECC32A4A43.jpg?v=1746553210']
    },
    {
      name: 'Nike Air Jordan 4 Retro SE Craft',
      slug: 'nike-air-jordan-4-retro-se-craft',
      description: 'Nike Air Jordan 4 Retro SE Craft with dark green leather upper and special die-cut panels',
      price: 35000,
      salePrice: 31500,
      stock: 10,
      brand: 'Nike',
      categoryId: categoryMap.get('sneakers'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/84002B8B-AADC-4E38-8758-DB19BA57FACE.png?v=1746553202']
    },
    {
      name: 'HP ProBook 640 G1',
      slug: 'hp-probook-640-g1',
      description: 'Intel Core i5 processor, 8GB RAM, 256GB SSD, Windows 10 Pro. Perfect for business use.',
      price: 385000,
      salePrice: 350000,
      stock: 5,
      brand: 'HP',
      categoryId: categoryMap.get('laptops'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/60C86E90-9774-4B28-B6F4-D18DC37517B2.png?v=1746553193']
    },
    {
      name: 'HP Elitebook 840 G5',
      slug: 'hp-elitebook-840-g5',
      description: 'Premium business laptop with HP Elitebook Docking Station. Features backlit keyboard and Bang & Olufsen audio.',
      price: 550000,
      salePrice: 495000,
      stock: 3,
      brand: 'HP',
      categoryId: categoryMap.get('laptops'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/0593D54C-D9B3-4D43-9317-BEF5F9090DFA.jpg?v=1746553183']
    },
    {
      name: 'Elegant Dinner Set',
      slug: 'elegant-dinner-set',
      description: 'Complete dinner set including 6 cups, 6 side plates, 6 bowls, and 6 plates',
      price: 72000,
      salePrice: 64800,
      stock: 15,
      brand: 'Home Collection',
      categoryId: categoryMap.get('home-kitchen'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/B2FA9647-1FA4-43E1-BD99-552FAEF4EE10.jpg?v=1746553174']
    },
    {
      name: 'Frying Pan 24cm',
      slug: 'frying-pan-24cm',
      description: 'Non-stick frying pan 24cm diameter. Perfect for cooking without oil. Suitable for all cookers including induction.',
      price: 23000,
      salePrice: 20700,
      stock: 25,
      brand: 'Kitchen Pro',
      categoryId: categoryMap.get('home-kitchen'),
      images: ['https://cdn.shopify.com/s/files/1/0748/5076/2982/files/6F4589D1-6D96-4350-ABB6-DF1FF0D8BB3C.jpg?v=1746553166']
    }
  ];
  
  console.log('📦 Creating products...');
  
  for (const productData of products) {
    await prisma.product.create({
      data: {
        ...productData,
        shortDescription: productData.description.substring(0, 200),
        sku: `SKU-${productData.slug}`,
        featured: Math.random() > 0.6,
        sellerId: seller.id,
        tags: [productData.brand.toLowerCase().replace(/\s+/g, '-'), 'imported', 'featured'],
        isActive: true,
        avgRating: Math.random() * 2 + 3,
        totalReviews: Math.floor(Math.random() * 50) + 5,
        totalSales: Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 500) + 50
      }
    });
  }
  
  console.log('✅ Import completed!');
  const count = await prisma.product.count();
  console.log(`Products in database: ${count}`);
}

main()
  .catch(e => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 