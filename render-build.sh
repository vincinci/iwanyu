#!/bin/bash

# Render.com Build Script
# This script ensures proper setup for Render deployment

echo "🚀 Starting Render build process..."

# Navigate to backend directory
cd backend || exit 1

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "✅ Build complete!"
