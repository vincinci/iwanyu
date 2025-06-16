#!/bin/bash

# Deployment script for Render
# This ensures Prisma client is properly generated with all enum types

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clean any existing Prisma client
echo "🧹 Cleaning existing Prisma client..."
rm -rf node_modules/@prisma/client node_modules/.prisma

# Reinstall Prisma client
echo "🔄 Reinstalling Prisma client..."
npm install @prisma/client

# Generate Prisma client with all types
echo "⚡ Generating Prisma client..."
npx prisma generate

# Verify enum types are available
echo "✅ Verifying enum types..."
node -e "
const { AdStatus, AdType, AdPlacement, PaymentStatus } = require('@prisma/client');
console.log('AdStatus:', Object.keys(AdStatus).length, 'values');
console.log('AdType:', Object.keys(AdType).length, 'values');
console.log('AdPlacement:', Object.keys(AdPlacement).length, 'values');
console.log('PaymentStatus:', Object.keys(PaymentStatus).length, 'values');
console.log('✅ All enum types verified!');
"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "🎉 Deployment build complete!"
echo "Ready to start with: npm start" 