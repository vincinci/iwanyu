import { PrismaClient, AdStatus, AdType, AdPlacement, PaymentStatus } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export interface CreateCampaignData {
  sellerId: string;
  name: string;
  description?: string;
  budget: number;
  dailyBudget?: number;
  bidAmount: number;
  adType: AdType;
  placement: AdPlacement;
  startDate: Date;
  endDate: Date;
  productIds: string[];
}

export interface CreateAdvertisementData {
  campaignId: string;
  productId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetKeywords?: string[];
}

export class AdvertisementService {
  // Create a new ad campaign
  static async createCampaign(data: CreateCampaignData) {
    try {
      // Validate seller exists and is active
      const seller = await prisma.seller.findFirst({
        where: {
          id: data.sellerId,
          status: 'APPROVED',
          isActive: true
        }
      });

      if (!seller) {
        throw new Error('Seller not found or not approved');
      }

      // Validate products belong to seller
      const products = await prisma.product.findMany({
        where: {
          id: { in: data.productIds },
          sellerId: data.sellerId,
          isActive: true
        }
      });

      if (products.length !== data.productIds.length) {
        throw new Error('Some products not found or do not belong to seller');
      }

      // Create campaign
      const campaign = await prisma.adCampaign.create({
        data: {
          sellerId: data.sellerId,
          name: data.name,
          description: data.description,
          budget: data.budget,
          dailyBudget: data.dailyBudget,
          bidAmount: data.bidAmount,
          adType: data.adType,
          placement: data.placement,
          startDate: data.startDate,
          endDate: data.endDate,
          status: AdStatus.PENDING
        }
      });

      // Create advertisements for each product
      const advertisements = await Promise.all(
        data.productIds.map(async (productId) => {
          const product = products.find(p => p.id === productId);
          return prisma.advertisement.create({
            data: {
              campaignId: campaign.id,
              productId,
              title: product?.name || 'Product Advertisement',
              description: product?.shortDescription,
              imageUrl: product?.images?.[0],
              targetKeywords: product?.tags || []
            }
          });
        })
      );

      return {
        campaign,
        advertisements
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Process ad payment
  static async processAdPayment(campaignId: string, paymentData: {
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
  }) {
    try {
      const campaign = await prisma.adCampaign.findUnique({
        where: { id: campaignId },
        include: { seller: true }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Create payment record
      const payment = await prisma.adPayment.create({
        data: {
          campaignId,
          sellerId: campaign.sellerId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          paymentReference: paymentData.paymentReference,
          status: PaymentStatus.COMPLETED,
          paidAt: new Date()
        }
      });

      // Update campaign status to APPROVED if payment successful
      await prisma.adCampaign.update({
        where: { id: campaignId },
        data: { status: AdStatus.APPROVED }
      });

      return payment;
    } catch (error) {
      console.error('Error processing ad payment:', error);
      throw error;
    }
  }

  // Get active advertisements for home page
  static async getHomePageAds(placement: AdPlacement, limit: number = 5) {
    try {
      const now = new Date();
      
      const ads = await prisma.advertisement.findMany({
        where: {
          isActive: true,
          campaign: {
            status: AdStatus.ACTIVE,
            placement,
            startDate: { lte: now },
            endDate: { gte: now }
          }
        },
        include: {
          product: {
            include: {
              seller: {
                include: {
                  user: true
                }
              }
            }
          },
          campaign: true
        },
        orderBy: [
          { campaign: { bidAmount: 'desc' } },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      // Update impressions
      await Promise.all(
        ads.map(ad => 
          prisma.advertisement.update({
            where: { id: ad.id },
            data: { impressions: { increment: 1 } }
          })
        )
      );

      return ads;
    } catch (error) {
      console.error('Error getting home page ads:', error);
      return [];
    }
  }

  // Track ad click
  static async trackAdClick(
    advertisementId: string,
    req: Request,
    userId?: string
  ) {
    try {
      const advertisement = await prisma.advertisement.findUnique({
        where: { id: advertisementId },
        include: { campaign: true }
      });

      if (!advertisement) {
        throw new Error('Advertisement not found');
      }

      const campaign = advertisement.campaign;
      const clickCost = campaign.bidAmount;

      // Check if campaign has budget
      if (campaign.totalSpent + clickCost > campaign.budget) {
        // Pause campaign if budget exceeded
        await prisma.adCampaign.update({
          where: { id: campaign.id },
          data: { status: AdStatus.PAUSED }
        });
        throw new Error('Campaign budget exceeded');
      }

      // Create click record
      const click = await prisma.adClick.create({
        data: {
          campaignId: campaign.id,
          advertisementId,
          userId,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          cost: clickCost,
          placement: campaign.placement
        }
      });

      // Update campaign and advertisement stats
      await Promise.all([
        prisma.adCampaign.update({
          where: { id: campaign.id },
          data: {
            totalSpent: { increment: clickCost },
            totalClicks: { increment: 1 }
          }
        }),
        prisma.advertisement.update({
          where: { id: advertisementId },
          data: { clicks: { increment: 1 } }
        })
      ]);

      return click;
    } catch (error) {
      console.error('Error tracking ad click:', error);
      throw error;
    }
  }

  // Get seller's campaigns
  static async getSellerCampaigns(sellerId: string) {
    try {
      return await prisma.adCampaign.findMany({
        where: { sellerId },
        include: {
          advertisements: {
            include: {
              product: true
            }
          },
          payments: true,
          _count: {
            select: {
              clicks: true,
              advertisements: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting seller campaigns:', error);
      throw error;
    }
  }

  // Get campaign analytics
  static async getCampaignAnalytics(campaignId: string, sellerId: string) {
    try {
      const campaign = await prisma.adCampaign.findFirst({
        where: {
          id: campaignId,
          sellerId
        },
        include: {
          advertisements: {
            include: {
              product: true
            }
          },
          clicks: {
            orderBy: { clickedAt: 'desc' },
            take: 100
          },
          payments: true
        }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Calculate metrics
      const totalImpressions = campaign.advertisements.reduce(
        (sum, ad) => sum + ad.impressions, 0
      );
      const totalClicks = campaign.totalClicks;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const avgCpc = totalClicks > 0 ? campaign.totalSpent / totalClicks : 0;

      return {
        campaign,
        metrics: {
          totalImpressions,
          totalClicks,
          totalSpent: campaign.totalSpent,
          ctr: Math.round(ctr * 100) / 100,
          avgCpc: Math.round(avgCpc * 100) / 100,
          remainingBudget: campaign.budget - campaign.totalSpent
        }
      };
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  // Activate approved campaigns
  static async activateCampaigns() {
    try {
      const now = new Date();
      
      const campaignsToActivate = await prisma.adCampaign.findMany({
        where: {
          status: AdStatus.APPROVED,
          startDate: { lte: now },
          endDate: { gte: now }
        }
      });

      await Promise.all(
        campaignsToActivate.map(campaign =>
          prisma.adCampaign.update({
            where: { id: campaign.id },
            data: { status: AdStatus.ACTIVE }
          })
        )
      );

      return campaignsToActivate.length;
    } catch (error) {
      console.error('Error activating campaigns:', error);
      return 0;
    }
  }

  // Complete expired campaigns
  static async completeExpiredCampaigns() {
    try {
      const now = new Date();
      
      const expiredCampaigns = await prisma.adCampaign.findMany({
        where: {
          status: AdStatus.ACTIVE,
          endDate: { lt: now }
        }
      });

      await Promise.all(
        expiredCampaigns.map(campaign =>
          prisma.adCampaign.update({
            where: { id: campaign.id },
            data: { status: AdStatus.COMPLETED }
          })
        )
      );

      return expiredCampaigns.length;
    } catch (error) {
      console.error('Error completing expired campaigns:', error);
      return 0;
    }
  }

  // Get promoted products for search results
  static async getPromotedProducts(
    searchQuery?: string,
    categoryId?: string,
    limit: number = 3
  ) {
    try {
      const now = new Date();
      
      const whereClause: any = {
        isActive: true,
        campaign: {
          status: AdStatus.ACTIVE,
          placement: {
            in: [AdPlacement.SEARCH_TOP, AdPlacement.CATEGORY_TOP]
          },
          startDate: { lte: now },
          endDate: { gte: now }
        }
      };

      // Add search query filter
      if (searchQuery) {
        whereClause.OR = [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { targetKeywords: { hasSome: [searchQuery] } },
          { product: { name: { contains: searchQuery, mode: 'insensitive' } } }
        ];
      }

      // Add category filter
      if (categoryId) {
        whereClause.product = {
          categoryId
        };
      }

      const ads = await prisma.advertisement.findMany({
        where: whereClause,
        include: {
          product: {
            include: {
              seller: {
                include: {
                  user: true
                }
              }
            }
          },
          campaign: true
        },
        orderBy: [
          { campaign: { bidAmount: 'desc' } },
          { priority: 'desc' }
        ],
        take: limit
      });

      // Update impressions
      await Promise.all(
        ads.map(ad => 
          prisma.advertisement.update({
            where: { id: ad.id },
            data: { impressions: { increment: 1 } }
          })
        )
      );

      return ads.map(ad => ({
        ...ad.product,
        isPromoted: true,
        adId: ad.id,
        campaignId: ad.campaignId
      }));
    } catch (error) {
      console.error('Error getting promoted products:', error);
      return [];
    }
  }
}

export default AdvertisementService; 