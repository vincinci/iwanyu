const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

      throw new Error(errorData.error || 'Failed to update seller profile');
    }

    return response.json();
  }

  getDashboard = async (): Promise<SellerDashboard> => {
    const response = await fetch(`${API_BASE_URL}/seller/dashboard`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error(errorData.error || 'Failed to get dashboard data');
    }

    return response.json();
  }

  // Product management methods
  getProducts = async (): Promise<SellerProduct[]> => {
    const response = await fetch(`${API_BASE_URL}/seller/products`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error(errorData.error || 'Failed to get products');
    }

    return response.json();
  }

  createProduct = async (data: ProductData): Promise<{ message: string; product: SellerProduct }> => {
    console.log('SellerApi.createProduct called with data:', {
      ...data,
      productImage: data.productImage ? `File: ${data.productImage.name} (${data.productImage.size} bytes)` : undefined
    });
    
    // If productImage is a File, use FormData, otherwise use JSON
    if (data.productImage instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'productImage' && value instanceof File) {
            formData.append(key, value);
          } else if (key === 'productImages' && Array.isArray(value)) {
            value.forEach((file: File) => {
              formData.append(`productImages`, file);
            });
          } else if (key === 'variants' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key !== 'productImage' && key !== 'productImages') {
            formData.append(key, String(value));
          }
        }
      });

      console.log('Sending FormData request...');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/seller/products`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {

        console.error('API Error:', error);
        throw new Error(errorData.error || error.message || 'Failed to create product');
      }

      const result = await response.json();
      console.log('Product created successfully:', result);
      return result;
    } else {
      // Traditional JSON submission (when using image URL)
      console.log('Sending JSON request...');
      const response = await fetch(`${API_BASE_URL}/seller/products`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {

        console.error('API Error:', error);
        throw new Error(errorData.error || error.message || 'Failed to create product');
      }

      const result = await response.json();
      console.log('Product created successfully:', result);
      return result;
    }
  }

  updateProduct = async (id: string, data: Partial<ProductData>): Promise<{ message: string; product: SellerProduct }> => {
    const response = await fetch(`${API_BASE_URL}/seller/products/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {

      throw new Error(errorData.error || 'Failed to update product');
    }

    return response.json();
  }

  deleteProduct = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/seller/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

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

      throw new Error(errorData.error || 'Failed to import products');
    }

    return response.json();
  }
}

export const sellerApi = new SellerApi(); 