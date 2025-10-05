#!/bin/bash

# Production build test script
echo "🧪 Testing production build locally..."

# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_API_URL="https://your-backend-api-url.com"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting production server..."
    echo "Visit http://localhost:3000 to test"
    npm start
else
    echo "❌ Build failed!"
    exit 1
fi