# 🚀 Artive - Production Deployment

## 📋 Quick Start

### Backend (Express.js on Render)
1. Connect GitHub repository to Render
2. Set root directory to `server`
3. Add environment variables (see DEPLOYMENT_GUIDE.md)
4. Deploy

### Frontend (Vite + React on Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

## 🔧 Environment Variables

### Backend (Render)
```bash
NODE_ENV=production
PORT=5000
API_BASE_URL=https://your-app.onrender.com
FRONTEND_ORIGIN=https://your-app.vercel.app
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/artive
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## 🗄️ Database Setup

1. Create MongoDB Atlas cluster
2. Create database user with read/write permissions
3. Whitelist all IPs (0.0.0.0/0) for Render access
4. Get connection string and update MONGO_URI

## ☁️ Image Storage

1. Create Cloudinary account
2. Get API credentials
3. Add to backend environment variables

## 🚀 Build Commands

### Backend
```bash
npm install
npm run build
npm start
```

### Frontend
```bash
npm install
npm run build
```

## 🔍 Health Checks

- Backend: `GET /api/health`
- Frontend: Check Vercel deployment status

## 📊 Monitoring

- **Render**: Service logs and metrics
- **Vercel**: Analytics and function logs
- **MongoDB**: Atlas monitoring dashboard

## 🔐 Security

- ✅ HTTPS enabled (automatic)
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Helmet security headers
- ✅ JWT authentication
- ✅ Environment variables secured

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_ORIGIN matches Vercel URL exactly
   - No trailing slashes

2. **Database Connection**
   - Verify MongoDB connection string
   - Check network access settings
   - Ensure user permissions

3. **Image Upload**
   - Verify Cloudinary credentials
   - Check account status

4. **Build Failures**
   - Check build logs
   - Verify all dependencies
   - Check TypeScript errors

### Logs

- **Render**: Dashboard → Service → Logs
- **Vercel**: Dashboard → Project → Functions
- **MongoDB**: Atlas → Monitoring

## 📈 Performance

- **Backend**: Render free tier (512MB RAM)
- **Frontend**: Vercel edge network
- **Database**: MongoDB Atlas M0 (512MB)
- **Images**: Cloudinary CDN

## 🔄 Updates

1. Push to GitHub
2. Render/Vercel auto-deploys
3. Monitor deployment logs
4. Test functionality

## 📞 Support

- Check logs first
- Verify environment variables
- Test locally with production config
- Check service status pages

---

**Ready for Production! 🎉**
