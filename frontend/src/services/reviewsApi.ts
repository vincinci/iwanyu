const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
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
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ReviewsApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getReviews(productId: string, params: {
    page?: number;
    limit?: number;
    rating?: number | 'all';
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  } = {}): Promise<ReviewsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('productId', productId);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.rating && params.rating !== 'all') {
      searchParams.append('rating', params.rating.toString());
    }
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);

    const response = await fetch(`${API_BASE_URL}/reviews?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to fetch reviews');
    }

    return response.json();
  }

  async createReview(data: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<{ message: string; review: Review }> {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to create review');
    }

    return response.json();
  }

  async updateReview(id: string, data: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<{ message: string; review: Review }> {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to update review');
    }

    return response.json();
  }

  async deleteReview(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to delete review');
    }

    return response.json();
  }

  async voteHelpful(reviewId: string, isHelpful: boolean): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isHelpful }),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to vote on review');
    }

    return response.json();
  }

  async getReviewStats(productId: string): Promise<ReviewStats> {
    const response = await fetch(`${API_BASE_URL}/reviews/stats?productId=${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to fetch review stats');
    }

    return response.json();
  }

  async getUserReviews(userId?: string): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/reviews/user${userId ? `?userId=${userId}` : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to fetch user reviews');
    }

    return response.json();
  }
}

export const reviewsApi = new ReviewsApi(); 