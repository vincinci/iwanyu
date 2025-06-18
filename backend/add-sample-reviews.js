const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleReviews() {
  try {
    console.log('🌟 ADDING SAMPLE REVIEWS TO SHOWCASE REVIEW SYSTEM');
    console.log('=' .repeat(60));

    // Get some users and products
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, firstName: true, lastName: true }
    });

    const products = await prisma.product.findMany({
      take: 15,
      select: { id: true, name: true, price: true }
    });

    if (users.length === 0) {
      console.log('⚠️ No users found. Please create some users first.');
      return;
    }

    if (products.length === 0) {
      console.log('⚠️ No products found. Please add some products first.');
      return;
    }

    console.log(`Found ${users.length} users and ${products.length} products`);

    const sampleReviews = [
      {
        rating: 5,
        title: "Excellent quality!",
        comment: "This product exceeded my expectations. The quality is outstanding and it arrived quickly. Highly recommended!"
      },
      {
        rating: 4,
        title: "Very good product",
        comment: "Good value for money. The product works as described and the customer service was helpful."
      },
      {
        rating: 5,
        title: "Perfect!",
        comment: "Exactly what I was looking for. Great quality, fast shipping, and excellent customer service."
      },
      {
        rating: 3,
        title: "Decent product",
        comment: "The product is okay, but not as good as I expected. It does the job but could be better."
      },
      {
        rating: 5,
        title: "Amazing!",
        comment: "I love this product! It's well-made, stylish, and works perfectly. Will definitely buy again."
      },
      {
        rating: 4,
        title: "Good purchase",
        comment: "Happy with my purchase. The product quality is good and it was delivered on time."
      },
      {
        rating: 5,
        title: "Outstanding!",
        comment: "This is by far the best product I've bought in this category. Excellent build quality and great value."
      },
      {
        rating: 2,
        title: "Not as expected",
        comment: "The product didn't meet my expectations. The quality could be better for the price."
      },
      {
        rating: 4,
        title: "Satisfied",
        comment: "Good product overall. Minor issues but nothing major. Would recommend to others."
      },
      {
        rating: 5,
        title: "Fantastic!",
        comment: "Absolutely love it! Great quality, fast delivery, and excellent customer support."
      }
    ];

    let reviewsCreated = 0;
    let reviewsSkipped = 0;

    // Create reviews for random product-user combinations
    for (let i = 0; i < Math.min(30, products.length * 2); i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

      try {
        // Check if review already exists
        const existingReview = await prisma.review.findUnique({
          where: {
            userId_productId: {
              userId: randomUser.id,
              productId: randomProduct.id
            }
          }
        });

        if (existingReview) {
          reviewsSkipped++;
          continue;
        }

        // Create the review
        await prisma.review.create({
          data: {
            userId: randomUser.id,
            productId: randomProduct.id,
            rating: randomReview.rating,
            title: randomReview.title,
            comment: randomReview.comment,
            isVerifiedPurchase: Math.random() > 0.3, // 70% verified purchases
            helpfulCount: Math.floor(Math.random() * 10),
            isApproved: true
          }
        });

        reviewsCreated++;
        console.log(`✅ Created review: ${randomReview.title} for ${randomProduct.name}`);

      } catch (error) {
        if (error.code === 'P2002') {
          reviewsSkipped++;
        } else {
          console.error('Error creating review:', error.message);
        }
      }
    }

    // Update product ratings
    console.log('\n📊 Updating product ratings...');
    const productsWithReviews = await prisma.product.findMany({
      where: {
        reviews: {
          some: {}
        }
      },
      include: {
        reviews: true
      }
    });

    for (const product of productsWithReviews) {
      const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
      const totalReviews = product.reviews.length;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews
        }
      });
    }

    console.log('\n📈 FINAL STATISTICS:');
    console.log(`Reviews Created: ${reviewsCreated}`);
    console.log(`Reviews Skipped: ${reviewsSkipped}`);
    console.log(`Products with Reviews: ${productsWithReviews.length}`);

    // Show some example products with their ratings
    console.log('\n🌟 SAMPLE PRODUCTS WITH REVIEWS:');
    const sampleProductsWithReviews = await prisma.product.findMany({
      where: {
        avgRating: { gt: 0 }
      },
      take: 5,
      select: {
        name: true,
        avgRating: true,
        totalReviews: true,
        reviews: {
          take: 2,
          select: {
            rating: true,
            title: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    sampleProductsWithReviews.forEach(product => {
      console.log(`\n📦 ${product.name}`);
      console.log(`   ⭐ ${product.avgRating}/5 (${product.totalReviews} reviews)`);
      product.reviews.forEach(review => {
        console.log(`   - "${review.title}" by ${review.user.firstName} ${review.user.lastName} (${review.rating}⭐)`);
      });
    });

  } catch (error) {
    console.error('Error adding sample reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleReviews(); 