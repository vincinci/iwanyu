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
  nationalId?: string; // National ID document path/URL
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
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    console.log('AdminApi.getAuthHeaders: Token exists:', !!token);
    console.log('AdminApi.getAuthHeaders: Token length:', token ? token.length : 0);
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Dashboard
  async getDashboard(): Promise<AdminDashboard> {
    console.log('AdminApi.getDashboard: Starting...');
    console.log('AdminApi.getDashboard: API_BASE_URL:', API_BASE_URL);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: this.getAuthHeaders(),
      });

      console.log('AdminApi.getDashboard: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AdminApi.getDashboard: Error response:', errorText);
        throw new Error(`Failed to fetch dashboard: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AdminApi.getDashboard: Success data:', data);
      return data;
    } catch (error) {
      console.error('AdminApi.getDashboard: Network error:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}): Promise<UsersResponse> {
    console.log('AdminApi.getUsers: Starting with params:', params);
    console.log('AdminApi.getUsers: API_BASE_URL:', API_BASE_URL);
    
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.role) searchParams.set('role', params.role);

    const url = `${API_BASE_URL}/admin/users?${searchParams}`;
    console.log('AdminApi.getUsers: Final URL:', url);
    
    try {
      const headers = this.getAuthHeaders();
      console.log('AdminApi.getUsers: Headers:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('AdminApi.getUsers: Response status:', response.status);
      console.log('AdminApi.getUsers: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AdminApi.getUsers: Error response text:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('AdminApi.getUsers: Error JSON:', errorJson);
          throw new Error(errorJson.error || `HTTP ${response.status}: ${response.statusText}`);
        } catch (parseError) {
          console.error('AdminApi.getUsers: Error parsing error response:', parseError);
          throw new Error(`Failed to get users: HTTP ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('AdminApi.getUsers: Success data received, users count:', data?.users?.length || 0);
      return data;
    } catch (error) {
      console.error('AdminApi.getUsers: Caught error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async updateUser(id: string, data: {
    role?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<{ message: string; user: AdminUser }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }

    return response.json();
  }

  // Seller Management
  async getSellers(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<SellersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);

    const response = await fetch(`${API_BASE_URL}/admin/sellers?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get sellers');
    }

    return response.json();
  }

  async updateSellerStatus(id: string, status: string): Promise<{ message: string; seller: AdminSeller }> {
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${id}/status`, {
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

  // Get seller verification document
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
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${id}/document`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get seller document');
    }

    return response.json();
  }

  // Product Management
  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);

    const response = await fetch(`${API_BASE_URL}/admin/products?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get products');
    }

    return response.json();
  }

  async updateProduct(id: string, data: any): Promise<{ message: string; product: AdminProduct }> {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }

    return response.json();
  }

  // Category Management
  async getCategories(): Promise<AdminCategory[]> {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get categories');
    }

    return response.json();
  }

  async createCategory(data: {
    name: string;
    description?: string;
    image?: string;
  }): Promise<{ message: string; category: AdminCategory }> {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
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
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }

    return response.json();
  }

  // Order Management
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<OrdersResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);

    const response = await fetch(`${API_BASE_URL}/admin/orders?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get orders');
    }

    return response.json();
  }

  async updateOrderStatus(id: string, status: string): Promise<{ message: string; order: AdminOrder }> {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
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
}

export const adminApi = new AdminApi(); 