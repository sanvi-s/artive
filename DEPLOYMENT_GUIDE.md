# 🚀 Artive Deployment Guide

This guide will help you deploy Artive to production with the backend (Express.js) on Render and frontend (Vite + React) on Vercel.

## 📋 Prerequisites

- GitHub repository with your code
- MongoDB Atlas account (for database)
- Cloudinary account (for image storage)
- Render account (for backend)
- Vercel account (for frontend)

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (M0 Sandbox is free)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a user with read/write permissions
   - Note down the username and password

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Add `0.0.0.0/0` to allow access from anywhere (for Render)

4. **Get Connection String**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `artive`

## ☁️ Image Storage Setup (Cloudinary)

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get API Credentials**
   - Go to your dashboard
   - Note down:
     - Cloud Name
     - API Key
     - API Secret

## 🔧 Backend Deployment (Render)

### Step 1: Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `server` folder as the root directory

### Step 2: Configure Build Settings
```
Build Command: npm install && npm run build
Start Command: npm start
Node Version: 18+
```

### Step 3: Set Environment Variables
In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
API_BASE_URL=https://your-app-name.onrender.com
FRONTEND_ORIGIN=https://your-frontend-domain.vercel.app
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/artive?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note down your backend URL (e.g., `https://artive-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to `frontend`

### Step 2: Configure Build Settings
Vercel will auto-detect these settings for Vite:
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Framework Preset: Vite
```

### Step 3: Set Environment Variables
In the Vercel dashboard, add these environment variables:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note down your frontend URL (e.g., `https://artive.vercel.app`)

## 🔄 Update Backend with Frontend URL

After getting your frontend URL, update the backend environment variable:

1. Go to your Render dashboard
2. Go to your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_ORIGIN` to your actual Vercel URL
5. Redeploy the service

## 🗃️ Database Migrations

After deployment, run the database migrations:

1. Go to your Render dashboard
2. Go to your backend service
3. Go to "Shell" tab
4. Run: `npm run migrate:up`

## 🧪 Testing Your Deployment

1. **Test Backend Health**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return a success message

2. **Test Frontend**
   - Visit your Vercel URL
   - Try creating an account
   - Try uploading an image
   - Try forking a seed

3. **Test Database Connection**
   - Try creating a seed
   - Check if it appears in MongoDB Atlas

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure `FRONTEND_ORIGIN` in backend matches your Vercel URL exactly
   - Check for trailing slashes

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network access settings in MongoDB Atlas
   - Ensure database user has proper permissions

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check if Cloudinary account is active

4. **Build Failures**
   - Check build logs in Render/Vercel
   - Ensure all dependencies are in package.json
   - Check for TypeScript errors

### Logs and Debugging:

- **Render**: Check "Logs" tab in your service dashboard
- **Vercel**: Check "Functions" tab for serverless function logs
- **MongoDB**: Check "Logs" in MongoDB Atlas dashboard

## 📊 Monitoring

1. **Render Monitoring**
   - Check service health in dashboard
   - Monitor response times
   - Set up alerts for downtime

2. **Vercel Monitoring**
   - Check analytics in dashboard
   - Monitor Core Web Vitals
   - Set up error tracking

3. **Database Monitoring**
   - Monitor connection count in MongoDB Atlas
   - Set up alerts for high usage

## 🔐 Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] MongoDB user has minimal required permissions
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] HTTPS enabled (automatic on Render/Vercel)

## 🚀 Going Live

1. **Update DNS** (if using custom domain)
2. **Test all functionality**
3. **Monitor for 24 hours**
4. **Set up backups** (MongoDB Atlas has automatic backups)
5. **Document your deployment** for future updates

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables
3. Test locally with production environment variables
4. Check service status pages (Render, Vercel, MongoDB Atlas)

---

**Happy Deploying! 🎉**

Your Artive application should now be live and ready for users to create, fork, and share their creative seeds!
