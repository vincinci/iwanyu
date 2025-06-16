# 🚨 Deployment Troubleshooting Guide

## Common Deployment Errors & Solutions

### 1. **"Missing script: start" Error**

**Error**: `npm error Missing script: "start"`

**Cause**: Running `npm start` from wrong directory

**Solution**:
```bash
# ❌ Wrong - from root directory
npm start

# ✅ Correct - from backend directory  
cd backend && npm start
```

### 2. **Build Failures on Render**

**Error**: TypeScript compilation errors, missing modules

**Solutions**:

#### A. Prisma Client Issues
```bash
# In Render build command, ensure:
npm install && npm run build && npx prisma generate
```

#### B. Environment Variables Missing
Check these are set in Render:
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-app.vercel.app
```

#### C. Build Command Issues
**Render Service Settings**:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm start`

### 3. **Frontend API Connection Issues**

**Error**: 404 errors for all API calls

**Cause**: `VITE_API_URL` missing `/api` suffix

**Solution** in Vercel Environment Variables:
```env
# ❌ Wrong
VITE_API_URL=https://iwanyu-backend.onrender.com

# ✅ Correct  
VITE_API_URL=https://iwanyu-backend.onrender.com/api
```

### 4. **Database Connection Errors**

**Error**: `Can't reach database server`

**Solutions**:

#### A. Check DATABASE_URL Format
```env
# Correct format:
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

#### B. Run Database Migration
In Render service shell:
```bash
npx prisma db push
```

#### C. Check Database Status
- Ensure PostgreSQL service is running
- Verify connection string is correct
- Check if database exists

### 5. **CORS Errors**

**Error**: `Access to fetch blocked by CORS policy`

**Solution**: Update `FRONTEND_URL` in Render to match exact Vercel domain:
```env
FRONTEND_URL=https://your-exact-vercel-domain.vercel.app
```

### 6. **Port Issues**

**Error**: `Port already in use` or `EADDRINUSE`

**Solution**: Render automatically assigns PORT, ensure your code uses:
```javascript
const PORT = process.env.PORT || 3001;
```

### 7. **Memory/Timeout Issues**

**Error**: Build timeouts, out of memory

**Solutions**:
- Upgrade to paid Render plan
- Optimize build process
- Remove unnecessary dependencies

## Quick Diagnostic Commands

### Test Local Build
```bash
cd backend
npm install
npm run build
npx prisma generate
npm start
```

### Test API Endpoints
```bash
# Health check
curl https://your-backend.onrender.com/health

# Products API  
curl "https://your-backend.onrender.com/api/products?page=1&limit=5"
```

### Check Environment Variables
In Render service dashboard → Environment tab

## Step-by-Step Deployment Verification

### Backend (Render)
1. ✅ Service created with correct settings
2. ✅ Environment variables set
3. ✅ Build completes successfully
4. ✅ Service starts without errors
5. ✅ Health endpoint responds
6. ✅ Database connected

### Frontend (Vercel)  
1. ✅ Project imported from GitHub
2. ✅ Root directory set to `frontend`
3. ✅ `VITE_API_URL` set correctly (with `/api`)
4. ✅ Build completes successfully
5. ✅ App loads without errors
6. ✅ API calls return data (not 404)

## Emergency Fixes

### If Backend Won't Start
```bash
# Check logs in Render dashboard
# Common fixes:
1. Verify DATABASE_URL is correct
2. Run: npx prisma db push
3. Check all environment variables are set
4. Restart service
```

### If Frontend Shows No Data
```bash
# Check browser console for errors
# Quick fix:
1. Update VITE_API_URL to include /api
2. Redeploy frontend
3. Test API endpoints directly
```

## Get Help

If you're still having issues, provide:
1. **Platform**: Render/Vercel
2. **Error message**: Exact error text
3. **Build logs**: Copy from dashboard
4. **Environment**: Which variables are set

## Status Check URLs

- **Backend Health**: `https://iwanyu-backend.onrender.com/health`
- **Frontend**: `https://iwanyu.vercel.app`
- **API Test**: `https://iwanyu-backend.onrender.com/api/products?page=1&limit=5` 