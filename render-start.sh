#!/bin/bash

# Render.com Start Script
# This script starts the backend server

echo "🚀 Starting iwanyu backend server..."

# Navigate to backend directory
cd backend || exit 1

echo "📡 Starting server..."
npm start
