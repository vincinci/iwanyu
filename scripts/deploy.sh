#!/bin/bash
# Production deployment script for Vercel

echo "🔧 Setting up production deployment..."

# Generate Prisma client for production
echo "📦 Generating Prisma client..."
npx prisma generate --no-engine

# Run Next.js build
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Production build complete!"
