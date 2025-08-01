# ACTUAL DEPLOYMENT ENVIRONMENT VARIABLES
# Copy and paste these exact values for deployment

## ===== BACKEND ENVIRONMENT VARIABLES (RENDER) =====
## Copy these to Render Web Service → Environment Variables

# Database Connection (Replace with your Render PostgreSQL URL)
DATABASE_URL=postgresql://username:password@host:port/database_name
DIRECT_URL=postgresql://username:password@host:port/database_name

# Authentication (Your current JWT secret, ready for production)
JWT_SECRET=dev-secret-key-iwanyu-2024-production-ready
BCRYPT_ROUNDS=12

# Frontend URL (Update after Vercel deployment)
FRONTEND_URL=https://your-app-name.vercel.app

# Flutterwave Payment Gateway (Your current keys)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-test-secret-key
FLUTTERWAVE_SECRET_HASH=your-webhook-secret-hash
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3

# Email Configuration (Optional - your current SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary Image Upload (Your current keys)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Configuration
NODE_ENV=production

## ===== FRONTEND ENVIRONMENT VARIABLES (VERCEL) =====
## Copy these to Vercel Project → Settings → Environment Variables

# Backend API URL (Update with your Render backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com

# Database (Same as backend, needed for build-time Prisma generation)
DATABASE_URL=postgresql://username:password@host:port/database_name

# Flutterwave (Only public key for frontend)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_CURRENCY=RWF

# NextAuth (Your current configuration)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=dev-nextauth-secret-key

# Cloudinary (For frontend image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

## ===== QUICK COPY TEMPLATES =====

### RENDER BACKEND (Copy to Render Environment Variables):
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=dev-secret-key-iwanyu-2024-production-ready
FRONTEND_URL=
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-test-secret-key
FLUTTERWAVE_SECRET_HASH=your-webhook-secret-hash
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
BCRYPT_ROUNDS=12

### VERCEL FRONTEND (Copy to Vercel Environment Variables):
NEXT_PUBLIC_API_URL=
DATABASE_URL=
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CURRENCY=RWF
NEXTAUTH_URL=
NEXTAUTH_SECRET=dev-nextauth-secret-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

## ===== WHAT TO REPLACE =====

1. DATABASE_URL: Replace with your Render PostgreSQL External Database URL
2. FRONTEND_URL: Replace with your actual Vercel app URL after deployment
3. NEXT_PUBLIC_API_URL: Replace with your actual Render backend URL after deployment
4. NEXT_PUBLIC_APP_URL: Replace with your actual Vercel app URL
5. NEXTAUTH_URL: Replace with your actual Vercel app URL
6. Replace "your-cloud-name", "your-api-key", etc. with your actual Cloudinary credentials
7. Replace "your-email@gmail.com" and "your-app-password" with your actual SMTP credentials

## ===== DEPLOYMENT ORDER =====

1. Create Render PostgreSQL database → Get DATABASE_URL
2. Deploy backend to Render with all backend env vars
3. Deploy frontend to Vercel with all frontend env vars
4. Update FRONTEND_URL in Render backend with actual Vercel URL
5. Redeploy backend to pick up correct FRONTEND_URL
