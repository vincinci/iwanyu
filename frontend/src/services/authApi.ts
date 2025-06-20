const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  role: string;
  updatedAt: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

class AuthApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return response.json();
  }

  async validateToken(): Promise<{ valid: boolean; user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Token validation failed');
    }

    return response.json();
  }
}

export const authApi = new AuthApi(); 