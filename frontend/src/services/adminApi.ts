const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Admin Dashboard Types
export interface AdminDashboard {
  overview: {
    userCount: number;
    sellerCount: number;
    productCount: number;
    orderCount: number;
    categoryCount: number;
  };
  sellerStatusCounts: Array<{
    status: string;
    _count: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber?: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
    orderItems: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        name: string;
        price: number;
        image?: string;
      };
    }>;
  }>;
  monthlyRevenue: Array<{
    createdAt: string;
    _sum: {
      total: number;
    };
  }>;
}

// User Management Types
export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'CUSTOMER' | 'ADMIN' | 'SELLER';
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    businessName?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  };
  _count: {
    orders: number;
  };
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Seller Management Types
export interface AdminSeller {
  id: string;
  userId: string;
  businessName?: string;
  businessEmail: string;
  businessPhone?: string;
  businessAddress?: string;
  businessDescription?: string;
  businessType?: string;
  nationalId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
  };
  _count: {
    products: number;
  };
}

export interface SellersResponse {
  sellers: AdminSeller[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Product Management Types
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  image?: string;
  images: string[];
  stock: number;
  sku?: string;
  brand?: string;
  featured: boolean;
  status: string;
  isActive: boolean;
  categoryId: string;
  sellerId?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    name: string;
    slug: string;
  };
  seller?: {
    businessName?: string;
    user: {
      email: string;
      firstName?: string;
      lastName?: string;
    };
  };
  variants?: Array<{
    id: string;
    name: string;
    value: string;
    price?: number;
    stock: number;
    sku?: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
  }>;
}

export interface ProductsResponse {
  products: AdminProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Category Management Types
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

// Order Management Types
export interface AdminOrder {
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
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      price: number;
      image?: string;
    };
  }>;
}

export interface OrdersResponse {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AdminApi {
  private baseUrl = API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getDashboard(): Promise<AdminDashboard> {
    const response = await fetch(`${this.baseUrl}/admin/dashboard`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard data');
    }

    return response.json();
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);

    const response = await fetch(`${this.baseUrl}/admin/users?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    return response.json();
  }

  async updateUser(id: string, data: {
    role?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<{ message: string; user: AdminUser }> {
    const response = await fetch(`${this.baseUrl}/admin/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }

    return response.json();
  }

  async getSellers(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<SellersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(`${this.baseUrl}/admin/sellers?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch sellers');
    }

    return response.json();
  }

  async updateSellerStatus(id: string, status: string): Promise<{ message: string; seller: AdminSeller }> {
    const response = await fetch(`${this.baseUrl}/admin/sellers/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update seller status');
    }

    return response.json();
  }

  async getSellerDocument(id: string): Promise<{
    seller: {
      id: string;
      businessName?: string;
      ownerName: string;
      email: string;
    };
    document: {
      fileName: string;
      fileSize: number;
      fileType: string;
      uploadedAt: string;
      downloadUrl: string;
      viewUrl: string;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/admin/sellers/${id}/document`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No document found for this seller');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch seller document');
    }

    return response.json();
  }

  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(`${this.baseUrl}/admin/products?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch products');
    }

    return response.json();
  }

  async updateProduct(id: string, data: unknown): Promise<{ message: string; product: AdminProduct }> {
    const response = await fetch(`${this.baseUrl}/admin/products/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }

    return response.json();
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }

    return response.json();
  }

  async bulkDeleteProducts(productIds: string[]): Promise<{ message: string; deletedCount: number }> {
    const response = await fetch(`${this.baseUrl}/admin/products/bulk-delete`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete products');
    }

    return response.json();
  }

  async getCategories(): Promise<AdminCategory[]> {
    const response = await fetch(`${this.baseUrl}/admin/categories`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch categories');
    }

    return response.json();
  }

  async createCategory(data: {
    name: string;
    description?: string;
    image?: string;
  }): Promise<{ message: string; category: AdminCategory }> {
    const response = await fetch(`${this.baseUrl}/admin/categories`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }

    return response.json();
  }

  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    image?: string;
  }): Promise<{ message: string; category: AdminCategory }> {
    const response = await fetch(`${this.baseUrl}/admin/categories/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }

    return response.json();
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }

    return response.json();
  }

  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<OrdersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(`${this.baseUrl}/admin/orders?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch orders');
    }

    return response.json();
  }

  async updateOrderStatus(id: string, status: string): Promise<{ message: string; order: AdminOrder }> {
    const response = await fetch(`${this.baseUrl}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update order status');
    }

    return response.json();
  }

  async getPayouts(params: {
    page?: number;
    limit?: number;
    status?: string;
    sellerId?: string;
    startDate?: string;
    endDate?: string;
    payoutMethod?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<unknown> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/admin/payouts?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch payouts');
    }

    return response.json();
  }

  async getSellerWallets(page = 1, limit = 20, search = ''): Promise<unknown> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    if (search) searchParams.append('search', search);

    const response = await fetch(`${this.baseUrl}/admin/seller-wallets?${searchParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch seller wallets');
    }

    return response.json();
  }

  async getSellerWalletDetails(sellerId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/admin/seller-wallets/${sellerId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch seller wallet details');
    }

    return response.json();
  }

  async updatePayoutStatus(payoutId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/admin/payouts/${payoutId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update payout status');
    }

    return response.json();
  }

  async createManualPayout(payoutData: {
    sellerId: string;
    amount: number;
    payoutMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY';
    accountDetails: unknown;
    narration?: string;
    adminNotes?: string;
  }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/admin/payouts/manual`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payoutData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create manual payout');
    }

    return response.json();
  }

  async getPayoutAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/admin/payout-analytics?period=${period}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch payout analytics');
    }

    return response.json();
  }

  async importProducts(csvFile: File): Promise<{ 
    message: string; 
    results: { 
      successful: number; 
      failed: number; 
      errors: string[];
      warnings?: string[];
    } 
  }> {
    const formData = new FormData();
    formData.append('csvFile', csvFile);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/admin/products/import`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to import products');
    }

    return response.json();
  }
}

export const adminApi = new AdminApi(); 