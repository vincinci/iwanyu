import express, { Request, Response } from 'express';
import prisma from '../utils/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'newest' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { productId };

    if (rating && rating !== 'all') {
      where.rating = Number(rating);
    }

    let orderBy: any = { createdAt: 'desc' };
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [reviews, total, avgRating, ratingDistribution] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { rating: true }
      })
    ]);

    // Create rating distribution object
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        stats: {
          averageRating: avgRating._avg.rating || 0,
          totalReviews: avgRating._count.rating,
          distribution
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Create a review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, rating, title, comment, images = [] } = req.body;

    if (!productId || !rating) {
      res.status(400).json({ error: 'Product ID and rating are required' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingReview) {
      res.status(400).json({ error: 'You have already reviewed this product' });
      return;
    }

    // Check if user has purchased this product (for verified purchase)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: {
            in: ['DELIVERED']
          }
        }
      }
    });

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        comment,
        images,
        isVerifiedPurchase: !!hasPurchased
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update product rating statistics
    const [avgRating, totalReviews] = await Promise.all([
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      prisma.review.count({ where: { productId } })
    ]);

    await prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: avgRating._avg.rating || 0,
        totalReviews
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (existingReview.userId !== userId) {
      res.status(403).json({ error: 'You can only edit your own reviews' });
      return;
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
        ...(images && { images })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update product rating if rating changed
    if (rating) {
      const [avgRating, totalReviews] = await Promise.all([
        prisma.review.aggregate({
          where: { productId: existingReview.productId },
          _avg: { rating: true },
          _count: { rating: true }
        }),
        prisma.review.count({ where: { productId: existingReview.productId } })
      ]);

      await prisma.product.update({
        where: { id: existingReview.productId },
        data: {
          avgRating: avgRating._avg.rating || 0,
          totalReviews
        }
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (existingReview.userId !== userId) {
      res.status(403).json({ error: 'You can only delete your own reviews' });
      return;
    }

    // Delete review
    await prisma.review.delete({
      where: { id }
    });

    // Update product rating statistics
    const [avgRating, totalReviews] = await Promise.all([
      prisma.review.aggregate({
        where: { productId: existingReview.productId },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      prisma.review.count({ where: { productId: existingReview.productId } })
    ]);

    await prisma.product.update({
      where: { id: existingReview.productId },
      data: {
        avgRating: avgRating._avg.rating || 0,
        totalReviews
      }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Mark review as helpful/unhelpful
router.post('/:id/helpful', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id: reviewId } = req.params;
    const { isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      res.status(400).json({ error: 'isHelpful must be a boolean' });
      return;
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // Check if user is trying to vote on their own review
    if (review.userId === userId) {
      res.status(400).json({ error: 'You cannot vote on your own review' });
      return;
    }

    // Check if user has already voted on this review
    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });

    if (existingVote) {
      // Update existing vote
      await prisma.reviewHelpful.update({
        where: { id: existingVote.id },
        data: { isHelpful }
      });
    } else {
      // Create new vote
      await prisma.reviewHelpful.create({
        data: {
          userId,
          reviewId,
          isHelpful
        }
      });
    }

    // Update helpful count on review
    const helpfulCount = await prisma.reviewHelpful.count({
      where: {
        reviewId,
        isHelpful: true
      }
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount }
    });

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: { helpfulCount }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Get user's reviews
router.get('/user', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              price: true
            }
          }
        }
      }),
      prisma.review.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to get user reviews' });
  }
});

export default router; 