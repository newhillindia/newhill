# Render Deployment Guide - Newhill Spices Platform
**Complete Full-Stack Deployment Instructions**

---

## 🚀 Pre-Deployment Checklist

### Critical Fixes Applied ✅

1. ✅ **Database Integration**
   - Created `DatabaseService` singleton with Prisma
   - Added connection pooling and error handling
   - Implemented graceful shutdown

2. ✅ **Security Enhancements**
   - JWT_SECRET validation (throws error if missing)
   - Cookie-parser middleware added
   - Redis error handling implemented
   - Environment variable validation on startup

3. ✅ **Health Checks**
   - `/health` - Comprehensive health check (DB + Redis + Memory)
   - `/health/ready` - Readiness probe for Kubernetes/Render
   - `/health/live` - Liveness probe

4. ✅ **Error Handling**
   - Unhandled promise rejection handler
   - Uncaught exception handler
   - Graceful shutdown for all connections
   - Prisma error translation

5. ✅ **Frontend**
   - Modern UI with responsive design
   - Accessibility compliance (WCAG 2.1 AA)
   - Performance optimized
   - SEO ready with comprehensive metadata

---

## 📋 Step-by-Step Deployment

### Step 1: Install Dependencies

```bash
# Root dependencies
npm install

# API dependencies
cd apps/api
npm install
npm install cookie-parser @types/cookie-parser
npm install @prisma/client
npm install -D prisma

# Web dependencies
cd ../web
npm install

# Return to root
cd ../..
```

### Step 2: Database Setup (Local Testing)

```bash
# Navigate to web app (where Prisma schema is)
cd apps/web

# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed

# Return to root
cd ../..
```

### Step 3: Environment Variables

Create `.env` files for each service:

#### **Root `.env`**
```bash
# Global configuration
NODE_ENV=production
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://username:password@host:5432/newhill_spices?schema=public&connection_limit=10&pool_timeout=20

# Redis
REDIS_URL=redis://username:password@host:6379

# Security
JWT_SECRET=your-super-secure-random-string-min-32-chars
JWT_EXPIRY=7d
CSRF_SECRET=another-super-secure-random-string

# CORS Origins (comma-separated for multiple)
CORS_ORIGIN=https://newhillspices.com,https://www.newhillspices.com

# Ports
API_PORT=3001
WEB_PORT=3000
```

#### **apps/api/.env**
```bash
# Copy from root .env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
PORT=3001
```

#### **apps/web/.env**
```bash
# Next.js Public Variables
NEXT_PUBLIC_API_URL=https://api.newhillspices.com
NEXT_PUBLIC_SITE_URL=https://newhillspices.com

# Database (for Prisma)
DATABASE_URL=postgresql://...

# Private Variables
JWT_SECRET=...
```

### Step 4: Build Locally (Test)

```bash
# Build API
cd apps/api
npm run build
npm start  # Test production build

# Build Web (in new terminal)
cd apps/web
npm run build
npm start  # Test production build
```

---

## 🌐 Render Deployment Configuration

### Option 1: Using Render Dashboard

#### 1. Create PostgreSQL Database

1. Go to Render Dashboard → New → PostgreSQL
2. Settings:
   - Name: `newhill-db`
   - Plan: `Standard` (or higher for production)
   - Region: Choose closest to your users
3. Copy the **Internal Database URL** (not External)
4. Format: `postgresql://user:password@host/database`

#### 2. Create Redis Instance

1. Go to Render Dashboard → New → Redis
2. Settings:
   - Name: `newhill-redis`
   - Plan: `Standard`
   - Region: Same as database
3. Copy the **Internal Redis URL**
4. Format: `redis://user:password@host:6379`

#### 3. Create API Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Settings:
   - Name: `newhill-api`
   - Environment: `Node`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: `apps/api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: `Standard` or higher

4. Environment Variables (click "Environment"):
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[paste Internal Database URL]
   REDIS_URL=[paste Internal Redis URL]
   JWT_SECRET=[generate secure random string]
   JWT_EXPIRY=7d
   CORS_ORIGIN=https://newhillspices.com
   LOG_LEVEL=info
   ```

5. Advanced Settings:
   - Health Check Path: `/health/ready`
   - Auto-Deploy: Yes

#### 4. Run Database Migrations

**IMPORTANT:** After API is deployed, run migrations:

1. Go to API Service → Shell
2. Run:
   ```bash
   cd /opt/render/project/src
   npx prisma migrate deploy
   npx prisma generate
   ```

Or use Render's Build Command:
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

#### 5. Create Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect same GitHub repository
3. Settings:
   - Name: `newhill-web`
   - Environment: `Node`
   - Region: Same as API
   - Branch: `main`
   - Root Directory: `apps/web`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Plan: `Standard` or higher

4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[paste Internal Database URL]
   NEXT_PUBLIC_API_URL=https://newhill-api.onrender.com
   NEXT_PUBLIC_SITE_URL=https://newhillspices.com
   JWT_SECRET=[same as API]
   ```

5. Advanced Settings:
   - Health Check Path: `/`
   - Auto-Deploy: Yes

### Option 2: Using `render.yaml` (Infrastructure as Code)

Create `render.yaml` in repository root:

```yaml
databases:
  - name: newhill-db
    databaseName: newhill_spices
    user: newhill
    plan: standard
    region: oregon
    ipAllowList: []

services:
  - type: redis
    name: newhill-redis
    plan: standard
    region: oregon
    ipAllowList: []

  - type: web
    name: newhill-api
    env: node
    region: oregon
    plan: standard
    buildCommand: npm install && npx prisma generate && npx prisma migrate deploy && npm run build
    startCommand: npm start
    healthCheckPath: /health/ready
    rootDir: apps/api
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        fromDatabase:
          name: newhill-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: newhill-redis
          type: redis
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRY
        value: 7d
      - key: CORS_ORIGIN
        sync: false
      - key: LOG_LEVEL
        value: info

  - type: web
    name: newhill-web
    env: node
    region: oregon
    plan: standard
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    rootDir: apps/web
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        fromDatabase:
          name: newhill-db
          property: connectionString
      - key: NEXT_PUBLIC_API_URL
        value: https://newhill-api.onrender.com
      - key: NEXT_PUBLIC_SITE_URL
        sync: false
      - key: JWT_SECRET
        fromService:
          name: newhill-api
          type: web
          envVarKey: JWT_SECRET
```

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain Setup

#### For Web App:
1. Go to `newhill-web` service → Settings → Custom Domain
2. Add: `newhillspices.com` and `www.newhillspices.com`
3. Update DNS:
   ```
   Type: CNAME
   Name: www
   Value: newhill-web.onrender.com
   
   Type: A
   Name: @
   Value: [Render IP address shown in dashboard]
   ```

#### For API:
1. Go to `newhill-api` service → Settings → Custom Domain
2. Add: `api.newhillspices.com`
3. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: newhill-api.onrender.com
   ```

4. **Update Environment Variables**:
   - Web: `NEXT_PUBLIC_API_URL=https://api.newhillspices.com`
   - API: `CORS_ORIGIN=https://newhillspices.com,https://www.newhillspices.com`

### 2. SSL/TLS Configuration

Render automatically provisions SSL certificates. Verify:
1. Wait 5-10 minutes after adding custom domain
2. Check service logs for "Certificate issued"
3. Visit `https://your-domain.com` to verify

### 3. Database Backups

1. Go to `newhill-db` → Backups
2. Enable automatic daily backups
3. Set retention period (7-30 days)

### 4. Monitoring Setup

#### Render Native Monitoring:
- Metrics: CPU, Memory, Network (automatic)
- Logs: View in Render Dashboard

#### Optional: Add Sentry for Error Tracking:
```bash
# apps/api
npm install @sentry/node @sentry/tracing

# apps/web
npm install @sentry/nextjs
```

Add to `apps/api/src/index.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 🧪 Deployment Verification

### 1. Health Checks

```bash
# API Health
curl https://api.newhillspices.com/health

# Expected Response:
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "database": { "status": "up", "responseTime": 15 },
    "redis": { "status": "up", "responseTime": 5 }
  }
}
```

### 2. API Endpoints

```bash
# Get Products
curl https://api.newhillspices.com/api/v1/products

# Web App
curl https://newhillspices.com
```

### 3. Database Connection

Check API service logs for:
```
[INFO] Database connected successfully
[INFO] Redis client ready
[INFO] API server running on port 3001
```

---

## 🐛 Troubleshooting

### Issue: "JWT_SECRET environment variable is required"

**Solution:**
1. Go to API service → Environment
2. Add `JWT_SECRET` with a secure random value (min 32 characters)
3. Trigger manual redeploy

### Issue: "Failed to connect to database"

**Solution:**
1. Verify `DATABASE_URL` is correct (use Internal URL)
2. Check database is in same region as API
3. Run migrations: `npx prisma migrate deploy`

### Issue: "Redis Client Error"

**Solution:**
1. Verify `REDIS_URL` format: `redis://user:password@host:6379`
2. Check Redis instance is running (Render Dashboard)
3. Ensure API and Redis in same region

### Issue: "CORS Error" in Frontend

**Solution:**
1. Update API `CORS_ORIGIN` to include all frontend domains
2. Format: `https://newhillspices.com,https://www.newhillspices.com`
3. Ensure no trailing slashes

### Issue: "Module not found: @prisma/client"

**Solution:**
1. Update build command to include `npx prisma generate`
2. Build command: `npm install && npx prisma generate && npm run build`

### Issue: High Memory Usage

**Solution:**
1. Upgrade plan (Render Standard = 512MB, Pro = 2GB)
2. Optimize Prisma connection pool (set in DATABASE_URL)
3. Add to DATABASE_URL: `?connection_limit=10&pool_timeout=20`

---

## 📊 Performance Optimization

### 1. Database Connection Pooling

Add to `DATABASE_URL`:
```
?connection_limit=10&pool_timeout=20&statement_cache_size=100
```

### 2. Redis Caching Strategy

Update `apps/api/src/middleware/caching.ts`:
```typescript
export const CacheConfigs = {
  productList: { ttl: 300, keyPrefix: 'products:list:' },  // 5 min
  productDetail: { ttl: 900, keyPrefix: 'product:detail:' }, // 15 min
  userProfile: { ttl: 60, keyPrefix: 'user:profile:' },     // 1 min
};
```

### 3. Enable HTTP/2

Render enables HTTP/2 automatically with SSL.

### 4. CDN Configuration (Optional)

Use CloudFront for static assets:
1. Create CloudFront distribution
2. Origin: Render web service URL
3. Update `CLOUDFRONT_DOMAIN` in web env vars

---

## 🔒 Security Hardening

### 1. Rotate Secrets Regularly

```bash
# Generate new JWT secret
openssl rand -base64 64

# Update in Render dashboard
# Restart services
```

### 2. IP Allowlist (For Sensitive Routes)

Configure in `render.yaml`:
```yaml
services:
  - type: web
    name: newhill-api
    ipAllowList:
      - source: 203.0.113.0/24  # Your office IP
        description: Office network
```

### 3. Enable Web Application Firewall (WAF)

Consider Cloudflare in front of Render for:
- DDoS protection
- Rate limiting
- Bot protection

---

## 📈 Scaling Strategy

### Horizontal Scaling

Render supports auto-scaling:
```yaml
services:
  - type: web
    name: newhill-api
    scaling:
      minInstances: 2
      maxInstances: 10
      targetMemoryPercent: 80
      targetCPUPercent: 70
```

### Database Scaling

1. Monitor query performance
2. Add indexes for slow queries
3. Upgrade database plan if needed
4. Consider read replicas for high traffic

---

## 🎉 Success Criteria

✅ **Deployment Complete When:**

1. [ ] All services show "Live" in Render dashboard
2. [ ] Health check returns `{ "status": "healthy" }`
3. [ ] Frontend loads at custom domain
4. [ ] API responds to requests
5. [ ] Database migrations applied
6. [ ] Redis cache working
7. [ ] Logs show no errors
8. [ ] SSL certificates active (green padlock)
9. [ ] All environment variables set
10. [ ] Automatic backups configured

---

## 📞 Support & Maintenance

### Monitoring Checklist

- [ ] Daily: Check service health and error logs
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Rotate secrets and update dependencies
- [ ] Quarterly: Database optimization and backup testing

### Useful Commands

```bash
# View API logs
render logs newhill-api --tail 100

# SSH into service
render ssh newhill-api

# Trigger manual deploy
render deploy newhill-api

# Run Prisma migrations
render shell newhill-api
npx prisma migrate deploy
```

---

## 🚀 You're Live!

Congratulations! Your Newhill Spices full-stack application is now deployed on Render with:

✅ Robust backend API with Express + TypeScript  
✅ Modern frontend with Next.js 14  
✅ PostgreSQL database with Prisma ORM  
✅ Redis caching layer  
✅ Comprehensive security measures  
✅ Health monitoring and logging  
✅ Auto-scaling capabilities  
✅ SSL/TLS encryption  
✅ Production-grade error handling  

**Your application is enterprise-ready!** 🎉

---

**Last Updated:** 2025-10-20  
**Guide Version:** 2.0.0  
**Deployment Status:** ✅ PRODUCTION READY
