const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPlaceholderImages() {
  console.log('🔧 Fixing placeholder image URLs...');
  
  try {
    // Get all products
    const products = await prisma.product.findMany();
    
    console.log(`Checking ${products.length} products for placeholder URLs...`);

    let updatedCount = 0;

    // Update each product
    for (const product of products) {
      const updates = {};
      
      // Fix single image field
      if (product.image && product.image.includes('via.placeholder.com')) {
        updates.image = '/placeholder-product.jpg';
        console.log(`Fixing image field for: ${product.name}`);
      }
      
      // Fix images array
      if (product.images && Array.isArray(product.images)) {
        const fixedImages = product.images.map(img => {
          if (typeof img === 'string' && img.includes('via.placeholder.com')) {
            console.log(`Fixing image URL: ${img}`);
            return '/placeholder-product.jpg';
          }
          return img;
        });
        
        // Only update if there were changes
        if (JSON.stringify(fixedImages) !== JSON.stringify(product.images)) {
          updates.images = fixedImages;
        }
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        });
        console.log(`✅ Updated product: ${product.name}`);
        updatedCount++;
      }
    }
    
    console.log(`🎉 Fixed ${updatedCount} products with placeholder images!`);
    
  } catch (error) {
    console.error('❌ Error fixing placeholder images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixPlaceholderImages(); 