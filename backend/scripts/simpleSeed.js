const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iwanyu.store' },
    update: {},
    create: {
      email: 'admin@iwanyu.store',
      username: 'admin',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true
    }
  });
  console.log('✅ Admin user created');

  // Create seller user
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@iwanyu.store' },
    update: {},
    create: {
      email: 'seller@iwanyu.store',
      username: 'seller1',
      name: 'John Seller',
      firstName: 'John',
      lastName: 'Seller',
      password: sellerPassword,
      role: 'SELLER',
      isEmailVerified: true
    }
  });

  // Create seller profile
  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      businessName: 'TechStore Rwanda',
      businessEmail: 'contact@techstore.rw',
      businessPhone: '+250788123456',
      businessAddress: 'Kigali, Rwanda',
      businessDescription: 'Leading technology retailer in Rwanda',
      nationalId: '1234567890123456',
      status: 'APPROVED'
    }
  });
  console.log('✅ Seller created');

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest electronic devices and gadgets'
    },
    {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories'
    },
    {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and computer accessories'
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, and accessories'
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and outdoor gear'
    }
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    });
    createdCategories.push(category);
  }
  console.log('✅ Categories created');

  // Create sample products
  const products = [
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Latest iPhone with advanced camera system and A17 Pro chip',
      shortDescription: 'Premium smartphone with cutting-edge technology',
      price: 1200000,
      salePrice: 1100000,
      stock: 50,
      sku: 'IP15-PRO-001',
      brand: 'Apple',
      featured: true,
      categoryId: createdCategories.find(c => c.slug === 'smartphones').id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['smartphone', 'apple', 'premium', 'camera'],
      isActive: true,
      avgRating: 4.5,
      totalReviews: 25,
      totalSales: 45,
      views: 234
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      description: 'Powerful laptop with M2 chip, perfect for work and creativity',
      shortDescription: 'Ultra-thin laptop with exceptional performance',
      price: 1800000,
      stock: 25,
      sku: 'MBA-M2-001',
      brand: 'Apple',
      featured: true,
      categoryId: createdCategories.find(c => c.slug === 'laptops').id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['laptop', 'apple', 'productivity', 'm2'],
      isActive: true,
      avgRating: 4.8,
      totalReviews: 18,
      totalSales: 23,
      views: 156
    },
    {
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      description: 'Flagship Android phone with AI features and excellent camera',
      shortDescription: 'Advanced Android smartphone with AI capabilities',
      price: 900000,
      salePrice: 850000,
      stock: 40,
      sku: 'SGS24-001',
      brand: 'Samsung',
      featured: false,
      categoryId: createdCategories.find(c => c.slug === 'smartphones').id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['smartphone', 'samsung', 'android', 'ai'],
      isActive: true,
      avgRating: 4.3,
      totalReviews: 32,
      totalSales: 67,
      views: 298
    },
    {
      name: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      shortDescription: 'Premium wireless headphones for music lovers',
      price: 150000,
      salePrice: 120000,
      stock: 100,
      sku: 'WBH-001',
      brand: 'TechAudio',
      featured: true,
      categoryId: createdCategories.find(c => c.slug === 'electronics').id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['headphones', 'wireless', 'bluetooth', 'audio'],
      isActive: true,
      avgRating: 4.2,
      totalReviews: 41,
      totalSales: 89,
      views: 445
    },
    {
      name: 'Gaming Mechanical Keyboard',
      slug: 'gaming-mechanical-keyboard',
      description: 'RGB mechanical keyboard perfect for gaming and typing',
      shortDescription: 'High-performance mechanical keyboard for gamers',
      price: 80000,
      salePrice: 70000,
      stock: 75,
      sku: 'GMK-001',
      brand: 'GameTech',
      featured: false,
      categoryId: createdCategories.find(c => c.slug === 'electronics').id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['keyboard', 'gaming', 'mechanical', 'rgb'],
      isActive: true,
      avgRating: 4.6,
      totalReviews: 15,
      totalSales: 34,
      views: 187
    },
    {
      name: 'Running Shoes',
      slug: 'running-shoes',
      description: 'Lightweight running shoes with excellent cushioning',
      shortDescription: 'Comfortable running shoes for athletes',
      price: 120000,
      stock: 80,
      sku: 'RS-001',
      brand: 'SportRun',
      featured: true,
      categoryId: createdCategories.find(c => c.slug === 'sports').id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['shoes', 'running', 'sports', 'fitness'],
      isActive: true,
      avgRating: 4.4,
      totalReviews: 28,
      totalSales: 56,
      views: 312
    }
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData
    });
  }
  console.log('✅ Products created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin user: admin@iwanyu.store (password: admin123)`);
  console.log(`- Seller user: seller@iwanyu.store (password: seller123)`);
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 