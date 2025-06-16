const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
}

export interface ValidatedCoupon extends Coupon {
  discountAmount: number;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId?: string;
  usedAt: string;
  coupon: {
    code: string;
    name: string;
    type: string;
    value: number;
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

  async validateCoupon(
    code: string,
    orderAmount: number
  ): Promise<{
    success: boolean;
    data: {
      coupon: ValidatedCoupon;
      valid: boolean;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code, orderAmount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to validate coupon');
    }

    return response.json();
  }

  async applyCoupon(
    couponId: string,
    orderId?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/coupons/apply`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ couponId, orderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to apply coupon');
    }

    return response.json();
  }

  async getCouponUsage(): Promise<{
    success: boolean;
    data: CouponUsage[];
  }> {
    const response = await fetch(`${API_BASE_URL}/coupons/usage`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get coupon usage');
    }

    return response.json();
  }

  async getAvailableCoupons(): Promise<{
    success: boolean;
    data: Coupon[];
  }> {
    const response = await fetch(`${API_BASE_URL}/coupons/available`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get available coupons');
    }

    return response.json();
  }
}

export const couponsApi = new CouponsApi(); 