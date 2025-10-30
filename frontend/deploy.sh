#!/bin/bash

echo "🚀 keyboard Game Deployment Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the /app/frontend directory"
    exit 1
fi

echo "📦 Step 1: Building production version..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "Option 1: Deploy via Vercel CLI"
echo "-------------------------------"
echo "1. Install Vercel: npm install -g vercel"
echo "2. Login: vercel login"
echo "3. Deploy: vercel --prod"
echo ""
echo "Option 2: Deploy via Vercel Dashboard"
echo "-------------------------------------"
echo "1. Go to: https://vercel.com"
echo "2. Sign up/Login"
echo "3. Click 'Add New Project'"
echo "4. Import your Git repository or drag/drop the 'build' folder"
echo ""
echo "🌐 After Deployment:"
echo "-------------------"
echo "1. Get your Vercel URL (e.g., https://keyboard-game.vercel.app)"
echo "2. Test the app thoroughly"
echo "3. Connect your GoDaddy domain (see DEPLOYMENT_GUIDE.md)"
echo "4. Share with friends!"
echo ""
echo "📖 Full guide: /app/DEPLOYMENT_GUIDE.md"
echo ""
