const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showNewVariants() {
  try {
    console.log('🎉 NEWLY ADDED VARIANTS - DETAILED VIEW');
    console.log('=' .repeat(60));

    // Get the products that just received variants
    const productNames = [
      'Elegant dinner sets including 6 cups',
      'T-Shirt',
      'New Balance',
      'Nike Dunk Low',
      'shorts',
      'AIR',
      'Air Jordan 4',
      'Air Force 1',
      'Hat'
    ];

    for (const productName of productNames) {
      const product = await prisma.product.findFirst({
        where: {
          name: {
            contains: productName,
            mode: 'insensitive'
          }
        },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          },
          category: {
            select: {
              name: true
            }
          }
        }
      });

      if (product && product.variants.length > 0) {
        console.log(`\n📦 ${product.name}`);
        console.log(`   Category: ${product.category?.name || 'Uncategorized'}`);
        console.log(`   Base Price: ${product.price.toLocaleString()} RWF`);
        console.log(`   Variants (${product.variants.length}):`);
        
        product.variants.forEach((variant, index) => {
          const priceDisplay = variant.price !== product.price ? 
            `${variant.price.toLocaleString()} RWF` : 
            'Base price';
          console.log(`     ${index + 1}. ${variant.name}: ${variant.value} - ${priceDisplay} (Stock: ${variant.stock})`);
        });
      }
    }

    // Show final statistics
    console.log('\n📊 FINAL VARIANT STATISTICS:');
    console.log('=' .repeat(40));
    
    const totalProducts = await prisma.product.count();
    const productsWithVariants = await prisma.product.count({
      where: {
        variants: {
          some: {}
        }
      }
    });
    const productsWithoutVariants = await prisma.product.count({
      where: {
        variants: {
          none: {}
        }
      }
    });
    const totalVariants = await prisma.productVariant.count();

    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products WITH Variants: ${productsWithVariants} (${Math.round(productsWithVariants/totalProducts*100)}%)`);
    console.log(`Products WITHOUT Variants: ${productsWithoutVariants} (${Math.round(productsWithoutVariants/totalProducts*100)}%)`);
    console.log(`Total Variants: ${totalVariants}`);

    // Show the one remaining product without variants
    if (productsWithoutVariants > 0) {
      console.log('\n⚠️ REMAINING PRODUCT WITHOUT VARIANTS:');
      const remaining = await prisma.product.findFirst({
        where: {
          variants: {
            none: {}
          }
        },
        select: {
          name: true,
          category: {
            select: {
              name: true
            }
          }
        }
      });
      
      if (remaining) {
        console.log(`   - ${remaining.name} (${remaining.category?.name || 'Uncategorized'})`);
        console.log('     ^ This appears to be a corrupted product entry');
      }
    }

  } catch (error) {
    console.error('Error showing variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showNewVariants(); 