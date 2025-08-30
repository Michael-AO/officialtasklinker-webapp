#!/bin/bash

echo "🚀 Deploying TaskLinker MVP with Dojah CSP fixes..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=.next

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Your MVP is now live!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test the Dojah integration at: /test-dojah"
    echo "2. Check browser console for any remaining CSP errors"
    echo "3. Verify that Dojah widget loads without issues"
    echo ""
    echo "🔧 If you encounter issues:"
    echo "- Check the browser's Network tab for blocked requests"
    echo "- Verify environment variables are set in Netlify dashboard"
    echo "- Test with different browsers"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
