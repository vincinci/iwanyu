const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  subtotal?: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus?: string;
  paymentMethod?: string;
  shipping?: number;
  shippingCost: number;
  tax: number;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image?: string;
      images: string[];
    };
  }>;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class OrdersApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  } = {}): Promise<OrdersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.userId) searchParams.append('userId', params.userId);

    const response = await fetch(`${API_BASE_URL}/orders?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch orders' }));
      throw new Error(errorData.error || 'Failed to fetch orders');
    }

    return response.json();
  }

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch order' }));
      throw new Error(errorData.error || 'Failed to fetch order');
    }

    return response.json();
  }

  async updateOrderStatus(id: string, status: string): Promise<{ message: string; order: Order }> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update order status' }));
      throw new Error(errorData.error || 'Failed to update order status');
    }

    return response.json();
  }

  async cancelOrder(id: string, reason?: string): Promise<{ message: string; order: Order }> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to cancel order' }));
      throw new Error(errorData.error || 'Failed to cancel order');
    }

    return response.json();
  }
}

export const ordersApi = new OrdersApi(); 





// Properly exported functions from the class instance
export const getUserOrders = (params: any) => ordersApi.getOrders(params);
export const getOrder = (id: string) => ordersApi.getOrder(id);
export const cancelOrder = (id: string, reason?: string) => ordersApi.cancelOrder(id, reason);

// Aliases for compatibility
export const getOrders = (params: any) => ordersApi.getOrders(params);
export const getOrderById = (id: string) => ordersApi.getOrder(id);
export const updateOrderStatus = (id: string, status: string) => ordersApi.updateOrderStatus(id, status);
