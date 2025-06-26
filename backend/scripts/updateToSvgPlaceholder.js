const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateToSvgPlaceholder() {
  console.log('🔄 Updating products to use SVG placeholder...');
  
  try {
    // Update all products that have /placeholder-product.jpg
    const result = await prisma.product.updateMany({
      where: {
        OR: [
          { image: '/placeholder-product.jpg' },
          { images: { hasSome: ['/placeholder-product.jpg'] } }
        ]
      },
      data: {
        image: '/placeholder-product.svg',
        images: ['/placeholder-product.svg']
      }
    });
    
    console.log(`✅ Updated ${result.count} products to use SVG placeholder`);
    
    // Also update any products that might still have the old JPG in their images array
    const products = await prisma.product.findMany({
      where: {
        images: {
          hasSome: ['/placeholder-product.jpg']
        }
      }
    });
    
    for (const product of products) {
      if (product.images && Array.isArray(product.images)) {
        const updatedImages = product.images.map(img => 
          img === '/placeholder-product.jpg' ? '/placeholder-product.svg' : img
        );
        
        await prisma.product.update({
          where: { id: product.id },
          data: { images: updatedImages }
        });
        
        console.log(`✅ Updated images array for: ${product.name}`);
      }
    }
    
    console.log('🎉 All products updated to use SVG placeholder!');
    
  } catch (error) {
    console.error('❌ Error updating placeholders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateToSvgPlaceholder(); 