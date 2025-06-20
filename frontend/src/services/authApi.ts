import axios from 'axios';

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

export interface ProfileImageResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    updatedAt: string;
  };
  avatarUrl?: string;
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

      throw new Error(errorData.error || 'Failed to update profile');
    }

    return response.json();
  }

  async validateToken(): Promise<{ valid: boolean; user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {

      throw new Error(errorData.error || 'Token validation failed');
    }

    return response.json();
  }

  async uploadProfileImage(file: File): Promise<ProfileImageResponse> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${API_BASE_URL}/auth/profile/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProfileImage(): Promise<ProfileImageResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/auth/profile/avatar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}

export const authApi = new AuthApi(); 