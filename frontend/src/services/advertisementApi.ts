import api from './api';

export interface PromotedProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  isPromoted: true;
  adId: string;
  campaignId: string;
  seller?: {
    businessName?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      name?: string;
    };
  };
}

export interface AdCampaign {
  id: string;
  name: string;
  description?: string;
  budget: number;
  dailyBudget?: number;
  bidAmount: number;
  adType: string;
  placement: string;
  startDate: string;
  endDate: string;
  status: string;
  totalSpent: number;
  totalClicks: number;
  totalImpressions: number;
}

export interface AdPricing {
  placements: {
    [key: string]: {
      name: string;
      description: string;
      minBid: number;
      suggestedBid: number;
      impressionsPerDay: number;
    };
  };
  adTypes: {
    [key: string]: string;
  };
}

export const advertisementApi = {
  // Get promoted products for home page
  getHomePageAds: async (placement: string, limit: number = 5) => {
    const response = await api.get(`/advertisements/home/${placement}?limit=${limit}`);
    return response.data;
  },

  // Get promoted products for search results
  getPromotedProducts: async (searchQuery?: string, categoryId?: string, limit: number = 3) => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (categoryId) params.append('categoryId', categoryId);
    params.append('limit', limit.toString());

    const response = await api.get(`/advertisements/promoted?${params}`);
    return response.data;
  },

  // Track ad click
  trackClick: async (adId: string) => {
    try {
      const response = await api.post(`/advertisements/click/${adId}`);
      return response.data;
    } catch (error) {
      console.error('Error tracking ad click:', error);
      // Don't throw error to avoid disrupting user experience
      return null;
    }
  },

  // Get ad pricing information
  getPricing: async (): Promise<{ success: boolean; data: AdPricing }> => {
    const response = await api.get('/advertisements/pricing');
    return response.data;
  },

  // Seller campaign management
  createCampaign: async (campaignData: {
    name: string;
    description?: string;
    budget: number;
    dailyBudget?: number;
    bidAmount: number;
    adType: string;
    placement: string;
    startDate: string;
    endDate: string;
    productIds: string[];
  }) => {
    const response = await api.post('/advertisements/campaigns', campaignData);
    return response.data;
  },

  getCampaigns: async () => {
    const response = await api.get('/advertisements/campaigns');
    return response.data;
  },

  processPayment: async (campaignId: string, paymentData: {
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
  }) => {
    const response = await api.post(`/advertisements/campaigns/${campaignId}/payment`, paymentData);
    return response.data;
  }
};

export default advertisementApi; 