const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
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

export interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    count: number;
  };
}

class WishlistApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getWishlist(): Promise<WishlistResponse> {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get wishlist' }));
      throw new Error(errorData.error || 'Failed to get wishlist');
    }

    return response.json();
  }

  async addToWishlist(productId: string): Promise<{ success: boolean; message: string; data: WishlistItem }> {
    console.log('🌐 Making API call to add to wishlist:', productId);
    console.log('🔑 Auth headers:', this.getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    console.log('📡 API Response status:', response.status);

    if (!response.ok) {

      console.error('❌ API Error response:', error);
      const errorData = { error: 'Request failed' };
      throw new Error(errorData.error || 'Failed to add to wishlist');
    }

    const result = await response.json();
    console.log('✅ API Success response:', result);
    return result;
  }

  async removeFromWishlist(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to remove from wishlist' }));
      throw new Error(errorData.error || 'Failed to remove from wishlist');
    }

    return response.json();
  }

  async clearWishlist(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to clear wishlist' }));
      throw new Error(errorData.error || 'Failed to clear wishlist');
    }

    return response.json();
  }

  async checkInWishlist(productId: string): Promise<{ success: boolean; data: { inWishlist: boolean } }> {
    const response = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to check wishlist status' }));
      throw new Error(errorData.error || 'Failed to check wishlist status');
    }

    return response.json();
  }

  async moveToCart(productId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}/move-to-cart`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to move to cart' }));
      throw new Error(errorData.error || 'Failed to move to cart');
    }

    return response.json();
  }
}

export const wishlistApi = new WishlistApi(); 