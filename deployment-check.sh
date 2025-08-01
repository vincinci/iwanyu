#!/bin/bash
# Deployment Verification Script

echo "🔍 Checking deployment requirements..."

# Check if required environment variables are set
check_env_var() {
    if [ -z "${!1}" ]; then
        echo "❌ Missing environment variable: $1"
        return 1
    else
        echo "✅ Found environment variable: $1"
        return 0
    fi
}

echo "📊 Environment Variables Check:"
check_env_var "DATABASE_URL"
check_env_var "JWT_SECRET"
check_env_var "NEXTAUTH_SECRET"
check_env_var "NEXTAUTH_URL"

echo ""
echo "🗄️ Database Connection Test:"
if command -v npx &> /dev/null; then
    echo "Testing Prisma connection..."
    npx prisma generate
    echo "✅ Prisma client generated successfully"
else
    echo "❌ npx not found"
fi

echo ""
echo "📦 Dependencies Check:"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    npm ci --silent
    echo "✅ Dependencies installed"
else
    echo "❌ package.json not found"
fi

echo ""
echo "🏗️ Build Test:"
npm run build
