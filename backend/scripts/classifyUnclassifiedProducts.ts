import prisma from '../src/utils/db';

// Example mapping: keyword -> category slug
const keywordCategoryMap: { [keyword: string]: string } = {
  'phone': 'electronics',
  'laptop': 'electronics',
  'shirt': 'fashion',
  'shoe': 'fashion',
  'book': 'books',
  'sofa': 'home-furniture',
  // Add more mappings as needed
};

async function determineCategoryId(product: { name: string; description: string }) {
  const text = (product.name + ' ' + product.description).toLowerCase();
  for (const keyword in keywordCategoryMap) {
    if (text.includes(keyword)) {
      // Find the category by slug
      const category = await prisma.category.findFirst({ where: { slug: keywordCategoryMap[keyword] } });
      if (category) return category.id;
    }
  }
  return null; // No match found
}

async function classifyUnclassifiedProducts() {
  // Find the 'General' category
  const generalCategory = await prisma.category.findFirst({ where: { slug: 'general' } });
  if (!generalCategory) {
    console.log('No General category found.');
    return;
  }

  // Find all products in the General category
  const unclassifiedProducts = await prisma.product.findMany({
    where: { categoryId: generalCategory.id },
    select: { id: true, name: true, description: true }
  });

  if (unclassifiedProducts.length === 0) {
    console.log('No unclassified products found.');
    return;
  }

  console.log(`Found ${unclassifiedProducts.length} unclassified products:`);
  let classified = 0;
  for (const product of unclassifiedProducts) {
    const newCategoryId = await determineCategoryId(product);
    if (newCategoryId && newCategoryId !== generalCategory.id) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: newCategoryId }
      });
      console.log(`Product ${product.name} moved to new category.`);
      classified++;
    } else {
      console.log(`- ${product.id}: ${product.name} (no match)`);
    }
  }
  console.log(`\n${classified} products classified automatically.`);
  await prisma.$disconnect();
}

classifyUnclassifiedProducts(); 