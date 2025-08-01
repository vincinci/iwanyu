import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      image: '/images/categories/electronics.jpg',
      isActive: true,
    },
  });
  
  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      image: '/images/categories/fashion.jpg',
      isActive: true,
    },
  });
  
  const home = await prisma.category.create({
    data: {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Home decoration and living essentials',
      image: '/images/categories/home.jpg',
      isActive: true,
    },
  });
  
  // Create test users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@iwanyu.rw',
      password: await hashPassword('admin123'),
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  
  const vendorUser = await prisma.user.create({
    data: {
      email: 'vendor@iwanyu.rw',
      password: await hashPassword('vendor123'),
      name: 'Test Vendor',
      role: 'VENDOR',
      emailVerified: new Date(),
    },
  });
  
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@iwanyu.rw',
      password: await hashPassword('customer123'),
      name: 'Test Customer',
      role: 'SHOPPER',
      emailVerified: new Date(),
    },
  });
  
  // Create vendor profile
  const vendor = await prisma.vendor.create({
    data: {
      userId: vendorUser.id,
      businessName: 'TechStore Rwanda',
      businessDescription: 'Leading electronics retailer in Rwanda',
      businessPhone: '+250788123456',
      businessAddress: 'KG 123 St, Kigali, Rwanda',
      isApproved: true,
      isVerified: true,
      rating: 4.5,
    },
  });
  
  // Create sample products
  const smartphone = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: electronics.id,
      name: 'Samsung Galaxy A54 5G',
      slug: 'samsung-galaxy-a54-5g',
      description: 'Latest Samsung smartphone with 5G connectivity, 128GB storage, and excellent camera quality.',
      shortDescription: 'Samsung Galaxy A54 5G - 128GB',
      sku: 'SAM-A54-128',
      price: 45000000, // 450,000 RWF in cents
      salePrice: 42000000, // 420,000 RWF in cents
      stock: 25,
      images: [
        '/images/products/samsung-a54-1.jpg',
        '/images/products/samsung-a54-2.jpg',
        '/images/products/samsung-a54-3.jpg',
      ],
      weight: 0.202,
      dimensions: {
        length: 15.8,
        width: 7.6,
        height: 0.8,
      },
      isActive: true,
      isFeatured: true,
      rating: 4.3,
      reviewCount: 15,
      tags: ['smartphone', 'samsung', '5g', 'android'],
    },
  });
  
  const laptop = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: electronics.id,
      name: 'HP Pavilion 15',
      slug: 'hp-pavilion-15',
      description: 'Powerful laptop with Intel Core i5 processor, 8GB RAM, 512GB SSD. Perfect for work and entertainment.',
      shortDescription: 'HP Pavilion 15 - Intel i5, 8GB RAM',
      sku: 'HP-PAV-15-I5',
      price: 85000000, // 850,000 RWF in cents
      stock: 10,
      images: [
        '/images/products/hp-pavilion-1.jpg',
        '/images/products/hp-pavilion-2.jpg',
      ],
      weight: 1.75,
      dimensions: {
        length: 35.8,
        width: 24.2,
        height: 1.9,
      },
      isActive: true,
      isFeatured: true,
      rating: 4.1,
      reviewCount: 8,
      tags: ['laptop', 'hp', 'intel', 'business'],
    },
  });
  
  const tshirt = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: fashion.id,
      name: 'Rwanda Flag T-Shirt',
      slug: 'rwanda-flag-t-shirt',
      description: 'High-quality cotton t-shirt featuring the beautiful Rwanda flag design. Available in multiple sizes.',
      shortDescription: 'Rwanda Flag Cotton T-Shirt',
      sku: 'RW-TSHIRT-FLAG',
      price: 1500000, // 15,000 RWF in cents
      stock: 50,
      images: [
        '/images/products/rwanda-tshirt-1.jpg',
        '/images/products/rwanda-tshirt-2.jpg',
      ],
      weight: 0.2,
      isActive: true,
      rating: 4.7,
      reviewCount: 23,
      tags: ['clothing', 'tshirt', 'rwanda', 'cotton'],
    },
  });
  
  // Create product variants for t-shirt
  await prisma.productVariant.create({
    data: {
      productId: tshirt.id,
      name: 'Size',
      value: 'Small',
      price: 0,
      stock: 15,
    },
  });
  
  await prisma.productVariant.create({
    data: {
      productId: tshirt.id,
      name: 'Size',
      value: 'Medium',
      price: 0,
      stock: 20,
    },
  });
  
  await prisma.productVariant.create({
    data: {
      productId: tshirt.id,
      name: 'Size',
      value: 'Large',
      price: 0,
      stock: 15,
    },
  });
  
  // Create sample reviews
  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: smartphone.id,
      rating: 5,
      comment: 'Excellent phone! Fast delivery and great customer service.',
      isVerified: true,
    },
  });
  
  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: laptop.id,
      rating: 4,
      comment: 'Good laptop for the price. Works well for my daily tasks.',
      isVerified: true,
    },
  });
  
  console.log('✅ Seed completed successfully!');
  console.log('📝 Created:');
  console.log('   - 3 categories');
  console.log('   - 3 users (admin, vendor, customer)');
  console.log('   - 1 vendor profile');
  console.log('   - 3 products');
  console.log('   - 3 product variants');
  console.log('   - 2 reviews');
  console.log('');
  console.log('🔑 Test accounts:');
  console.log('   Admin: admin@iwanyu.rw / admin123');
  console.log('   Vendor: vendor@iwanyu.rw / vendor123');
  console.log('   Customer: customer@iwanyu.rw / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
