import express from 'express';
import { authenticateToken, requireSeller } from '../middleware/auth';
import AdvertisementService, { CreateCampaignData } from '../services/advertisementService';
import { AdType, AdPlacement } from '../../generated/prisma';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create a new ad campaign
router.post('/campaigns', authenticateToken, requireSeller, async (req: AuthRequest, res) => {
  try {
    const sellerId = req.user?.seller?.id;
    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID not found' });
    }

    const campaignData: CreateCampaignData = {
      sellerId,
      name: req.body.name,
      description: req.body.description,
      budget: parseFloat(req.body.budget),
      dailyBudget: req.body.dailyBudget ? parseFloat(req.body.dailyBudget) : undefined,
      bidAmount: parseFloat(req.body.bidAmount),
      adType: req.body.adType as AdType,
      placement: req.body.placement as AdPlacement,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      productIds: req.body.productIds
    };

    const result = await AdvertisementService.createCampaign(campaignData);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get seller's campaigns
router.get('/campaigns', authenticateToken, requireSeller, async (req: AuthRequest, res) => {
  try {
    const sellerId = req.user?.seller?.id;
    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID not found' });
    }

    const campaigns = await AdvertisementService.getSellerCampaigns(sellerId);
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error: any) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process ad payment
router.post('/campaigns/:campaignId/payment', authenticateToken, requireSeller, async (req: AuthRequest, res) => {
  try {
    const { campaignId } = req.params;
    const paymentData = {
      amount: parseFloat(req.body.amount),
      paymentMethod: req.body.paymentMethod,
      paymentReference: req.body.paymentReference
    };

    const payment = await AdvertisementService.processAdPayment(campaignId, paymentData);
    res.json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Track ad click
router.post('/click/:adId', async (req: AuthRequest, res) => {
  try {
    const { adId } = req.params;
    const userId = req.user?.id;

    const click = await AdvertisementService.trackAdClick(adId, req, userId);
    res.json({
      success: true,
      data: click
    });
  } catch (error: any) {
    console.error('Error tracking click:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get home page ads
router.get('/home/:placement', async (req, res) => {
  try {
    const { placement } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const ads = await AdvertisementService.getHomePageAds(placement as AdPlacement, limit);
    res.json({
      success: true,
      data: ads
    });
  } catch (error: any) {
    console.error('Error getting home page ads:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get promoted products for search
router.get('/promoted-products', async (req, res) => {
  try {
    const searchQuery = req.query.q as string;
    const categoryId = req.query.categoryId as string;
    const limit = parseInt(req.query.limit as string) || 3;

    const products = await AdvertisementService.getPromotedProducts(searchQuery, categoryId, limit);
    res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Error getting promoted products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get ad pricing info
router.get('/pricing', async (req, res) => {
  try {
    const pricing = {
      placements: {
        HOME_BANNER: {
          name: 'Home Page Banner',
          description: 'Premium banner placement on home page',
          minBid: 500, // RWF
          suggestedBid: 1000,
          impressionsPerDay: 5000
        },
        HOME_FEATURED: {
          name: 'Home Featured Section',
          description: 'Featured products section on home page',
          minBid: 300,
          suggestedBid: 600,
          impressionsPerDay: 3000
        },
        SEARCH_TOP: {
          name: 'Search Results Top',
          description: 'Top of search results',
          minBid: 200,
          suggestedBid: 400,
          impressionsPerDay: 2000
        },
        CATEGORY_TOP: {
          name: 'Category Page Top',
          description: 'Top of category pages',
          minBid: 150,
          suggestedBid: 300,
          impressionsPerDay: 1500
        }
      },
      adTypes: {
        PRODUCT_PROMOTION: 'Promote specific products',
        BRAND_AWARENESS: 'Increase brand visibility',
        CATEGORY_BOOST: 'Boost category presence',
        FLASH_SALE: 'Promote flash sale items'
      }
    };

    res.json({
      success: true,
      data: pricing
    });
  } catch (error: any) {
    console.error('Error getting pricing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 