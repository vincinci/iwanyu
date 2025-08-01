const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    const count = await prisma.product.count();
    console.log(`Connected successfully! Found ${count} products.`);
    
    const categories = await prisma.category.count();
    console.log(`Found ${categories} categories.`);
    
    await prisma.$disconnect();
    console.log('Connection test completed successfully.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

main();
