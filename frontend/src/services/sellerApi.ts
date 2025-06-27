const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://iwanyu-api.onrender.com/api';

export interface SellerProfile {
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
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

export interface SellerDashboard {
  productCount: number;
  totalSales: number;
  totalOrders: number;
  recentOrders: Array<{
    id: string;
    quantity: number;
    price: number;
    createdAt: string;
    order: {
      id: string;
      total: number;
      status: string;
      user: {
        firstName?: string;
        lastName?: string;
        email: string;
      };
    };
    product: {
      name: string;
      price: number;
      image?: string;
    };
  }>;
}

export interface BecomeSellerData {
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessDescription?: string;
  businessType?: string;
  nationalId?: File | string;
}

export interface ProductVariant {
  name: string;
  value: string;
  price?: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: string;
  stock: number;
  image?: string;
  productImage?: File;
  productImages?: File[];
  images?: string[];
  brand?: string;
  sku?: string;
  isActive?: boolean;
  variants?: ProductVariant[];
}

export interface SellerProduct {
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
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
}

export interface FlashSale {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  products: Array<{
    id: string;
    flashSaleId: string;
    productId: string;
    salePrice: number;
    originalPrice: number;
    stock: number;
    sold: number;
    isActive: boolean;
    product: {
      name: string;
      images: string[];
    };
  }>;
}

export type ProductVariantInput = {
  name: string;
  value: string;
  price: number;
  stock: number;
  sku?: string;
  image?: string;
};

async function fetchWithRetry(url: string, options: any = {}, retries = 3, timeout = 10000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
}

class SellerApi {
  private getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  becomeSeller = async (data: BecomeSellerData): Promise<{ message: string; seller: SellerProfile }> => {
    // If nationalId is a File, use FormData, otherwise use JSON
    if (data.nationalId instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'nationalId' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/seller/become-seller`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create seller profile' }));
      throw new Error(errorData.error || 'Failed to create seller profile');
    }

      return response.json();
    } else {
      // Traditional JSON submission
      const response = await fetch(`${API_BASE_URL}/seller/become-seller`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create seller profile' }));
      throw new Error(errorData.error || 'Failed to create seller profile');
    }

      return response.json();
    }
  }

  getProfile = async (): Promise<SellerProfile> => {
    const response = await fetch(`${API_BASE_URL}/seller/profile`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get seller profile' }));
      throw new Error(errorData.error || 'Failed to get seller profile');
    }

    return response.json();
  }

  updateProfile = async (data: Partial<BecomeSellerData>): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/seller/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update seller profile' }));
      throw new Error(errorData.error || 'Failed to update seller profile');
    }

    return response.json();
  }

  getDashboard = async (): Promise<SellerDashboard> => {
    const response = await fetch(`${API_BASE_URL}/seller/dashboard`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get dashboard data' }));
      throw new Error(errorData.error || 'Failed to get dashboard data');
    }

    return response.json();
  }

  getProducts = async (): Promise<SellerProduct[]> => {
    try {
      const data = await fetchWithRetry(`${API_BASE_URL}/seller/products`, {
        headers: this.getAuthHeaders(),
      });
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        throw new Error('The server is waking up or slow. Please wait and try again.');
      }
      throw err;
    }
  }

  createProduct = async
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/seller/products`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create product' }));
      throw new Error(errorData.error || 'Failed to create product');
    }

    return response.json();
  }

  deleteProduct = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/seller/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete product' }));
      throw new Error(errorData.error || 'Failed to delete product');
    }

    return response.json();
  }

  importProducts = async (csvFile: File): Promise<{ 
    message: string; 
    results: { 
      successful: number; 
      failed: number; 
      errors: string[] 
    } 
  }> => {
    const formData = new FormData();
    formData.append('csvFile', csvFile);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/seller/products/import`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to import products' }));
      throw new Error(errorData.error || 'Failed to import products');
    }

    return response.json();
  }

  async getProductById(id: string) {
    const response = await fetch(`${API_BASE_URL}/seller/products/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  }

  async bulkDeleteProducts(productIds: string[]): Promise<{ message: string; deleted: number; failed: number; errors: string[] }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/seller/products/bulk-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ productIds }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || 'Failed to bulk delete products');
    }
    return response.json();
  }

  // Flash Sales
  getFlashSales = async (): Promise<{ success: boolean; data: FlashSale[] }> => {
    const response = await fetch(`${API_BASE_URL}/seller/flash-sales`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch flash sales' }));
      throw new Error(errorData.error || 'Failed to fetch flash sales');
    }

    return response.json();
  }

  createFlashSale = async (data: { title: string; description?: string; startTime: string; endTime: string }) => {
    const response = await fetch(`${API_BASE_URL}/seller/flash-sales`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create flash sale' }));
      throw new Error(errorData.error || 'Failed to create flash sale');
    }

    return response.json();
  }

  updateFlashSale = async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/seller/flash-sales/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update flash sale' }));
      throw new Error(errorData.error || 'Failed to update flash sale');
    }

    return response.json();
  }

  updateFlashSaleStatus = async (id: string, isActive: boolean) => {
    const response = await fetch(`${API_BASE_URL}/seller/flash-sales/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update flash sale status' }));
      throw new Error(errorData.error || 'Failed to update flash sale status');
    }

    return response.json();
  }

  getDiscountedProducts = async (): Promise<{ success: boolean; data: SellerProduct[] }> => {
    const response = await fetch(`${API_BASE_URL}/seller/discounted-products`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch discounted products' }));
      throw new Error(errorData.error || 'Failed to fetch discounted products');
    }

    return response.json();
  }

  addProductsToFlashSale = async (flashSaleId: string, productIds: string[]) => {
    const response = await fetch(`${API_BASE_URL}/seller/flash-sales/${flashSaleId}/add-products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to add products to flash sale' }));
      throw new Error(errorData.error || 'Failed to add products to flash sale');
    }

    return response.json();
  }

  removeProductFromFlashSale = async (flashSaleId: string, productId: string) => {
    const response = await fetch(`${API_BASE_URL}/seller/flash-sales/${flashSaleId}/remove-product/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to remove product from flash sale' }));
      throw new Error(errorData.error || 'Failed to remove product from flash sale');
    }

    return response.json();
  }

  getFlashSalePreview = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/seller/flash-sales/${id}/preview`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch flash sale preview' }));
      throw new Error(errorData.error || 'Failed to fetch flash sale preview');
    }

    return response.json();
  }

  updateProduct = async (id: string, data: Partial<ProductData>): Promise<{ message: string; product: SellerProduct }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/seller/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update product' }));
      throw new Error(errorData.error || 'Failed to update product');
    }
    return response.json();
  }
}

export const sellerApi = new SellerApi();