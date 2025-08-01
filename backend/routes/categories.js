const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const parentId = req.query.parentId || undefined;
    const includeProducts = req.query.includeProducts === 'true';
    
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: parentId === 'null' ? null : parentId,
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' },
          ],
        },
        ...(includeProducts && {
          products: {
            where: { isActive: true },
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              images: true,
              rating: true,
              reviewCount: true,
            },
          },
        }),
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });
    
    // Convert prices from cents to RWF
    const categoriesWithPrices = categories.map(category => ({
      ...category,
      products: category.products?.map(product => ({
        ...product,
        price: product.price / 100,
        salePrice: product.salePrice ? product.salePrice / 100 : null,
      })),
    }));
    
    res.json({
      categories: categoriesWithPrices,
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
