#!/bin/bash

# 🚀 Ecommerce Deployment Helper Script

echo "🚀 Ecommerce Deployment Helper"
echo "================================"

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "1. ✅ Code pushed to GitHub"
echo "2. ✅ Render account created"
echo "3. ✅ Vercel account created"
echo ""

# Frontend deployment
echo "🌐 Frontend Deployment (Vercel)"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Import your GitHub repository"
echo "4. Set Root Directory: frontend"
echo "5. Framework: Vite"
echo "6. Build Command: npm run build"
echo "7. Output Directory: dist"
echo ""

# Backend deployment
echo "🔧 Backend Deployment (Render)"
echo "1. Go to: https://dashboard.render.com/"
echo "2. Create PostgreSQL database first"
echo "3. Create Web Service"
echo "4. Set Root Directory: backend"
echo "5. Build Command: npm install && npm run build && npx prisma generate"
echo "6. Start Command: npm start"
echo ""

echo "📝 Environment Variables Needed:"
echo ""
echo "Vercel (Frontend):"
echo "VITE_API_URL=https://your-backend-service.onrender.com/api"
echo ""
echo "Render (Backend):"
echo "NODE_ENV=production"
echo "PORT=10000"
echo "DATABASE_URL=<from your PostgreSQL database>"
echo "JWT_SECRET=<generate a strong secret>"
echo "FRONTEND_URL=https://your-app-name.vercel.app"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "✨ Happy deploying!" 