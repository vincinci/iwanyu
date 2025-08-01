# Environment Variables Configuration

## Backend Environment Variables (Render)

Copy these to your Render Web Service → Environment Variables section:

```
DATABASE_URL=postgresql://iwanyu_user:password@dpg-xxxxx-a.region.render.com/iwanyu_db
DIRECT_URL=postgresql://iwanyu_user:password@dpg-xxxxx-a.region.render.com/iwanyu_db
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long
FRONTEND_URL=https://your-app-name.vercel.app
NODE_ENV=production
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxxxxxxxxxxxxx
```

### How to get these values:

1. **DATABASE_URL & DIRECT_URL**: 
   - Create PostgreSQL database in Render
   - Copy "External Database URL" from database dashboard
   - Use the same URL for both variables

2. **JWT_SECRET**: 
   - Generate a secure random string (minimum 32 characters)
   - You can use: `openssl rand -base64 32` in terminal
   - Or online generator: https://randomkeygen.com/

3. **FRONTEND_URL**: 
   - Will be your Vercel app URL after deployment
   - Format: `https://your-app-name.vercel.app`
   - Update this after Vercel deployment

4. **Flutterwave Keys**: 
   - Get from Flutterwave dashboard
   - Use TEST keys for development
   - Use LIVE keys for production

## Frontend Environment Variables (Vercel)

Copy these to your Vercel Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://iwanyu-backend.onrender.com
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://iwanyu_user:password@dpg-xxxxx-a.region.render.com/iwanyu_db
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### How to get these values:

1. **NEXT_PUBLIC_API_URL**: 
   - Will be your Render backend URL after deployment
   - Format: `https://your-backend-name.onrender.com`
   - Update this after Render deployment

2. **NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY**: 
   - Same public key from Flutterwave dashboard
   - Only the PUBLIC key goes in frontend (for security)

3. **DATABASE_URL**: 
   - Same as backend DATABASE_URL
   - Needed for Prisma client generation during build

4. **NEXT_PUBLIC_APP_URL**: 
   - Your own Vercel app URL
   - Used for redirects and absolute URLs

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit .env files** to your repository
2. **Use TEST keys** for development/staging
3. **Use LIVE keys** only for production
4. **JWT_SECRET** must be at least 32 characters
5. **Only PUBLIC keys** should have `NEXT_PUBLIC_` prefix
6. **Secret keys** should never be exposed to frontend

## Sample .env.local (for local development)

Create this file in your project root for local development:

```bash
# Local Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3003

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/iwanyu_db"
DIRECT_URL="postgresql://username:password@localhost:5432/iwanyu_db"

# JWT
JWT_SECRET=your-local-jwt-secret-minimum-32-characters-long

# Flutterwave (TEST keys only)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxxxxxxxxxxxxx

# Local URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Deployment Checklist

### Before Deployment:
- [ ] All environment variables identified
- [ ] Flutterwave account set up
- [ ] Database connection string obtained
- [ ] JWT secret generated
- [ ] GitHub repository ready

### During Backend Deployment (Render):
- [ ] Database created and accessible
- [ ] All backend environment variables set
- [ ] Build command includes Prisma generation
- [ ] Service starts successfully

### During Frontend Deployment (Vercel):
- [ ] Backend URL updated in frontend env vars
- [ ] Only public environment variables set
- [ ] Build completes successfully
- [ ] Frontend connects to backend

### After Deployment:
- [ ] Update FRONTEND_URL in backend with actual Vercel URL
- [ ] Test API endpoints
- [ ] Test frontend functionality
- [ ] Verify CORS configuration
- [ ] Test payment integration

## Troubleshooting Environment Variables

### Common Issues:

1. **"Environment variable not found"**
   - Check spelling and case sensitivity
   - Ensure variable is set in correct platform (Render vs Vercel)
   - Restart service after adding variables

2. **"Database connection failed"**
   - Verify DATABASE_URL format
   - Check database is running and accessible
   - Ensure IP restrictions allow Render access

3. **"CORS error"**
   - Verify FRONTEND_URL matches Vercel domain exactly
   - Include protocol (https://)
   - No trailing slash

4. **"JWT secret invalid"**
   - Must be at least 32 characters
   - No special characters that need escaping
   - Keep it secure and random

5. **"Payment integration not working"**
   - Check Flutterwave keys are correct
   - Verify TEST vs LIVE key usage
   - Ensure public key starts with FLWPUBK_

### Getting Values:

- **Render Database URL**: Database dashboard → Connection Details
- **Vercel App URL**: Project dashboard → Domains
- **Render Service URL**: Service dashboard → URL
- **Flutterwave Keys**: Dashboard → Settings → API Keys
- **Generate JWT Secret**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
