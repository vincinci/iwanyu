const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingVariants() {
  try {
    console.log('🔧 ADDING VARIANTS TO PRODUCTS WITHOUT VARIANTS');
    console.log('=' .repeat(60));

    // Get products without variants
    const productsWithoutVariants = await prisma.product.findMany({
      where: {
        variants: {
          none: {}
        }
      },
      include: {
        category: true
      }
    });

    console.log(`Found ${productsWithoutVariants.length} products without variants:`);
    productsWithoutVariants.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.category?.name || 'Uncategorized'})`);
    });

    console.log('\n🎯 Adding appropriate variants...\n');

    for (const product of productsWithoutVariants) {
      console.log(`Processing: ${product.name}`);
      
      // Skip corrupted products
      if (product.name.includes('which have been replaced') || product.name.length > 100) {
        console.log('  ⚠️ Skipping corrupted product entry');
        continue;
      }

      let variantsToAdd = [];
      const categoryName = product.category?.name?.toLowerCase() || '';
      const productName = product.name.toLowerCase();

      // Determine appropriate variants based on product type
      if (categoryName.includes('shoes') || categoryName.includes('sneakers') || 
          productName.includes('air force') || productName.includes('jordan') || 
          productName.includes('nike') || productName.includes('balance')) {
        
        // Shoe products - add size variants
        const shoeSizes = ['38', '39', '40', '41', '42', '43', '44'];
        variantsToAdd = shoeSizes.map(size => ({
          name: 'Shoe size',
          value: size,
          price: product.price,
          stock: Math.floor(product.stock / shoeSizes.length) || 5,
          sortOrder: 0
        }));

      } else if (categoryName.includes('shirts') || categoryName.includes('tops') || 
                 productName.includes('t-shirt') || productName.includes('shirt')) {
        
        // Clothing products - add size variants
        const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
        
        variantsToAdd = clothingSizes.map(size => ({
          name: 'Size',
          value: size,
          price: product.price,
          stock: Math.floor(product.stock / clothingSizes.length) || 3,
          sortOrder: 0
        }));

      } else if (categoryName.includes('pants') || categoryName.includes('shorts') || 
                 productName.includes('shorts')) {
        
        // Pants/Shorts - add size variants
        const pantsSizes = ['S', 'M', 'L', 'XL', 'XXL'];
        variantsToAdd = pantsSizes.map(size => ({
          name: 'Size',
          value: size,
          price: product.price,
          stock: Math.floor(product.stock / pantsSizes.length) || 3,
          sortOrder: 0
        }));

      } else if (categoryName.includes('hats') || categoryName.includes('caps') || 
                 productName.includes('hat') || productName.includes('cap')) {
        
        // Hats/Caps - add color variants
        const colors = ['Black', 'White', 'Navy', 'Red'];
        
        variantsToAdd = colors.map(color => ({
          name: 'Color',
          value: color,
          price: product.price,
          stock: Math.floor(product.stock / colors.length) || 3,
          sortOrder: 0
        }));

      } else if (categoryName.includes('bags') || categoryName.includes('accessories')) {
        
        // Bags/Accessories - add color variants
        const colors = ['Black', 'Brown', 'Navy', 'Gray'];
        variantsToAdd = colors.map(color => ({
          name: 'Color',
          value: color,
          price: product.price,
          stock: Math.floor(product.stock / colors.length) || 3,
          sortOrder: 0
        }));

      } else if (categoryName.includes('kitchen') || categoryName.includes('dining') || 
                 productName.includes('dinner sets')) {
        
        // Kitchen items - add set size variants
        const setSizes = ['4-piece set', '6-piece set', '8-piece set', '12-piece set'];
        variantsToAdd = setSizes.map((setSize, index) => ({
          name: 'Set Size',
          value: setSize,
          price: product.price + (index * 5000),
          stock: Math.floor(product.stock / setSizes.length) || 2,
          sortOrder: index
        }));

      } else {
        // Default variants for other products
        variantsToAdd = [
          {
            name: 'Size',
            value: 'One Size',
            price: product.price,
            stock: Math.floor(product.stock / 2) || 5,
            sortOrder: 0
          }
        ];
      }

      // Create the variants
      let createdCount = 0;
      for (const variantData of variantsToAdd) {
        try {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: variantData.name,
              value: variantData.value,
              price: variantData.price,
              stock: variantData.stock,
              sortOrder: variantData.sortOrder,
              isActive: true
            }
          });
          createdCount++;
        } catch (error) {
          if (!error.message.includes('Unique constraint')) {
            console.error(`    Error creating variant: ${error.message}`);
          }
        }
      }

      console.log(`  ✅ Added ${createdCount} variants`);
    }

    // Final verification
    console.log('\n📊 VERIFICATION:');
    const remainingProducts = await prisma.product.count({
      where: {
        variants: {
          none: {}
        }
      }
    });

    const totalProducts = await prisma.product.count();
    const productsWithVariants = await prisma.product.count({
      where: {
        variants: {
          some: {}
        }
      }
    });
    const totalVariants = await prisma.productVariant.count();

    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products with Variants: ${productsWithVariants} (${Math.round(productsWithVariants/totalProducts*100)}%)`);
    console.log(`Products without Variants: ${remainingProducts}`);
    console.log(`Total Variants: ${totalVariants}`);

    if (remainingProducts === 0) {
      console.log('🎉 SUCCESS! All products now have variants!');
    }

  } catch (error) {
    console.error('Error adding variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingVariants(); 