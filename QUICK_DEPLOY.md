# ⚡ Quick Deploy Guide

## 🎯 Deploy in 15 Minutes

### 1. Backend (Render) - 8 minutes

1. **Create Database** (2 min)
   - Go to [Render](https://dashboard.render.com/) → New → PostgreSQL
   - Name: `ecommerce-db`, Plan: Free
   - **Copy the Database URL**

2. **Deploy Backend** (6 min)
   - New → Web Service → Connect GitHub
   - Root Directory: `backend`
   - Build: `npm install && npm run build && npx prisma generate`
   - Start: `npm start`
   - Add Environment Variables:
     ```
     NODE_ENV=production
     PORT=10000
     DATABASE_URL=<paste database URL>
     JWT_SECRET=<generate random 32+ char string>
     FRONTEND_URL=https://temp.vercel.app
     ```
   - Deploy → Wait → Go to Shell → Run: `npx prisma db push`

### 2. Frontend (Vercel) - 5 minutes

1. **Deploy Frontend** (3 min)
   - Go to [Vercel](https://vercel.com/dashboard) → New Project
   - Import GitHub repo
   - Root Directory: `frontend`
   - Framework: Vite
   - Deploy

2. **Configure API** (2 min)
   - Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend.onrender.com/api`
   - Redeploy

### 3. Final Setup (2 minutes)

1. **Update Backend URL**
   - Go back to Render → Your service → Environment
   - Update `FRONTEND_URL` with your Vercel URL
   - Service will auto-redeploy

2. **Test**
   - Visit your Vercel URL
   - Check if products load
   - Test registration/login

## 🔗 Quick Links

- **Render Dashboard**: https://dashboard.render.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Detailed Guide**: See `DEPLOYMENT_GUIDE.md`

## 🆘 Quick Fixes

**CORS Error**: Update `FRONTEND_URL` in Render to match your Vercel domain exactly

**API Not Loading**: Check `VITE_API_URL` in Vercel points to your Render backend

**Database Error**: Ensure you ran `npx prisma db push` in Render shell

## 🎉 You're Live!

Your ecommerce app should now be running on:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-service.onrender.com` 