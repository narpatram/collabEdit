# 🚀 Deploying Collaborative Editor to Netlify

## Overview
Your collaborative text editor consists of two parts:
1. **Frontend (React + Vite)** - Can be hosted on Netlify
2. **Backend (WebSocket Server)** - Needs a separate hosting solution

## 📋 Deployment Options

### Option 1: Frontend on Netlify + Backend on Railway/Render (Recommended)

#### Step 1: Deploy Frontend to Netlify

1. **Create a Netlify Build Configuration**
   Create `netlify.toml` in your project root:

```toml
[build]
  base = "react-app"
  publish = "react-app/dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Update WebSocket Connection for Production**
   You'll need to update your frontend to use the production WebSocket URL.
   
   In your React app, create an environment variable:
   ```bash
   # In react-app/.env.production
   VITE_WS_URL=wss://your-backend-url.railway.app
   ```

3. **Deploy to Netlify**:
   - Push your code to GitHub
   - Connect your repository to Netlify
   - Set build directory to `react-app`
   - Deploy

#### Step 2: Deploy Backend to Railway/Render

**For Railway:**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Select the `server` directory
4. Deploy automatically

**For Render:**
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`

### Option 2: Netlify Functions (Serverless) - Limited WebSocket Support

⚠️ **Note**: Netlify Functions don't support persistent WebSocket connections well. This option would require significant refactoring.

### Option 3: Full Stack on Vercel (Alternative)

If you want everything in one place, consider Vercel which has better full-stack support.

## 🔧 Required Code Changes

### 1. Update WebSocket URL in Frontend

Create a configuration file in your React app:

```javascript
// react-app/src/config.js
const config = {
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
};

export default config;
```

### 2. Add Environment Variables

```bash
# react-app/.env.local (for development)
VITE_WS_URL=ws://localhost:8080

# react-app/.env.production (for production)
VITE_WS_URL=wss://your-backend-domain.com
```

### 3. Update CORS in Backend

```javascript
// In your server/index.js, add CORS headers if needed
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-netlify-app.netlify.app'
];
```

## 📝 Step-by-Step Deployment Guide

### Phase 1: Prepare for Deployment

1. **Create build configuration**:
   ```bash
   # Create netlify.toml in project root
   ```

2. **Add environment handling to React app**

3. **Test production build locally**:
   ```bash
   cd react-app
   npm run build
   npm run preview
   ```

### Phase 2: Deploy Backend First

1. Choose a backend hosting service (Railway, Render, or Heroku)
2. Deploy your server directory
3. Note the WebSocket URL (usually wss://your-app.platform.com)

### Phase 3: Deploy Frontend to Netlify

1. Update production environment variables
2. Push to GitHub
3. Connect to Netlify
4. Configure build settings
5. Deploy

## 🔍 Recommended Services for Backend

| Service | Pros | Cons | Free Tier |
|---------|------|------|-----------|
| **Railway** | Easy deployment, great DX | Limited free tier | 500 hours/month |
| **Render** | Good free tier, reliable | Slower cold starts | Yes, with limitations |
| **Heroku** | Mature platform | Expensive, no free tier | No |
| **Fly.io** | Great performance | Learning curve | Limited |

## 🚨 Important Considerations

1. **WebSocket Persistence**: Your current server uses in-memory storage. Consider adding a database for production.

2. **Environment Variables**: Make sure to set proper CORS origins and WebSocket URLs.

3. **SSL/TLS**: Use `wss://` (secure WebSocket) in production, not `ws://`.

4. **Error Handling**: Add reconnection logic for network issues.

5. **Scaling**: Consider using Redis for multi-instance WebSocket scaling.

## 🔗 Quick Links

- [Netlify Docs](https://docs.netlify.com/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)

Would you like me to help you implement any of these steps? 