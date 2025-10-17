# 🚀 Vercel Deployment Guide for Artive Frontend

This guide will help you deploy the Artive frontend (Vite + React) to Vercel with optimal configuration.

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- Backend API deployed and accessible
- Environment variables ready

## 🎯 Quick Deployment

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Get your live URL

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-backend-app.onrender.com
   ```

6. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## ⚙️ Vercel Configuration

### vercel.json (Optional but Recommended)

Create `frontend/vercel.json` for optimal configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://artive-backend.onrender.com` |

### Setting Environment Variables

#### Via Dashboard
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-app.onrender.com`
   - **Environment**: Production, Preview, Development

#### Via CLI
```bash
vercel env add VITE_API_URL
# Enter the value when prompted
# Select environments: Production, Preview, Development
```

## 🚀 Build Configuration

### Package.json Scripts
Ensure your `frontend/package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Vite Configuration
Your `frontend/vite.config.ts` should include:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
```

## 🔄 Deployment Process

### Automatic Deployments
- **Push to main branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment

### Manual Deployments
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 📊 Performance Optimization

### Build Optimization
- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Automatic with Vite
- **Asset Optimization**: Automatic with Vite
- **Caching**: Configured in vercel.json

### CDN Benefits
- **Global Edge Network**: Fast loading worldwide
- **Automatic HTTPS**: SSL certificates
- **Image Optimization**: Automatic image optimization
- **Compression**: Gzip/Brotli compression

## 🔍 Monitoring & Analytics

### Vercel Analytics
1. **Enable Analytics**
   - Go to project settings
   - Enable "Vercel Analytics"
   - Get performance insights

2. **View Metrics**
   - Core Web Vitals
   - Page load times
   - User experience metrics

### Error Monitoring
- **Function Logs**: View in Vercel dashboard
- **Build Logs**: Check deployment logs
- **Runtime Errors**: Monitor in dashboard

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm install
npm run build
```

#### Environment Variables Not Working
```bash
# Verify variables are set
vercel env ls

# Redeploy after adding variables
vercel --prod
```

#### Routing Issues
- Ensure `vercel.json` has proper rewrites
- Check that all routes redirect to `index.html`

#### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is accessible

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

## 🔐 Security

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel's environment variable system
- ✅ Different values for different environments

### HTTPS
- ✅ Automatic HTTPS on Vercel
- ✅ SSL certificates managed automatically
- ✅ HTTP redirects to HTTPS

### CORS
- ✅ Configure backend CORS for Vercel domain
- ✅ Use environment variables for origins

## 📈 Scaling

### Vercel Limits (Free Tier)
- **Bandwidth**: 100GB/month
- **Function Executions**: 100GB-hours/month
- **Build Minutes**: 6000 minutes/month

### Upgrading
- **Pro Plan**: $20/month for higher limits
- **Team Plan**: $20/user/month for teams
- **Enterprise**: Custom pricing

## 🔄 Updates & Maintenance

### Updating Frontend
1. **Push changes to GitHub**
2. **Vercel auto-deploys**
3. **Check deployment status**
4. **Test functionality**

### Updating Environment Variables
1. **Update in Vercel dashboard**
2. **Redeploy manually or wait for next push**
3. **Verify changes work**

### Monitoring
- **Check Vercel dashboard regularly**
- **Monitor performance metrics**
- **Watch for error spikes**
- **Update dependencies regularly**

## 📞 Support

### Vercel Support
- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status Page**: [vercel-status.com](https://vercel-status.com)

### Common Resources
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)
- **React Documentation**: [react.dev](https://react.dev)
- **Vercel Examples**: [github.com/vercel/examples](https://github.com/vercel/examples)

---

## 🎉 Deployment Complete!

Your Artive frontend is now deployed on Vercel with:

- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Automatic HTTPS**: Secure connections
- ✅ **Environment Variables**: Secure configuration
- ✅ **Auto Deployments**: GitHub integration
- ✅ **Performance Monitoring**: Built-in analytics
- ✅ **Error Tracking**: Function and build logs

**Your frontend is live and ready!** 🚀

---

*Built with ❤️ for creative collaboration and seed sharing*
