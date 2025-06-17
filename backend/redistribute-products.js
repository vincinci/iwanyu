const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function redistributeProducts() {
  console.log('Starting product redistribution...');

  try {
    // First, create additional categories
    const newCategories = [
      {
        name: 'Men\'s Clothing',
        slug: 'mens-clothing',
        description: 'Clothing and apparel for men',
        sortOrder: 1
      },
      {
        name: 'Women\'s Clothing',
        slug: 'womens-clothing',
        description: 'Clothing and apparel for women',
        sortOrder: 2
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Fashion accessories, caps, hats, and jewelry',
        sortOrder: 3
      },
      {
        name: 'Hoodies & Sweatshirts',
        slug: 'hoodies-sweatshirts',
        description: 'Hoodies, sweatshirts, and warm clothing',
        sortOrder: 4
      },
      {
        name: 'T-Shirts & Tops',
        slug: 't-shirts-tops',
        description: 'T-shirts, tops, and casual wear',
        sortOrder: 5
      },
      {
        name: 'Pants & Jeans',
        slug: 'pants-jeans',
        description: 'Pants, jeans, and bottom wear',
        sortOrder: 6
      },
      {
        name: 'Luxury Sneakers',
        slug: 'luxury-sneakers',
        description: 'High-end and designer sneakers',
        sortOrder: 7
      }
    ];

    // Create categories if they don't exist
    const createdCategories = {};
    for (const categoryData of newCategories) {
      try {
        const category = await prisma.category.upsert({
          where: { slug: categoryData.slug },
          update: {},
          create: categoryData
        });
        createdCategories[categoryData.slug] = category.id;
        console.log(`✓ Category: ${categoryData.name}`);
      } catch (error) {
        console.log(`Category ${categoryData.name} already exists or error:`, error.message);
      }
    }

    // Get existing category IDs
    const categories = await prisma.category.findMany();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Get all products that need redistribution
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        categoryId: true,
        category: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    });

    console.log(`\nFound ${products.length} products to analyze...`);

    let redistributed = 0;

    for (const product of products) {
      const name = product.name.toLowerCase();
      const description = (product.description || '').toLowerCase();
      let newCategoryId = null;

      // Determine new category based on product name and description
      if (name.includes('hoodie') || name.includes('sweatshirt') || name.includes('jumper')) {
        newCategoryId = categoryMap['hoodies-sweatshirts'];
      }
      else if (name.includes('t-shirt') || name.includes('tshirt') || name.includes('shirt') || name.includes('top') || name.includes('blouse')) {
        newCategoryId = categoryMap['t-shirts-tops'];
      }
      else if (name.includes('pants') || name.includes('jeans') || name.includes('trouser') || name.includes('cargo')) {
        newCategoryId = categoryMap['pants-jeans'];
      }
      else if (name.includes('hat') || name.includes('cap') || name.includes('bracelet') || name.includes('jewelry') || name.includes('watch') || name.includes('accessories')) {
        newCategoryId = categoryMap['accessories'];
      }
      else if (name.includes('women') || name.includes('female') || name.includes('ladies') || name.includes('crop top')) {
        newCategoryId = categoryMap['womens-clothing'];
      }
      else if (name.includes('men') || name.includes('male') || name.includes('tracksuit') || name.includes('suit')) {
        newCategoryId = categoryMap['mens-clothing'];
      }
      else if (name.includes('louis vuitton') || name.includes('supreme') || name.includes('travis scott') || 
               (name.includes('jordan') && product.category.slug === 'fashion-clothing') ||
               (name.includes('nike') && product.category.slug === 'fashion-clothing') ||
               name.includes('puma') || name.includes('reebok') || name.includes('converse')) {
        // Move high-end/luxury sneakers to luxury category
        newCategoryId = categoryMap['luxury-sneakers'];
      }
      else if (name.includes('air force') || name.includes('air max') || name.includes('new balance')) {
        // Keep regular sneakers in sneakers category
        newCategoryId = categoryMap['sneakers-shoes'];
      }

      // Update product category if we found a better match
      if (newCategoryId && newCategoryId !== product.categoryId) {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: newCategoryId }
          });
          
          const newCategory = categories.find(c => c.id === newCategoryId);
          console.log(`✓ Moved "${product.name}" from "${product.category.name}" to "${newCategory.name}"`);
          redistributed++;
        } catch (error) {
          console.error(`Error updating ${product.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Redistribution complete! Moved ${redistributed} products to better categories.`);

    // Display final category counts
    const finalCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    console.log('\n📊 Final Category Distribution:');
    finalCategories.forEach(category => {
      console.log(`${category.name}: ${category._count.products} products`);
    });

  } catch (error) {
    console.error('Error during redistribution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

redistributeProducts(); 