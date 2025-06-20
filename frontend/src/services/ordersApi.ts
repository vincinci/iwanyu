import api from './api';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
}

export interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  shippingAddress?: unknown;
  guestEmail?: string;
  guestPhone?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

// Get user's orders
export const getUserOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<OrdersResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.status) searchParams.append('status', params.status);

  const response = await api.get(`/orders?${searchParams}`);
  return response.data;
};

// Get specific order
export const getOrder = async (orderId: string): Promise<OrderResponse> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/orders/${orderId}/cancel`);
  return response.data;
};

// Create order
export const createOrder = async (orderData: {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress?: unknown;
  couponCode?: string;
  notes?: string;
  isGuest?: boolean;
}): Promise<{ success: boolean; data: { id: string } }> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export default {
  getUserOrders,
  getOrder,
  cancelOrder,
  createOrder,
}; 