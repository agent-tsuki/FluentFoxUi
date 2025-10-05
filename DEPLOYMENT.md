# 🚀 Production Deployment Guide

## Render Deployment Steps

### Prerequisites
1. **Backend API**: Ensure your FastAPI backend is deployed and accessible
2. **Domain/URL**: Note your backend API URL (e.g., `https://your-api.onrender.com`)

### Step 1: Prepare Repository
1. Push all changes to your GitHub repository
2. Ensure all files are committed, especially:
   - `render.yaml`
   - Updated `next.config.ts`
   - `.env.example`

### Step 2: Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `fluentfox-ui` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your production branch)
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### Step 3: Environment Variables
In Render service settings, add these environment variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

⚠️ **Important**: Replace `https://your-backend-api-url.com` with your actual backend URL!

### Step 4: Advanced Settings (Optional)
- **Auto-Deploy**: Enable for automatic deployments on git push
- **Health Check Path**: `/` (default)
- **Instance Type**: Starter (free tier) or upgrade as needed

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for the build and deployment process
3. Your app will be available at: `https://your-service-name.onrender.com`

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Node environment | `production` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://api.yourservice.com` |
| `NEXT_BUILD_TURBO` | No | Enable Turbo build | `true` |

## Build Commands

```bash
# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check environment variables are set
   - Ensure all dependencies are in `package.json`
   - Review build logs in Render

2. **API Connection Issues**:
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS settings on backend
   - Ensure backend is accessible from Render's servers

3. **Performance Issues**:
   - Consider upgrading from free tier
   - Enable Next.js optimizations
   - Check image optimization settings

### Health Check
Your app includes a health check at `/` that Render will use to verify deployment.

## Post-Deployment Checklist

- [ ] App loads correctly at Render URL
- [ ] API connections work (test file upload/conversion)
- [ ] All pages and features function properly
- [ ] Error monitoring is set up
- [ ] Domain configured (if using custom domain)

## Monitoring

- Monitor deployment logs in Render dashboard
- Set up error tracking (e.g., Sentry) for production
- Configure uptime monitoring

## Updates

To update your deployment:
1. Push changes to your repository
2. Render will automatically rebuild and deploy (if auto-deploy is enabled)
3. Monitor the deployment in Render dashboard