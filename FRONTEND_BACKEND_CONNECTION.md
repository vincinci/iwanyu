# 🔗 Frontend-Backend Connection Guide

## ✅ Status: CONNECTED!

Your frontend is now properly configured to connect to your deployed backend.

## 🎯 What Was Fixed

### Problem
- Frontend had no backend connection
- Missing environment variables
- API calls were failing

### Solution Applied
- ✅ Created `frontend/.env` with proper API URL
- ✅ Configured environment variables
- ✅ Tested API connection successfully

## 📋 Environment Configuration

### Local Development (`frontend/.env`)
```env
VITE_API_URL=https://iwanyu-backend.onrender.com/api
VITE_APP_NAME=Iwanyu Store
VITE_APP_DESCRIPTION=Your Premier Ecommerce Destination
VITE_FRONTEND_URL=http://localhost:5173
```

### Production (Vercel Environment Variables)
```env
VITE_API_URL=https://iwanyu-backend.onrender.com/api
VITE_APP_NAME=Iwanyu Store
VITE_APP_DESCRIPTION=Your Premier Ecommerce Destination
VITE_FRONTEND_URL=https://iwanyu.vercel.app
```

## 🧪 Connection Test Results

### ✅ Backend API Health
```bash
curl https://iwanyu-backend.onrender.com/health
# Response: {"status":"OK","message":"Ecommerce API is running"}
```

### ✅ Products API
```bash
curl "https://iwanyu-backend.onrender.com/api/products?page=1&limit=3"
# Response: 3 products found, 176 total products
```

### ✅ Frontend Development Server
```bash
npm run dev
# Running on: http://localhost:5173
```

## 🚀 How to Run Locally

### 1. Start Backend (Optional - using deployed version)
```bash
cd backend
npm run dev
# Backend runs on: http://localhost:3001
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on: http://localhost:5173
```

### 3. Open Browser
Visit: http://localhost:5173

## 🌐 Production URLs

- **Frontend**: https://iwanyu.vercel.app
- **Backend**: https://iwanyu-backend.onrender.com
- **API Base**: https://iwanyu-backend.onrender.com/api

## 🔧 API Service Configuration

The frontend API service (`frontend/src/services/api.ts`) is properly configured:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

This means:
- ✅ **Development**: Uses `VITE_API_URL` from `.env` → deployed backend
- ✅ **Production**: Uses `VITE_API_URL` from Vercel → deployed backend
- ✅ **Fallback**: Uses `localhost:3001/api` if no env var

## 📊 Available API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get single product

### Categories  
- `GET /api/categories` - Get all categories

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Flash Sales
- `GET /api/seller/flash-sales` - Get flash sales
- `POST /api/seller/flash-sales` - Create flash sale

## 🎉 Expected Frontend Behavior

After this setup, your frontend should:

- ✅ Load products on homepage
- ✅ Display categories in sidebar
- ✅ Show flash sale products (if any)
- ✅ Enable user registration/login
- ✅ Display product images correctly
- ✅ Handle API errors gracefully

## 🔍 Troubleshooting

### If Frontend Shows No Data

1. **Check Environment Variables**
   ```bash
   cd frontend
   cat .env
   # Should show: VITE_API_URL=https://iwanyu-backend.onrender.com/api
   ```

2. **Test API Connection**
   ```bash
   curl "https://iwanyu-backend.onrender.com/api/products?page=1&limit=5"
   # Should return JSON with products
   ```

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for API errors in Console tab
   - Check Network tab for failed requests

4. **Restart Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

### If API Calls Return 404

- ✅ **Correct**: `https://iwanyu-backend.onrender.com/api/products`
- ❌ **Wrong**: `https://iwanyu-backend.onrender.com/products`

Make sure `VITE_API_URL` includes `/api` at the end!

## 📝 Next Steps

1. **For Local Development**: Frontend is ready to use
2. **For Production**: Update Vercel environment variables
3. **For New Features**: API endpoints are available for expansion

Your frontend-backend connection is now fully operational! 🎯 