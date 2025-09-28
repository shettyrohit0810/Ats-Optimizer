# 🚀 Netlify Deployment Guide for ATS Optimizer

This guide will help you deploy your ATS Optimizer project using Netlify for the frontend and Railway for the backend.

## 📋 Prerequisites

1. **GitHub Account** - For hosting your code
2. **Netlify Account** - For frontend deployment (free)
3. **Railway Account** - For backend deployment (free tier available)
4. **Google Cloud Console** - For OAuth setup
5. **OpenAI Account** - For API key

## 🔧 Step 1: Prepare Your Code

### 1.1 Push to GitHub
```bash
# Initialize git if not already done

You reached the start of the range
Sep 28, 2025, 8:00 AM
 
[Region: us-west1]
==============
Using Nixpacks
==============

context: v7c3-S4lc
╔════════ Nixpacks v1.38.0 ═══════╗
║ setup      │ nodejs_18, npm-9_x ║
║─────────────────────────────────║
║ install    │ npm ci             ║
║─────────────────────────────────║
║ build      │ npm run build      ║
║─────────────────────────────────║
║ start      │ npm run start      ║
╚═════════════════════════════════╝

internal
load build definition from Dockerfile
0ms

internal
load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
282ms

internal
load .dockerignore
0ms

internal
load build context
0ms

stage-0
FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
8ms

stage-0
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d cached
0ms

stage-0
COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix cached
0ms

stage-0
WORKDIR /app/ cached
0ms

stage-0
COPY . /app/.
96ms

stage-0
RUN npm ci
12s
Run `npm audit` for details.

stage-0
COPY . /app/.
104ms

stage-0
RUN npm run build
1s
> tsc

stage-0
RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
145ms

stage-0
COPY . /app
29ms

importing to docker
8s

auth
sharing credentials for production-us-west2.railway-registry.com
0ms
=== Successfully Built! ===
Run:
docker run -it production-us-west2.railway-registry.com/e3a20655-ae84-4e4b-affc-31eef6ef16a2:022b3fe2-4274-45fd-958e-7ddbf4cd3115
Build time: 79.45 seconds
 
====================
Starting Healthcheck
====================
Path: /health
Retry window: 30s
 
Attempt #1 failed with service unavailable. Continuing to retry for 19s
Attempt #2 failed with service unavailable. Continuing to retry for 18s
Attempt #3 failed with service unavailable. Continuing to retry for 6s
 
1/1 replicas never became healthy!

Healthcheck failed!


git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/ats-optimizer.git
git push -u origin main
```

### 1.2 Set up Environment Variables

#### Frontend (for Netlify)
```bash
# Copy the production environment file
cp frontend/env.production frontend/.env.local

# Edit with your values
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://your-app-name.netlify.app
NEXTAUTH_SECRET=your_nextauth_secret
OPENAI_API_KEY=your_openai_api_key
```

#### Backend (for Railway)
```bash
# Copy the environment file
cp backend/env.example backend/.env

# Edit with your values
PORT=5000
NODE_ENV=production
BACKEND_URL=https://your-backend-url.railway.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=https://your-app-name.netlify.app
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
4. Make sure to set `FRONTEND_URL` to your Netlify URL (you'll get this after frontend deployment)

### 2.4 Get Backend URL
1. Railway will provide a URL like `https://your-project-name.railway.app`
2. Copy this URL - you'll need it for the frontend

## ⚡ Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 3.2 Deploy Frontend
1. Click "New site from Git"
2. Choose "GitHub" as your Git provider
3. Select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Click "Deploy site"

### 3.3 Configure Environment Variables
1. Go to your site dashboard
2. Click on "Site settings" → "Environment variables"
3. Add all the environment variables from `frontend/.env.local`
4. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
5. Set `NEXTAUTH_URL` to your Netlify URL

### 3.4 Get Frontend URL
1. Netlify will provide a URL like `https://your-app-name.netlify.app`
2. Copy this URL

## 🔄 Step 4: Update URLs

### 4.1 Update Backend CORS
1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` variable to your Netlify URL
3. Redeploy if necessary

### 4.2 Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add your Netlify URL to "Authorized JavaScript origins"
5. Add your Netlify URL + `/api/auth/callback/google` to "Authorized redirect URIs"

## 🧪 Step 5: Test Your Deployment

1. Visit your Netlify URL
2. Try logging in with Google
3. Upload a resume and test the analysis
4. Check that all features work correctly

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly in Railway
2. **OAuth Errors**: Check that Google OAuth URLs are updated
3. **API Errors**: Verify that `NEXT_PUBLIC_API_URL` is set correctly in Netlify
4. **Build Errors**: Check the build logs in Netlify dashboard

### Debug Steps:

1. Check browser console for errors
2. Check Netlify function logs
3. Check Railway deployment logs
4. Verify all environment variables are set

## 📊 Monitoring

- **Netlify**: Monitor frontend performance and errors
- **Railway**: Monitor backend logs and resource usage
- **Google Cloud**: Monitor OAuth usage

## 🔄 Updates

To update your deployment:
1. Push changes to GitHub
2. Netlify and Railway will automatically redeploy
3. Update environment variables if needed

## 💰 Costs

- **Netlify**: Free tier includes 100GB bandwidth/month
- **Railway**: Free tier includes $5 credit/month
- **Google OAuth**: Free
- **OpenAI API**: Pay per use

## 🎉 Success!

Your ATS Optimizer is now live and accessible to users worldwide!

**Frontend**: https://your-app-name.netlify.app
**Backend**: https://your-project-name.railway.app

## 🔗 Quick Links

- [Netlify Dashboard](https://app.netlify.com)
- [Railway Dashboard](https://railway.app)
- [Google Cloud Console](https://console.cloud.google.com)
