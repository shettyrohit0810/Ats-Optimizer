# 🚀 ATS Optimizer Deployment Guide

This guide will help you deploy your ATS Optimizer application to production using Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

1. **GitHub Account** - For hosting your code
2. **Vercel Account** - For frontend deployment (free)
3. **Railway Account** - For backend deployment (free tier available)
4. **Google Cloud Console** - For OAuth setup
5. **OpenAI Account** - For API key

## 🔧 Step 1: Prepare Your Code

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/ats-optimizer.git
git push -u origin main
```

### 1.2 Set up Environment Variables

#### Frontend (.env.local)
```bash
# Copy the example file
cp frontend/env.example frontend/.env.local

# Edit with your values
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://your-frontend-url.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
OPENAI_API_KEY=your_openai_api_key
```

#### Backend (.env)
```bash
# Copy the example file
cp backend/env.example backend/.env

# Edit with your values
PORT=5000
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🌐 Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Select the `backend` folder
5. Railway will automatically detect it's a Node.js project

### 2.3 Configure Environment Variables
1. Go to your project dashboard
2. Click on "Variables" tab
3. Add all the environment variables from `backend/.env`
4. Make sure to set `FRONTEND_URL` to your Vercel URL (you'll get this after frontend deployment)

### 2.4 Get Backend URL
1. Railway will provide a URL like `https://your-project-name.railway.app`
2. Copy this URL - you'll need it for the frontend

## ⚡ Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Vercel will automatically detect it's a Next.js project

### 3.3 Configure Environment Variables
1. Go to your project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add all the environment variables from `frontend/.env.local`
4. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL

### 3.4 Get Frontend URL
1. Vercel will provide a URL like `https://your-project-name.vercel.app`
2. Copy this URL

## 🔄 Step 4: Update URLs

### 4.1 Update Backend CORS
1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` variable to your Vercel URL
3. Redeploy if necessary

### 4.2 Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add your Vercel URL to "Authorized JavaScript origins"
5. Add your Vercel URL + `/api/auth/callback/google` to "Authorized redirect URIs"

## 🧪 Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Try logging in with Google
3. Upload a resume and test the analysis
4. Check that all features work correctly

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly in Railway
2. **OAuth Errors**: Check that Google OAuth URLs are updated
3. **API Errors**: Verify that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
4. **Build Errors**: Check the build logs in Vercel/Railway dashboards

### Debug Steps:

1. Check browser console for errors
2. Check Vercel function logs
3. Check Railway deployment logs
4. Verify all environment variables are set

## 📊 Monitoring

- **Vercel**: Monitor frontend performance and errors
- **Railway**: Monitor backend logs and resource usage
- **Google Cloud**: Monitor OAuth usage

## 🔄 Updates

To update your deployment:
1. Push changes to GitHub
2. Vercel and Railway will automatically redeploy
3. Update environment variables if needed

## 💰 Costs

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Railway**: Free tier includes $5 credit/month
- **Google OAuth**: Free
- **OpenAI API**: Pay per use

## 🎉 Success!

Your ATS Optimizer is now live and accessible to users worldwide!

**Frontend**: https://your-project.vercel.app
**Backend**: https://your-project.railway.app
