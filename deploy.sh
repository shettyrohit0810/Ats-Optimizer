#!/bin/bash

# ATS Optimizer Deployment Script
echo "🚀 Starting ATS Optimizer Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run 'git init' first."
    exit 1
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  You're not on the main branch. Current branch: $current_branch"
    read -p "Do you want to continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Add and commit changes
echo "📝 Adding and committing changes..."
git add .
git commit -m "Deploy to production - $(date)"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Deploy backend to Railway: https://railway.app"
echo "2. Deploy frontend to Netlify: https://netlify.com"
echo "3. Update environment variables in both platforms"
echo "4. Update Google OAuth settings with production URLs"
echo ""
echo "📖 See NETLIFY_DEPLOYMENT.md for detailed instructions"
