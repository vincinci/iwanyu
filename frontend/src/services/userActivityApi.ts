const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://iwanyu-api.onrender.com/api';

export interface RecentlyViewedItem {
  id: string;
  userId: string;
  productId: string;
  viewedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    image?: string;
    images: string[];
    stock: number;
    brand?: string;
    featured: boolean;
    status: string;
    isActive: boolean;
    avgRating: number;
    totalReviews: number;
    category: {
      name: string;
      slug: string;
    };
    seller?: {
      businessName?: string;
    };
  };
}

export interface ComparisonItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  image?: string;
  images: string[];
  stock: number;
  brand?: string;
  featured: boolean;
  status: string;
  isActive: boolean;
  avgRating: number;
  totalReviews: number;
  category: {
    name: string;
    slug: string;
  };
  seller?: {
    businessName?: string;
  };
  attributes: Array<{
    id: string;
    name: string;
    value: string;
    sortOrder: number;
  }>;
}

class UserActivityApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Recently Viewed Products
  async getRecentlyViewed(limit?: number): Promise<{
    success: boolean;
    data: {
      items: RecentlyViewedItem[];
      count: number;
    };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/user-activity/recently-viewed?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get recently viewed products' }));
      throw new Error(errorData.error || 'Failed to get recently viewed products');
    }

    return response.json();
  }

  async addToRecentlyViewed(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/user-activity/recently-viewed/${productId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to record product view' }));
      throw new Error(errorData.error || 'Failed to record product view');
    }

    return response.json();
  }

  async clearRecentlyViewed(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/user-activity/recently-viewed`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to clear recently viewed products' }));
      throw new Error(errorData.error || 'Failed to clear recently viewed products');
    }

    return response.json();
  }

  // Product Comparisons
  async getComparisons(): Promise<{
    success: boolean;
    data: {
      items: ComparisonItem[];
      count: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/user-activity/comparisons`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get product comparisons' }));
      throw new Error(errorData.error || 'Failed to get product comparisons');
    }

    return response.json();
  }

  async addToComparisons(productId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
      userId: string;
      productId: string;
      createdAt: string;
      product: ComparisonItem;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/user-activity/comparisons/${productId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to add product to comparisons' }));
      throw new Error(errorData.error || 'Failed to add product to comparisons');
    }

    return response.json();
  }

  async removeFromComparisons(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/user-activity/comparisons/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to remove product from comparisons' }));
      throw new Error(errorData.error || 'Failed to remove product from comparisons');
    }

    return response.json();
  }

  async clearComparisons(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/user-activity/comparisons`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to clear comparisons' }));
      throw new Error(errorData.error || 'Failed to clear comparisons');
    }

    return response.json();
  }
}

export const userActivityApi = new UserActivityApi(); 