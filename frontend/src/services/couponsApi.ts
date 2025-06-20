const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Coupon {
  id: string;
  code: string;
  type: 'FIXED' | 'PERCENTAGE';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  description?: string;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: string;
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  order: {
    orderNumber?: string;
    total: number;
  };
}

export interface CouponsResponse {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class CouponsApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getCoupons(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
  } = {}): Promise<CouponsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/admin/coupons?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to fetch coupons');
    }

    return response.json();
  }

  async createCoupon(data: {
    code: string;
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    description?: string;
    expiryDate?: string;
    usageLimit?: number;
  }): Promise<{ message: string; coupon: Coupon }> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to create coupon');
    }

    return response.json();
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<{ message: string; coupon: Coupon }> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to update coupon');
    }

    return response.json();
  }

  async deleteCoupon(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to delete coupon');
    }

    return response.json();
  }

  async getCouponUsage(couponId: string): Promise<CouponUsage[]> {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/${couponId}/usage`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to fetch coupon usage');
    }

    return response.json();
  }

  async validateCoupon(code: string, orderTotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    error?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code, orderTotal }),
    });

    if (!response.ok) {

      throw new Error((errorResponse as any).error || 'Failed to validate coupon');
    }

    return response.json();
  }
}

export const couponsApi = new CouponsApi(); 