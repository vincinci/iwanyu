import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryHierarchy {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  children: {
    name: string;
    slug: string;
    originalSlugs?: string[]; // For mapping existing categories
    description?: string;
  }[];
}

const categoryHierarchy: CategoryHierarchy[] = [
  {
    name: "Fashion & Clothing",
    slug: "fashion-clothing",
    description: "All types of clothing and fashion accessories",
    icon: "Shirt",
    children: [
      {
        name: "Tops & Shirts",
        slug: "tops-shirts",
        originalSlugs: ["clothing-tops", "shirts", "t-shirts", "crop-tops", "vests"],
        description: "All types of tops, shirts, t-shirts, and crop tops"
      },
      {
        name: "Outerwear",
        slug: "outerwear", 
        originalSlugs: ["coats-jackets", "jackets", "hoodies", "sweaters"],
        description: "Coats, jackets, hoodies, and sweaters"
      },
      {
        name: "Bottoms",
        slug: "bottoms",
        originalSlugs: ["pants", "track-pants"],
        description: "Pants, track pants, and other bottoms"
      },
      {
        name: "Underwear & Intimates",
        slug: "underwear-intimates",
        originalSlugs: ["undershorts", "waist-cinchers"],
        description: "Underwear, undershorts, and body shaping wear"
      },
      {
        name: "Activewear",
        slug: "activewear-subcategory",
        originalSlugs: ["activewear"],
        description: "Athletic and fitness clothing"
      }
    ]
  },
  {
    name: "Sports & Recreation",
    slug: "sports-recreation",
    description: "Sports equipment, uniforms, and recreational items",
    icon: "Trophy",
    children: [
      {
        name: "Sports Equipment",
        slug: "sports-equipment",
        originalSlugs: ["sporting-goods"],
        description: "General sporting goods and equipment"
      },
      {
        name: "Sports Uniforms",
        slug: "sports-uniforms-sub",
        originalSlugs: ["sports-uniforms"],
        description: "Professional and amateur sports uniforms"
      },
      {
        name: "Footwear",
        slug: "footwear",
        originalSlugs: ["shoes"],
        description: "Athletic and casual shoes"
      }
    ]
  },
  {
    name: "Electronics & Technology",
    slug: "electronics-technology",
    description: "Electronic devices, computers, and tech accessories",
    icon: "Laptop",
    children: [
      {
        name: "Computers & Laptops",
        slug: "computers-laptops",
        originalSlugs: ["laptops"],
        description: "Laptops, desktops, and computer accessories"
      },
      {
        name: "Mobile Accessories",
        slug: "mobile-accessories",
        originalSlugs: ["mobile-phone-cases"],
        description: "Phone cases, chargers, and mobile accessories"
      },
      {
        name: "Home Appliances",
        slug: "home-appliances",
        originalSlugs: ["desk-pedestal-fans"],
        description: "Fans, small appliances, and home electronics"
      }
    ]
  },
  {
    name: "General & Miscellaneous",
    slug: "general-miscellaneous", 
    description: "General products and miscellaneous items",
    icon: "Package",
    children: [
      {
        name: "General Products",
        slug: "general-products",
        originalSlugs: ["general"],
        description: "General merchandise and mixed products"
      },
      {
        name: "Uncategorized",
        slug: "uncategorized-sub",
        originalSlugs: ["uncategorized"],
        description: "Items that don't fit into other categories"
      }
    ]
  }
];

async function reorganizeCategories() {
  console.log('🚀 Starting category reorganization...');

  try {
    // Get existing categories
    const existingCategories = await prisma.category.findMany({
      include: {
        products: true
      }
    });

    console.log(`📊 Found ${existingCategories.length} existing categories`);

    // Create a mapping of old slugs to existing categories
    const categoryMap = new Map();
    existingCategories.forEach(cat => {
      categoryMap.set(cat.slug, cat);
    });

    let sortOrder = 1;

    for (const parentCategoryData of categoryHierarchy) {
      console.log(`\n📁 Creating parent category: ${parentCategoryData.name}`);

      // Create or update parent category
      const parentCategory = await prisma.category.upsert({
        where: { slug: parentCategoryData.slug },
        update: {
          name: parentCategoryData.name,
          description: parentCategoryData.description,
          icon: parentCategoryData.icon,
          level: 0,
          sortOrder: sortOrder++,
          isActive: true
        },
        create: {
          name: parentCategoryData.name,
          slug: parentCategoryData.slug,
          description: parentCategoryData.description,
          icon: parentCategoryData.icon,
          level: 0,
          sortOrder: sortOrder++,
          isActive: true
        }
      });

      let childSortOrder = 1;

      for (const childData of parentCategoryData.children) {
        console.log(`  └── Creating subcategory: ${childData.name}`);

        // Create the subcategory
        const childCategory = await prisma.category.upsert({
          where: { slug: childData.slug },
          update: {
            name: childData.name,
            description: childData.description,
            parentId: parentCategory.id,
            level: 1,
            sortOrder: childSortOrder++,
            isActive: true
          },
          create: {
            name: childData.name,
            slug: childData.slug,
            description: childData.description,
            parentId: parentCategory.id,
            level: 1,
            sortOrder: childSortOrder++,
            isActive: true
          }
        });

        // Move products from old categories to new subcategory
        if (childData.originalSlugs) {
          for (const originalSlug of childData.originalSlugs) {
            const oldCategory = categoryMap.get(originalSlug);
            if (oldCategory && oldCategory.products.length > 0) {
              console.log(`    🔄 Moving ${oldCategory.products.length} products from "${oldCategory.name}" to "${childData.name}"`);
              
              await prisma.product.updateMany({
                where: { categoryId: oldCategory.id },
                data: { categoryId: childCategory.id }
              });
            }
          }
        }
      }
    }

    // Clean up old categories that are now empty and not parent categories
    console.log('\n🧹 Cleaning up empty old categories...');
    
    for (const parentCategoryData of categoryHierarchy) {
      for (const childData of parentCategoryData.children) {
        if (childData.originalSlugs) {
          for (const originalSlug of childData.originalSlugs) {
            const oldCategory = categoryMap.get(originalSlug);
            if (oldCategory) {
              // Check if category has any products left
              const productCount = await prisma.product.count({
                where: { categoryId: oldCategory.id }
              });

              if (productCount === 0 && originalSlug !== childData.slug) {
                console.log(`    🗑️  Removing empty category: ${oldCategory.name}`);
                await prisma.category.delete({
                  where: { id: oldCategory.id }
                });
              }
            }
          }
        }
      }
    }

    console.log('\n✅ Category reorganization completed successfully!');

    // Show final category structure
    const finalCategories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { level: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    console.log('\n📋 Final category structure:');
    finalCategories
      .filter(cat => cat.level === 0)
      .forEach(parent => {
        console.log(`\n${parent.name} (${parent._count.products} products)`);
        parent.children.forEach(child => {
          console.log(`  └── ${child.name} (${child._count.products} products)`);
        });
      });

  } catch (error) {
    console.error('❌ Error reorganizing categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  reorganizeCategories()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { reorganizeCategories }; 