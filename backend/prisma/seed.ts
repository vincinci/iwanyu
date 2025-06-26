import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Home appliances and kitchen essentials'
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

  const createdCategories: any[] = [];
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
      categoryId: createdCategories.find(c => c.slug === 'smartphones')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['smartphone', 'apple', 'premium', 'camera']
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
      categoryId: createdCategories.find(c => c.slug === 'laptops')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['laptop', 'apple', 'productivity', 'm2']
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
      categoryId: createdCategories.find(c => c.slug === 'smartphones')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['smartphone', 'samsung', 'android', 'ai']
    },
    {
      name: 'Dell XPS 13',
      slug: 'dell-xps-13',
      description: 'Premium ultrabook with stunning display and long battery life',
      shortDescription: 'Compact laptop with premium build quality',
      price: 1500000,
      stock: 20,
      sku: 'DELL-XPS13-001',
      brand: 'Dell',
      featured: false,
      categoryId: createdCategories.find(c => c.slug === 'laptops')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['laptop', 'dell', 'ultrabook', 'business']
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
      categoryId: createdCategories.find(c => c.slug === 'electronics')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['headphones', 'wireless', 'bluetooth', 'audio']
    },
    {
      name: 'Smart Watch Series 9',
      slug: 'smart-watch-series-9',
      description: 'Advanced smartwatch with health monitoring and fitness tracking',
      shortDescription: 'Feature-rich smartwatch for active lifestyle',
      price: 400000,
      stock: 60,
      sku: 'SW9-001',
      brand: 'TechWatch',
      featured: false,
      categoryId: createdCategories.find(c => c.slug === 'electronics')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['smartwatch', 'fitness', 'health', 'wearable']
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
      categoryId: createdCategories.find(c => c.slug === 'electronics')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['keyboard', 'gaming', 'mechanical', 'rgb']
    },
    {
      name: 'Portable Power Bank 20000mAh',
      slug: 'portable-power-bank-20000mah',
      description: 'High-capacity power bank with fast charging support',
      shortDescription: 'Reliable power bank for all your devices',
      price: 35000,
      stock: 150,
      sku: 'PPB-20K-001',
      brand: 'PowerTech',
      featured: false,
      categoryId: createdCategories.find(c => c.slug === 'electronics')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['powerbank', 'charging', 'portable', 'battery']
    },
    {
      name: 'Casual Cotton T-Shirt',
      slug: 'casual-cotton-t-shirt',
      description: 'Comfortable cotton t-shirt for everyday wear',
      shortDescription: 'Soft and comfortable cotton t-shirt',
      price: 15000,
      salePrice: 12000,
      stock: 200,
      sku: 'CCT-001',
      brand: 'FashionWear',
      featured: false,
      categoryId: createdCategories.find(c => c.slug === 'fashion')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['tshirt', 'cotton', 'casual', 'clothing']
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
      categoryId: createdCategories.find(c => c.slug === 'sports')!.id,
      sellerId: seller.id,
      images: ['/placeholder-product.jpg'],
      tags: ['shoes', 'running', 'sports', 'fitness']
    }
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        isActive: true,
        avgRating: Math.random() * 2 + 3,
        totalReviews: Math.floor(Math.random() * 50) + 5,
        totalSales: Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 500) + 50
      }
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