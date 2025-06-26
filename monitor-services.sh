#!/bin/bash

echo "🔍 E-Commerce Store Service Monitor"
echo "=================================="
echo "Checking service status..."
echo ""

# Check backend
echo "🔧 Backend Status:"
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/products?limit=1")
if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo "✅ Backend API is running (HTTP $BACKEND_RESPONSE)"
else
    echo "❌ Backend API is not responding (HTTP $BACKEND_RESPONSE)"
    echo "💡 To fix: cd backend && npm run build && npm start"
fi

# Check frontend
echo ""
echo "🌐 Frontend Status:"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is running (HTTP $FRONTEND_RESPONSE)"
else
    echo "❌ Frontend is not responding (HTTP $FRONTEND_RESPONSE)"
    echo "💡 To fix: cd frontend && npm run dev"
fi

# Show running processes
echo ""
echo "📊 Running Processes:"
echo "Backend processes:"
ps aux | grep -E "(node.*index|npm.*start)" | grep -v grep | head -3
echo ""
echo "Frontend processes:"
ps aux | grep -E "vite" | grep -v grep | head -2

echo ""
echo "🌐 Service URLs:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3001/api"
echo "- API Health Check: http://localhost:3001/api/products?limit=1" 