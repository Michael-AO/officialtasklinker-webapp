#!/bin/bash

# Avatar System Setup Script
# This script helps you set up the complete avatar system in your Supabase database

echo "🚀 Avatar System Setup"
echo "======================"
echo ""
echo "This script will help you set up the complete avatar system."
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/complete-avatar-setup.sql" ]; then
    echo "❌ Error: complete-avatar-setup.sql not found in scripts/ directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Found avatar setup script"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Open your Supabase project dashboard"
echo "2. Go to the SQL Editor"
echo "3. Copy the contents of scripts/complete-avatar-setup.sql"
echo "4. Paste and run the SQL script"
echo "5. Verify the setup by checking the verification queries"
echo ""

echo "📁 Files created/updated:"
echo "========================="
echo "✅ scripts/complete-avatar-setup.sql - Complete setup script"
echo "✅ scripts/25-avatar-update-function.sql - Basic avatar function"
echo "✅ scripts/26-avatar-cleanup-function.sql - Cleanup functions"
echo "✅ scripts/run-avatar-setup.sql - Simple setup script"
echo "✅ AVATAR_SETUP_GUIDE.md - Detailed setup guide"
echo "✅ app/api/upload/avatar/route.ts - Enhanced upload API"
echo ""

echo "🔧 What the setup includes:"
echo "==========================="
echo "• Storage bucket for avatars with proper policies"
echo "• Basic avatar update function"
echo "• Enhanced avatar update with automatic cleanup"
echo "• Orphaned file cleanup function"
echo "• Avatar management functions"
echo "• Verification queries"
echo ""

echo "🧪 Testing the setup:"
echo "====================="
echo "After running the SQL script, you can test the avatar upload by:"
echo "1. Going to your app's profile edit page"
echo "2. Uploading an avatar image"
echo "3. Checking the browser console for success messages"
echo "4. Verifying the image appears in your profile"
echo ""

echo "📖 For detailed instructions, see: AVATAR_SETUP_GUIDE.md"
echo ""

# Show the SQL file content
echo "📄 SQL Script Content Preview:"
echo "=============================="
echo ""
head -20 scripts/complete-avatar-setup.sql
echo "..."
echo ""
echo "Full script available at: scripts/complete-avatar-setup.sql"
echo ""

echo "🎉 Setup ready! Run the SQL script in your Supabase dashboard." 