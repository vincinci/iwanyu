const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enhanceProductDescriptions() {
  try {
    console.log('📝 ENHANCING PRODUCT DESCRIPTIONS');
    console.log('=' .repeat(50));

    // Get products with short or generic descriptions
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { description: { contains: 'High quality product' } },
          { description: { contains: 'No description available' } },
          { description: { contains: 'Premium quality' } },
          { 
            description: { 
              in: ['', 'Description not available', 'Product description'] 
            } 
          },
          {
            AND: [
              { description: { not: { contains: 'Featuring' } } },
              { description: { not: { contains: 'Experience' } } },
              { description: { not: { contains: 'Discover' } } }
            ]
          }
        ]
      },
      include: {
        category: true
      },
      take: 50 // Process in batches
    });

    console.log(`Found ${products.length} products needing description enhancement`);

    const descriptions = {
      // Shoes & Sneakers
      shoes: [
        "Step into comfort and style with these premium sneakers. Featuring advanced cushioning technology, breathable materials, and a sleek design that complements any outfit. Perfect for daily wear, workouts, or casual outings.",
        "Experience ultimate comfort with these expertly crafted shoes. Made with high-quality materials and attention to detail, they offer superior support, durability, and timeless style that never goes out of fashion.",
        "Elevate your footwear game with these versatile sneakers. Combining modern aesthetics with functional design, they provide excellent grip, comfort, and style for any occasion."
      ],
      
      // Clothing
      clothing: [
        "Discover the perfect blend of comfort and style with this premium garment. Crafted from high-quality materials with attention to detail, it offers a comfortable fit and timeless design that works for any occasion.",
        "Upgrade your wardrobe with this versatile piece. Made from premium fabrics with expert craftsmanship, it provides comfort, durability, and style that lasts. Perfect for both casual and formal settings.",
        "Experience exceptional quality and comfort with this carefully designed garment. Featuring superior materials and modern styling, it's the perfect addition to any fashion-conscious wardrobe."
      ],
      
      // Electronics
      electronics: [
        "Discover cutting-edge technology with this innovative device. Featuring premium components, user-friendly design, and reliable performance, it's built to enhance your daily life and exceed your expectations.",
        "Experience the latest in technology with this high-performance device. Combining advanced features with intuitive design, it delivers exceptional functionality and reliability for all your needs.",
        "Upgrade your tech arsenal with this premium device. Built with quality components and innovative features, it offers superior performance, durability, and user experience."
      ],
      
      // Home & Kitchen
      home: [
        "Transform your living space with this premium home essential. Combining functionality with elegant design, it's crafted from high-quality materials to enhance your daily life and complement your home décor.",
        "Elevate your home experience with this carefully designed product. Made with attention to detail and premium materials, it offers both practical functionality and aesthetic appeal.",
        "Discover the perfect addition to your home with this versatile product. Featuring superior craftsmanship and thoughtful design, it combines style, functionality, and durability."
      ],
      
      // Sports & Fitness
      sports: [
        "Enhance your athletic performance with this premium sports product. Designed for athletes and fitness enthusiasts, it combines advanced materials with ergonomic design for optimal performance and comfort.",
        "Take your fitness journey to the next level with this high-quality sports gear. Built for durability and performance, it's designed to support your active lifestyle and help you achieve your goals.",
        "Experience professional-grade quality with this sports product. Combining innovative design with premium materials, it delivers the performance and reliability you need for your active lifestyle."
      ],
      
      // Accessories
      accessories: [
        "Complete your look with this stylish accessory. Crafted with attention to detail and premium materials, it adds the perfect finishing touch to any outfit while providing practical functionality.",
        "Elevate your style with this versatile accessory. Combining fashion-forward design with practical functionality, it's the perfect complement to your personal style and daily needs.",
        "Discover the perfect blend of style and functionality with this premium accessory. Made with quality materials and thoughtful design, it enhances both your look and your lifestyle."
      ]
    };

    let updated = 0;

    for (const product of products) {
      try {
        const categoryName = product.category?.name?.toLowerCase() || '';
        
        let descriptionCategory = 'accessories'; // default
        
        if (categoryName.includes('shoes') || categoryName.includes('sneakers')) {
          descriptionCategory = 'shoes';
        } else if (categoryName.includes('shirt') || categoryName.includes('top') || categoryName.includes('clothing') || categoryName.includes('pants') || categoryName.includes('shorts') || categoryName.includes('jacket') || categoryName.includes('hat')) {
          descriptionCategory = 'clothing';
        } else if (categoryName.includes('electronics') || categoryName.includes('computer') || categoryName.includes('mobile') || categoryName.includes('audio')) {
          descriptionCategory = 'electronics';
        } else if (categoryName.includes('home') || categoryName.includes('kitchen') || categoryName.includes('dining') || categoryName.includes('furniture')) {
          descriptionCategory = 'home';
        } else if (categoryName.includes('sports') || categoryName.includes('fitness') || categoryName.includes('jersey')) {
          descriptionCategory = 'sports';
        }

        // Get random description from the category
        const categoryDescriptions = descriptions[descriptionCategory];
        const randomDescription = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
        
        // Customize the description with product-specific details
        let customDescription = randomDescription;
        
        // Add product-specific enhancements
        if (product.brand) {
          customDescription += ` From the trusted ${product.brand} brand, you can expect consistent quality and reliability.`;
        }
        
        if (product.avgRating > 4) {
          customDescription += ` Highly rated by customers for its exceptional quality and performance.`;
        }
        
        // Add short description (first sentence)
        const shortDescription = customDescription.split('.')[0] + '.';

        await prisma.product.update({
          where: { id: product.id },
          data: {
            description: customDescription,
            shortDescription: shortDescription
          }
        });

        updated++;
        console.log(`✅ Updated: ${product.name} (${product.category?.name || 'Uncategorized'})`);

      } catch (error) {
        console.error(`❌ Error updating ${product.name}:`, error.message);
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`Products updated: ${updated}`);
    console.log(`Products skipped: ${products.length - updated}`);

    // Show some examples
    const sampleProducts = await prisma.product.findMany({
      where: {
        shortDescription: { not: null }
      },
      take: 3,
      select: {
        name: true,
        description: true,
        shortDescription: true,
        category: {
          select: { name: true }
        }
      }
    });

    console.log('\n🌟 SAMPLE ENHANCED DESCRIPTIONS:');
    sampleProducts.forEach(product => {
      console.log(`\n📦 ${product.name} (${product.category?.name})`);
      console.log(`Short: ${product.shortDescription}`);
      console.log(`Full: ${product.description?.substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('Error enhancing descriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enhanceProductDescriptions(); 