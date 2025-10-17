# ✅ Production Deployment Checklist

## 🔧 Pre-Deployment

### Backend (Render)
- [ ] **Environment Variables Set**
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `API_BASE_URL=https://your-app.onrender.com`
  - [ ] `FRONTEND_ORIGIN=https://your-app.vercel.app`
  - [ ] `MONGO_URI=mongodb+srv://...`
  - [ ] `JWT_SECRET=strong-secret-key`
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `RATE_LIMIT_WINDOW_MS=900000`
  - [ ] `RATE_LIMIT_MAX=100`
  - [ ] `CLOUDINARY_CLOUD_NAME=...`
  - [ ] `CLOUDINARY_API_KEY=...`
  - [ ] `CLOUDINARY_API_SECRET=...`

- [ ] **Build Configuration**
  - [ ] Root directory: `server`
  - [ ] Build command: `npm install && npm run build`
  - [ ] Start command: `npm start`
  - [ ] Node version: 18+

### Frontend (Vercel)
- [ ] **Environment Variables Set**
  - [ ] `VITE_API_URL=https://your-backend.onrender.com`

- [ ] **Build Configuration**
  - [ ] Root directory: `frontend`
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Node version: 18+

## 🗄️ Database Setup

### MongoDB Atlas
- [ ] **Cluster Created**
  - [ ] M0 Sandbox (free tier)
  - [ ] Region selected
  - [ ] Cluster created and running

- [ ] **Database User**
  - [ ] User created with read/write permissions
  - [ ] Username and password noted
  - [ ] Database user permissions configured

- [ ] **Network Access**
  - [ ] IP whitelist: `0.0.0.0/0` (allows Render access)
  - [ ] Connection string obtained
  - [ ] Connection string updated with credentials

## ☁️ Image Storage

### Cloudinary
- [ ] **Account Setup**
  - [ ] Free account created
  - [ ] Cloud name obtained
  - [ ] API key obtained
  - [ ] API secret obtained
  - [ ] Credentials added to backend environment

## 🚀 Deployment

### Backend (Render)
- [ ] **Service Created**
  - [ ] GitHub repository connected
  - [ ] Service type: Web Service
  - [ ] All environment variables set
  - [ ] Build and start commands configured
  - [ ] Service deployed successfully

- [ ] **Health Check**
  - [ ] Service is running
  - [ ] Health endpoint responds: `GET /api/health`
  - [ ] No build errors in logs
  - [ ] Service URL obtained

### Frontend (Vercel)
- [ ] **Project Created**
  - [ ] GitHub repository connected
  - [ ] Root directory set to `frontend`
  - [ ] Environment variables set
  - [ ] Project deployed successfully

- [ ] **Health Check**
  - [ ] Site loads without errors
  - [ ] No build errors in logs
  - [ ] Frontend URL obtained

## 🔄 Post-Deployment

### Update Configuration
- [ ] **Backend Updated**
  - [ ] `FRONTEND_ORIGIN` updated with actual Vercel URL
  - [ ] `API_BASE_URL` updated with actual Render URL
  - [ ] Backend redeployed with correct URLs

- [ ] **Frontend Updated**
  - [ ] `VITE_API_URL` updated with actual Render URL
  - [ ] Frontend redeployed with correct URL

### Database Migrations
- [ ] **Migrations Run**
  - [ ] Connect to Render shell
  - [ ] Run: `npm run migrate:up`
  - [ ] Verify migrations completed successfully
  - [ ] Check database for expected collections

## 🧪 Testing

### Backend Testing
- [ ] **API Endpoints**
  - [ ] Health check: `GET /api/health`
  - [ ] Version: `GET /api/version`
  - [ ] Config: `GET /api/config`
  - [ ] All endpoints respond correctly

### Frontend Testing
- [ ] **Core Functionality**
  - [ ] Site loads successfully
  - [ ] User registration works
  - [ ] User login works
  - [ ] Seed creation works
  - [ ] Image upload works
  - [ ] Forking works
  - [ ] Lineage tree displays
  - [ ] Profile page works

### Integration Testing
- [ ] **End-to-End**
  - [ ] Create account
  - [ ] Upload image seed
  - [ ] Create text seed
  - [ ] Fork a seed
  - [ ] View lineage tree
  - [ ] Check profile page
  - [ ] All features work together

## 🔐 Security

### Security Checklist
- [ ] **Authentication**
  - [ ] JWT secret is strong (32+ characters)
  - [ ] JWT expiration set appropriately
  - [ ] Authentication required for protected routes

- [ ] **CORS**
  - [ ] CORS configured correctly
  - [ ] Only frontend origin allowed
  - [ ] Credentials enabled

- [ ] **Rate Limiting**
  - [ ] Rate limiting enabled
  - [ ] Appropriate limits set
  - [ ] Rate limit headers present

- [ ] **Security Headers**
  - [ ] Helmet configured
  - [ ] Security headers present
  - [ ] Content Security Policy set

## 📊 Monitoring

### Monitoring Setup
- [ ] **Backend Monitoring**
  - [ ] Render service health monitored
  - [ ] Logs accessible
  - [ ] Alerts configured (if needed)

- [ ] **Frontend Monitoring**
  - [ ] Vercel analytics enabled
  - [ ] Error tracking configured
  - [ ] Performance monitoring active

- [ ] **Database Monitoring**
  - [ ] MongoDB Atlas monitoring enabled
  - [ ] Connection monitoring active
  - [ ] Alerts configured

## 🎯 Final Verification

### Production Readiness
- [ ] **Performance**
  - [ ] Site loads quickly
  - [ ] Images load properly
  - [ ] No console errors
  - [ ] Mobile responsive

- [ ] **Functionality**
  - [ ] All features work
  - [ ] No broken links
  - [ ] Forms submit correctly
  - [ ] Data persists correctly

- [ ] **User Experience**
  - [ ] Navigation works
  - [ ] Error messages clear
  - [ ] Loading states present
  - [ ] Responsive design

## 🚀 Go Live

### Final Steps
- [ ] **Documentation**
  - [ ] Deployment guide updated
  - [ ] Environment variables documented
  - [ ] URLs and credentials saved securely

- [ ] **Backup**
  - [ ] MongoDB Atlas backups enabled
  - [ ] Code repository backed up
  - [ ] Environment variables backed up

- [ ] **Announcement**
  - [ ] Site is live and functional
  - [ ] Ready for users
  - [ ] Monitoring active

---

## 🎉 Congratulations!

Your Artive application is now live and ready for users to create, fork, and share their creative seeds!

### Quick Links
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.onrender.com
- **Health Check**: https://your-app.onrender.com/api/health

### Support
- **Render**: Check service logs and metrics
- **Vercel**: Check deployment logs and analytics
- **MongoDB**: Check Atlas monitoring dashboard
