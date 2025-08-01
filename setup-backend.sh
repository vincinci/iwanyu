#!/bin/bash

# Quick Backend Setup for Render Deployment
echo "🚀 Setting up iWanyu Backend for Render..."

cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Convert your Next.js API routes to Express routes"
echo "2. Push backend/ folder to separate GitHub repo"
echo "3. Deploy to Render using the DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Backend structure created at: ./backend/"
echo "📖 Full guide available at: ./DEPLOYMENT_GUIDE.md"
