const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    image?: string;
    price: number;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats: ReviewStats;
  };
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

class ReviewsApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getProductReviews(
    productId: string,
    options: {
      page?: number;
      limit?: number;
      rating?: number | 'all';
      sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    } = {}
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.rating && options.rating !== 'all') params.append('rating', options.rating.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);

    const }/reviews/product/${productId}?${params}`);

    if (!response.ok) {
      const 
      throw new Error(error.error || 'Failed to get reviews');
    }

    return response.json();
  }

  async createReview(data: CreateReviewData): Promise<{ success: boolean; message: string; data: Review }> {
    const }/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const 
      throw new Error(error.error || 'Failed to create review');
    }

    return response.json();
  }

  async updateReview(
    reviewId: string,
    data: UpdateReviewData
  ): Promise<{ success: boolean; message: string; data: Review }> {
    const }/reviews/${reviewId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const 
      throw new Error(error.error || 'Failed to update review');
    }

    return response.json();
  }

  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    const }/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const 
      throw new Error(error.error || 'Failed to delete review');
    }

    return response.json();
  }

  async markReviewHelpful(
    reviewId: string,
    isHelpful: boolean
  ): Promise<{ success: boolean; message: string; data: { helpfulCount: number } }> {
    const }/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isHelpful }),
    });

    if (!response.ok) {
      const 
      throw new Error(error.error || 'Failed to record vote');
    }

    return response.json();
  }

  async getUserReviews(options: { page?: number; limit?: number } = {}): Promise<{
    success: boolean;
    data: {
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const }/reviews/user?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const 
      throw new Error(error.error || 'Failed to get user reviews');
    }

    return response.json();
  }
}

export const reviewsApi = new ReviewsApi(); 