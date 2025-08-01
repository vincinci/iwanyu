# Environment Variables for Vercel Deployment

## Required Environment Variables

Copy these to your Vercel dashboard (Project Settings → Environment Variables):

### Database & Authentication
```
DATABASE_URL=postgresql://neondb_owner:npg_iwanyu_2025@ep-cool-pond-a1b2c3d4.us-east-1.aws.neon.tech/iwanyu_production?sslmode=require
JWT_SECRET=dec5cbec4e732915dc3dba85190ca27f3ed6bc22093ad67139dab1053fe4a864
NEXTAUTH_SECRET=ebebc0a6c680fdff16ae55fb487e4c4a8573fe80fbf66b95e452e01857cbc13a
NEXTAUTH_URL=https://iwanyuv2.vercel.app
```

### API URLs
```
NEXT_PUBLIC_API_URL=https://iwanyuv2.onrender.com
NEXT_PUBLIC_APP_URL=https://iwanyuv2.vercel.app
```

### Flutterwave Payment
```
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-SANDBOXDEMOKEY-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-SANDBOXDEMOKEY-X
```

### Cloudinary Image Storage
```
CLOUDINARY_CLOUD_NAME=dxdblhmbm
CLOUDINARY_API_KEY=228257485166478
CLOUDINARY_API_SECRET=kdAARbF-ApDJtoHniF4eeODEkRY
```

### Brevo SMTP Email
```
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=88e59b001@smtp-brevo.com
BREVO_SMTP_PASS=Uyhf23mW7bGHX1AR
```

## Instructions:

1. Go to https://vercel.com/dashboard
2. Select your project (iwanyu)
3. Go to Settings → Environment Variables
4. Add each variable above for both "Production" and "Preview" environments
5. After adding all variables, go to Deployments and click "Redeploy"

## Note:
Make sure to set these for both Production AND Preview environments to ensure deployments work correctly.
