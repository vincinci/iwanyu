# 🚀 Complete Deployment Guide: Vercel + Render

This guide will help you deploy your ecommerce application with the frontend on Vercel and backend on Render.

## 📋 Prerequisites

- GitHub account with your code pushed
- Vercel account (free tier available)
- Render account (free tier available)

## 🔧 Backend Deployment (Render)

### Step 1: Create Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ecommerce-db`
   - **Database**: `ecommerce`
   - **User**: `ecommerce_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **"Create Database"**
5. **Save the Database URL** from the database info page

### Step 2: Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecommerce-backend`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

### Step 3: Set Environment Variables

In your Render service settings, add these environment variables:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://ecommerce_user:password@host:port/ecommerce
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://your-app-name.vercel.app
```

**Important**: 
- Replace `DATABASE_URL` with the actual URL from Step 1
- Generate a strong `JWT_SECRET` (use a password generator)
- You'll update `FRONTEND_URL` after deploying the frontend

### Step 4: Deploy and Setup Database

1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Once deployed, go to the **"Shell"** tab in your service
4. Run database setup:
   ```bash
   npx prisma db push
   ```

Your backend should now be live at: `https://your-service-name.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Set Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
VITE_API_URL=https://your-backend-service.onrender.com/api
```

**Replace** `your-backend-service` with your actual Render service name.

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your frontend will be live at: `https://your-app-name.vercel.app`

### Step 4: Update Backend FRONTEND_URL

1. Go back to your Render service
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL
3. The service will automatically redeploy

## ✅ Verification

### Test Backend
Visit: `https://your-backend-service.onrender.com/health`
Should return: `{"status":"OK","message":"Ecommerce API is running"}`

### Test Frontend
1. Visit your Vercel URL
2. Check browser console for errors
3. Verify products and categories load
4. Test user registration/login

### Test Integration
1. Open browser dev tools → Network tab
2. Navigate through your app
3. Verify API calls are successful (200 status codes)

## 🔧 Configuration Files

The following files have been created/configured for deployment:

### Frontend (`frontend/vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend (`backend/render.yaml`)
```yaml
services:
  - type: web
    name: ecommerce-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build && npx prisma generate
    startCommand: npm start
```

## 🚨 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your Vercel domain exactly
- Check browser console for specific CORS error messages

### API Connection Issues
- Verify `VITE_API_URL` in Vercel points to correct Render URL
- Ensure Render service is running (check service logs)

### Database Issues
- Verify `DATABASE_URL` is correct in Render
- Check if `npx prisma db push` completed successfully
- Review Render service logs for database connection errors

### Build Failures
- Check build logs in both Vercel and Render
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## 🔄 Updates and Redeployment

### Frontend Updates
- Push changes to GitHub
- Vercel automatically redeploys on push to main branch

### Backend Updates
- Push changes to GitHub
- Render automatically redeploys on push to main branch
- For database schema changes, run `npx prisma db push` in Render shell

## 💰 Cost Considerations

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 6,000 build minutes/month
- **Render**: 750 hours/month, sleeps after 15 minutes of inactivity

### Production Recommendations
- **Vercel Pro**: $20/month for better performance
- **Render Starter**: $7/month for always-on backend
- **Database**: Consider upgrading for production workloads

## 🔐 Security Checklist

- [ ] Strong JWT_SECRET generated
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Environment variables set correctly
- [ ] No sensitive data in code repository
- [ ] HTTPS enabled (automatic on both platforms)

## 📞 Support

If you encounter issues:
1. Check service logs in Render dashboard
2. Check build logs in Vercel dashboard
3. Verify all environment variables are set correctly
4. Test API endpoints individually

Your ecommerce application should now be live and accessible worldwide! 🎉 