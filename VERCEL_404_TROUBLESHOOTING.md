# 🚨 Vercel 404 Error Troubleshooting Guide

## Error: 404 NOT_FOUND Code: NOT_FOUND

This error typically occurs when Vercel can't find the correct files or routing configuration for your Single Page Application (SPA).

## 🔧 Quick Fixes

### Fix 1: Use Simple Vercel Configuration

Replace your `frontend/vercel.json` with this minimal configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Fix 2: Check Build Output

1. **Verify Build Directory**
   ```bash
   cd frontend
   npm run build
   ls -la dist/
   ```
   Ensure `dist/index.html` exists.

2. **Check Vercel Build Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check "Build Logs" for errors

### Fix 3: Environment Variables

Ensure you have the required environment variable:
```bash
VITE_API_URL=https://your-backend-app.onrender.com
```

## 🛠️ Step-by-Step Resolution

### Step 1: Clean Deployment

1. **Delete Current Deployment**
   - Go to Vercel Dashboard
   - Delete the current project
   - Or redeploy with fresh configuration

2. **Use Simple Configuration**
   ```bash
   # In frontend directory
   rm vercel.json
   # Create new simple vercel.json (see Fix 1 above)
   ```

### Step 2: Redeploy

1. **Via Vercel Dashboard**
   - Import project again
   - Set root directory to `frontend`
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Via CLI**
   ```bash
   cd frontend
   vercel --prod
   ```

### Step 3: Verify Configuration

1. **Check Project Settings**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Check Environment Variables**
   ```bash
   vercel env ls
   ```

## 🔍 Common Causes & Solutions

### Cause 1: Incorrect Root Directory
**Problem**: Vercel is looking in the wrong directory
**Solution**: Set root directory to `frontend` in project settings

### Cause 2: Missing index.html
**Problem**: Build didn't generate index.html
**Solution**: 
```bash
cd frontend
npm run build
# Check if dist/index.html exists
```

### Cause 3: Routing Configuration
**Problem**: SPA routes not redirecting to index.html
**Solution**: Use the simple vercel.json configuration above

### Cause 4: Build Failures
**Problem**: Build process failed silently
**Solution**: Check build logs in Vercel dashboard

### Cause 5: Environment Variables
**Problem**: Missing or incorrect environment variables
**Solution**: 
```bash
vercel env add VITE_API_URL
# Enter your backend URL
```

## 🧪 Testing Locally

1. **Build and Test**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Check Build Output**
   ```bash
   ls -la dist/
   # Should see index.html and assets folder
   ```

## 📋 Deployment Checklist

- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework: Vite
- [ ] Environment variable `VITE_API_URL` set
- [ ] `vercel.json` with proper rewrites
- [ ] Build completes successfully
- [ ] `dist/index.html` exists

## 🚀 Alternative Deployment Methods

### Method 1: Vercel CLI with Force
```bash
cd frontend
vercel --force
```

### Method 2: GitHub Integration
1. Push changes to GitHub
2. Connect repository to Vercel
3. Set correct configuration
4. Deploy

### Method 3: Manual Upload
1. Build locally: `npm run build`
2. Upload `dist/` folder to Vercel
3. Set up routing manually

## 🔧 Advanced Configuration

If simple configuration doesn't work, try this advanced vercel.json:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 📞 Getting Help

### Check These Resources
1. **Vercel Build Logs**: Dashboard → Project → Deployments → Build Logs
2. **Function Logs**: Dashboard → Project → Functions
3. **Vercel Status**: [vercel-status.com](https://vercel-status.com)

### Debug Commands
```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Check environment variables
vercel env ls

# Inspect build
vercel build
```

## ✅ Success Indicators

Your deployment is working when:
- ✅ Homepage loads without 404
- ✅ React Router navigation works
- ✅ All routes redirect to index.html
- ✅ Assets load correctly
- ✅ Environment variables are accessible

---

## 🎯 Quick Resolution

**Most Common Fix**: Use the simple vercel.json configuration and ensure your root directory is set to `frontend` in Vercel project settings.

**If still having issues**: Check the build logs in Vercel dashboard for specific error messages.
