#!/bin/bash
# Deploy script for Turnow Backend to Fly.io

set -e  # Exit on error

echo "🚀 TURNOW Backend Deployment Script"
echo "===================================="
echo ""

# Variables
APP_NAME="dev-turnow"
BACKEND_DIR="backend"
REGISTRY="registry.fly.io"

echo "📍 Current directory: $(pwd)"
echo "📦 App name: $APP_NAME"
echo "🐳 Registry: $REGISTRY"
echo ""

# Step 1: Check if flyctl is installed
echo "✓ Checking if flyctl is installed..."
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Install with: brew install flyctl"
    exit 1
fi

echo "✓ flyctl found: $(flyctl version)"
echo ""

# Step 2: Check if we're in the right directory
echo "✓ Checking backend directory..."
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found at: $BACKEND_DIR"
    exit 1
fi
echo "✓ Backend directory found"
echo ""

# Step 3: Check if fly.toml exists
echo "✓ Checking fly.toml..."
if [ ! -f "$BACKEND_DIR/fly.toml" ]; then
    echo "❌ fly.toml not found in $BACKEND_DIR"
    exit 1
fi
echo "✓ fly.toml found"
echo ""

# Step 4: Authenticate with Fly.io
echo "📝 Authenticating with Fly.io..."
if [ -z "$FLY_API_TOKEN" ]; then
    echo "⚠️  FLY_API_TOKEN not set. Using flyctl auth..."
    flyctl auth whoami || flyctl auth login
else
    echo "✓ Using FLY_API_TOKEN from environment"
fi
echo ""

# Step 5: Deploy
echo "🚀 Starting deployment to Fly.io..."
echo "   App: $APP_NAME"
echo "   Config: $BACKEND_DIR/fly.toml"
echo ""

cd "$BACKEND_DIR"
flyctl deploy --app "$APP_NAME"

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📍 Next steps:"
echo "   1. Check deployment: flyctl status -a $APP_NAME"
echo "   2. View logs: flyctl logs -a $APP_NAME"
echo "   3. API URL: https://apidev-turnow.shiftya.online/api/health"
echo ""
