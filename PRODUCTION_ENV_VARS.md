# PRODUCTION-READY ENVIRONMENT VARIABLES
# Copy these exact values for deployment - all keys are generated and ready to use

## ===== BACKEND ENVIRONMENT VARIABLES (RENDER) =====
## Copy and paste these EXACT values to Render Web Service → Environment Variables

DATABASE_URL=
DIRECT_URL=
JWT_SECRET=dec5cbec4e732915dc3dba85190ca27f3ed6bc22093ad67139dab1053fe4a864
FRONTEND_URL=
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-test-secret-key
FLUTTERWAVE_SECRET_HASH=1fc4c3e65a4643b0a366223c92cf817f
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

## ===== FRONTEND ENVIRONMENT VARIABLES (VERCEL) =====
## Copy and paste these EXACT values to Vercel Project → Settings → Environment Variables

NEXT_PUBLIC_API_URL=
DATABASE_URL=
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CURRENCY=RWF
NEXTAUTH_URL=
NEXTAUTH_SECRET=ebebc0a6c680fdff16ae55fb487e4c4a8573fe80fbf66b95e452e01857cbc13a
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

## ===== QUICK COPY TEMPLATES FOR DEPLOYMENT =====

### RENDER BACKEND - Copy this block:
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=dec5cbec4e732915dc3dba85190ca27f3ed6bc22093ad67139dab1053fe4a864
FRONTEND_URL=
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-test-secret-key
FLUTTERWAVE_SECRET_HASH=1fc4c3e65a4643b0a366223c92cf817f
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

### VERCEL FRONTEND - Copy this block:
NEXT_PUBLIC_API_URL=
DATABASE_URL=
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-public-key
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CURRENCY=RWF
NEXTAUTH_URL=
NEXTAUTH_SECRET=ebebc0a6c680fdff16ae55fb487e4c4a8573fe80fbf66b95e452e01857cbc13a
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

## ===== WHAT TO FILL IN =====

1. DATABASE_URL & DIRECT_URL: Your Render PostgreSQL External Database URL
2. FRONTEND_URL: Your Vercel app URL (e.g., https://iwanyu-frontend.vercel.app)
3. NEXT_PUBLIC_API_URL: Your Render backend URL (e.g., https://iwanyu-backend.onrender.com)
4. NEXT_PUBLIC_APP_URL & NEXTAUTH_URL: Same as FRONTEND_URL

Replace these placeholders with your actual credentials:
- your-test-public-key & your-test-secret-key: Your actual Flutterwave keys
- your-email@gmail.com & your-app-password: Your actual SMTP credentials
- your-cloud-name, your-api-key, your-api-secret: Your actual Cloudinary credentials

## ===== GENERATED SECURE KEYS =====

✅ JWT_SECRET: dec5cbec4e732915dc3dba85190ca27f3ed6bc22093ad67139dab1053fe4a864
✅ NEXTAUTH_SECRET: ebebc0a6c680fdff16ae55fb487e4c4a8573fe80fbf66b95e452e01857cbc13a
✅ FLUTTERWAVE_SECRET_HASH: 1fc4c3e65a4643b0a366223c92cf817f

These are production-ready cryptographically secure secrets generated for your deployment.
