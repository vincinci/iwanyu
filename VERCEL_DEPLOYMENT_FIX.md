# Vercel Deployment Fixes

## 🚨 Common Vercel Deployment Issues & Fixes

### 1. Environment Variables Setup
You need to add these environment variables in your Vercel dashboard:

**Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_iwanyu_2025@ep-cool-pond-a1b2c3d4.us-east-1.aws.neon.tech/iwanyu_production?sslmode=require
JWT_SECRET=dec5cbec4e732915dc3dba85190ca27f3ed6bc22093ad67139dab1053fe4a864
NEXTAUTH_SECRET=ebebc0a6c680fdff16ae55fb487e4c4a8573fe80fbf66b95e452e01857cbc13a
NEXTAUTH_URL=https://iwanyuv2.vercel.app
NEXT_PUBLIC_API_URL=https://iwanyuv2.onrender.com
NEXT_PUBLIC_APP_URL=https://iwanyuv2.vercel.app
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-SANDBOXDEMOKEY-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-SANDBOXDEMOKEY-X
CLOUDINARY_CLOUD_NAME=dxdblhmbm
CLOUDINARY_API_KEY=228257485166478
CLOUDINARY_API_SECRET=kdAARbF-ApDJtoHniF4eeODEkRY
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=88e59b001@smtp-brevo.com
BREVO_SMTP_PASS=Uyhf23mW7bGHX1AR
```

### 2. Build Configuration Issues
The main issue is likely Prisma client generation during build.

### 3. Database Connection
Ensure your Neon database allows connections from Vercel's IP ranges.

## 🔧 Manual Steps to Fix Deployment

1. **Set Environment Variables in Vercel**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all the variables listed above

2. **Trigger New Deployment**:
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger automatic deployment

3. **Check Build Logs**:
   - Monitor the build process in Vercel dashboard
   - Look for specific error messages

## 🚀 Alternative: Manual Redeploy Command

If you have Vercel CLI installed:
```bash
npx vercel --prod
```

## ⚠️ Important Notes

- Make sure all environment variables are set to "Production" and "Preview" environments
- Ensure DATABASE_URL points to your production Neon database
- Check that NEXTAUTH_URL matches your actual Vercel domain
