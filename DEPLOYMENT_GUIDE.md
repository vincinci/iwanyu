# Deployment Guide: Frontend (Vercel) + Backend (Render)

This guide will help you deploy your e-commerce application with the frontend on Vercel and backend on Render.

## Project Structure

```
iwanyu2.0/
├── backend/                 # Express.js API server
│   ├── routes/             # API routes (COMPLETED ✅)
│   ├── prisma/             # Database schema
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── render.yaml         # Render deployment config
├── frontend files...       # Next.js frontend
├── vercel.json            # Vercel deployment config
└── DEPLOYMENT_GUIDE.md    # This file
```

## ✅ Completed Tasks

- **API Route Conversion**: All 8 route groups converted from Next.js to Express
- **Backend Server**: Running successfully on port 3003 with database connectivity
- **Database Schema**: Synchronized between main project and backend
- **CORS Configuration**: Set up for Vercel frontend compatibility
- **Deployment Configs**: render.yaml and vercel.json created

## Prerequisites

1. **Accounts Required:**
   - [Vercel Account](https://vercel.com) (for frontend)
   - [Render Account](https://render.com) (for backend)  
   - [GitHub Account](https://github.com) (for code repository)

2. **Database Setup:**
   - PostgreSQL database (can use Render PostgreSQL or external service)

## 🎯 Backend Deployment (Render)

### Step 1: Push Backend to Separate Repository
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/vincinci/iwanyu-backend.git
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub account
3. Click "New +" → "Web Service"
4. Connect the backend repository
5. Configure:
   - **Name**: iwanyu-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Configure Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
DATABASE_URL=[Render will auto-populate from PostgreSQL service]
JWT_SECRET=[Generate a secure random string]
FRONTEND_URL=https://your-vercel-app.vercel.app
FLUTTERWAVE_SECRET_KEY=your_flutterwave_key
BCRYPT_ROUNDS=12
```

### Step 4: Create PostgreSQL Database
1. In Render dashboard: "New +" → "PostgreSQL"
2. Name: iwanyu-db
3. Copy the connection string to DATABASE_URL

### Step 5: Initialize Database
After deployment, run in Render shell:
```bash
npx prisma db push
npx prisma db seed
```

## 🎯 Frontend Deployment (Vercel)

### Step 1: Update Frontend Configuration
1. Update API calls to use external backend
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

### Step 3: Environment Variables in Vercel
Add in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://iwanyu-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://iwanyu.vercel.app
```

## 🔗 Update API Calls

Create or update `src/lib/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  auth: {
    register: (data: any) => fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    login: (data: any) => fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  },
  // Add other endpoints...
};
```

## ✅ Verification Steps

1. **Backend Health Check**: `https://your-backend.onrender.com/health`
2. **Frontend Loading**: `https://your-app.vercel.app`
3. **API Integration**: Test user registration/login
4. **Database**: Verify data persistence

## 🔧 Production Checklist

- [ ] Backend deployed to Render
- [ ] PostgreSQL database created and seeded
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] API calls updated to use external backend
- [ ] CORS configured for your domain
- [ ] SSL certificates (automatic on both platforms)
- [ ] Custom domain setup (optional)

## 🚨 Important Notes

1. **Free Tier Limitations**:
   - Render: 750 hours/month, sleeps after 15min inactivity
   - Vercel: Unlimited for personal projects

2. **Database Backups**: Set up regular backups for production

3. **Monitoring**: Add error tracking (Sentry, LogRocket, etc.)

## 🆘 Troubleshooting

- **CORS Issues**: Ensure FRONTEND_URL matches your Vercel domain
- **Database Connection**: Check DATABASE_URL format
- **API Routes**: Verify all Next.js routes are converted to Express
- **Environment Variables**: Double-check all required vars are set

## 📞 Support
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Project Issues: Create GitHub issue
