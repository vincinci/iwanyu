# 🚀 Single Repository Deployment Guide

## Current Setup: ✅ PERFECT for Single Repo Deployment

Your current structure is ideal for deploying frontend and backend from one repository:

```
iwanyu/ (single repository)
├── 📁 Next.js Frontend (root level)
│   ├── src/app/
│   ├── components/
│   ├── package.json
│   └── vercel.json
│
├── 📁 backend/ (subfolder)
│   ├── server.js
│   ├── routes/
│   ├── package.json
│   └── render.yaml
│
└── 📁 shared configs
    ├── render.yaml (backend deployment)
    ├── prisma/ (database schema)
    └── .env files
```

## 🎯 Deployment Strategy: Single Repository ✅

### **Why Single Repo is Better:**

✅ **Easier Management** - One repository to maintain  
✅ **Version Synchronization** - Frontend and backend always compatible  
✅ **Shared Configuration** - Common environment variables  
✅ **Atomic Deployments** - Deploy both together or separately  
✅ **Simpler CI/CD** - One webhook triggers coordinated deployments  
✅ **Your Current Setup** - Already perfectly structured!  

### **Deployment Process:**

## 🌐 **Vercel (Frontend Deployment)**

**What Vercel Deploys:** Next.js application from repository root

**Configuration:**
- **Detects:** Next.js automatically from root `package.json`
- **Builds:** `npm run build` in root directory  
- **Serves:** Static files + API routes (which you'll redirect to Render)

**Environment Variables for Vercel:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_public_key
```

## ⚡ **Render (Backend Deployment)**

**What Render Deploys:** Express.js API from `/backend` subfolder

**Configuration in render.yaml:**
```yaml
buildCommand: cd backend && npm install && npx prisma generate
startCommand: cd backend && npm start
```

**Environment Variables for Render:**
```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
FLUTTERWAVE_SECRET_KEY=your_secret_key
FRONTEND_URL=https://your-app.vercel.app
```

## 🔄 **Deployment Workflow:**

### **Step 1: Deploy Backend First**
1. Push code to GitHub
2. Connect Render to your repository
3. Configure Render to deploy from `/backend` folder
4. Set environment variables
5. Deploy and get your backend URL

### **Step 2: Deploy Frontend Second**  
1. Update frontend to use backend URL
2. Connect Vercel to same repository
3. Configure environment variables
4. Deploy frontend

### **Step 3: Test Integration**
- Frontend calls backend API
- Authentication flows work
- Payments process correctly

## 💡 **Alternative: If You Want Separate Repositories**

If you prefer separate repositories, here's how:

### **Create Two Repositories:**

```bash
# Create frontend repository
git clone https://github.com/vincinci/iwanyu.git iwanyu-frontend
cd iwanyu-frontend
rm -rf backend/
git add .
git commit -m "Frontend only"
git push origin main

# Create backend repository  
git clone https://github.com/vincinci/iwanyu.git iwanyu-backend
cd iwanyu-backend
# Keep only backend folder contents
mv backend/* .
rm -rf src/ components/ app/ public/
git add .
git commit -m "Backend only"
git push origin main
```

**Pros of Separate Repos:**
- Complete independence
- Different deployment schedules
- Separate team access

**Cons of Separate Repos:**
- More complex to manage
- Version sync challenges
- Duplicate configuration

## 🏆 **Recommendation: Keep Single Repository**

Your current setup is **perfect** for single repository deployment. Here's why:

1. **Already Configured** ✅ - Your backend folder structure is ideal
2. **Render Support** ✅ - Render can deploy from subfolders  
3. **Vercel Support** ✅ - Vercel deploys from root automatically
4. **Easier Management** ✅ - One place for everything
5. **Production Ready** ✅ - Your configuration already works

## 🚀 **Next Steps for Single Repo Deployment:**

1. **Update Frontend API Calls** (point to production backend URL)
2. **Deploy Backend to Render** (using `/backend` folder)
3. **Deploy Frontend to Vercel** (using repository root)
4. **Configure Environment Variables** (for both services)
5. **Test End-to-End** (verify everything works)

Would you like me to help you with any of these deployment steps?
