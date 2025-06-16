# Deployment Guide

## Frontend Deployment (Vercel)

### 1. Environment Variables
In your Vercel project settings, add these environment variables:

```
VITE_API_URL=https://your-backend-app.onrender.com/api
```

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

## Backend Deployment (Render)

### 1. Environment Variables
In your Render service settings, add these environment variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_postgresql_database_url
FRONTEND_URL=https://your-frontend-app.vercel.app
JWT_SECRET=your_jwt_secret_key
```

### 2. Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18+

### 3. Database Setup
- Create a PostgreSQL database on Render
- Run migrations: `npx prisma db push`
- Seed data: `npx prisma db seed` (if you have a seed script)

## CORS Configuration

The backend is automatically configured to accept requests from:
- `*.vercel.app` domains (Vercel deployments)
- Your custom domain (if set in `FRONTEND_URL`)
- Localhost for development

## Testing Deployment

1. **Backend Health Check**:
   ```
   https://your-backend-app.onrender.com/health
   ```

2. **Frontend Categories**:
   ```
   https://your-frontend-app.vercel.app/categories
   ```

3. **API Integration Test**:
   - Visit your Vercel frontend
   - Check browser console for any CORS or API errors
   - Verify categories and products load correctly

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` environment variable is set correctly on Render
- Check that your Vercel domain matches the CORS configuration

### API Connection Issues
- Verify `VITE_API_URL` points to your Render backend
- Ensure Render backend is running and accessible
- Check Render logs for any startup errors

### Database Issues
- Verify `DATABASE_URL` is correct
- Run `npx prisma db push` to sync schema
- Check database connection in Render logs 