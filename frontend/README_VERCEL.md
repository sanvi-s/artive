# 🚀 Artive Frontend - Vercel Deployment

## Quick Start

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel
```

### 2. Set Environment Variables
```bash
# Set API URL
vercel env add VITE_API_URL
# Enter: https://your-backend-app.onrender.com

# Deploy to production
vercel --prod
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API URL | `https://artive-backend.onrender.com` |

## Configuration Files

- **`vercel.json`**: Vercel deployment configuration
- **`.vercelignore`**: Files to ignore during deployment

## Build Process

1. **Install Dependencies**: `npm install`
2. **Build Application**: `npm run build`
3. **Output Directory**: `dist/`
4. **Framework**: Vite + React

## Features

- ✅ **SPA Routing**: All routes redirect to `index.html`
- ✅ **Asset Caching**: Static assets cached for 1 year
- ✅ **Security Headers**: XSS protection, content type options
- ✅ **Performance**: Optimized build with code splitting
- ✅ **HTTPS**: Automatic SSL certificates

## Troubleshooting

### Build Issues
```bash
# Check build locally
npm run build

# Check Vercel logs
vercel logs
```

### Environment Variables
```bash
# List current variables
vercel env ls

# Add missing variable
vercel env add VITE_API_URL
```

### Routing Issues
- Ensure `vercel.json` has proper rewrites
- Check that all routes redirect to `index.html`

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **React Docs**: [react.dev](https://react.dev)
