# Quick Action Checklist - Deploy in 1 Hour!
**Newhill Spices Platform - Ready to Deploy**

---

## 🚀 Get Production-Ready in 4 Steps

### ✅ Step 1: Install Dependencies (5 minutes)

```bash
# Install all dependencies
npm install

# API dependencies
cd apps/api
npm install

# Install new packages added during audit
npm install cookie-parser @types/cookie-parser @prisma/client
npm install -D prisma

# Web dependencies  
cd ../web
npm install

cd ../..
```

### ✅ Step 2: Database Setup (10 minutes)

```bash
# Navigate to web app
cd apps/web

# Generate Prisma Client
npx prisma generate

# Create database migrations
npx prisma migrate dev --name initial_schema

# (Optional) Seed database with test data
npx prisma db seed

cd ../..
```

### ✅ Step 3: Environment Variables (15 minutes)

**Create `apps/api/.env`:**
```bash
NODE_ENV=development
PORT=3001

# Generate secure secret (run this command):
# openssl rand -base64 64
JWT_SECRET=PASTE_GENERATED_SECRET_HERE
JWT_EXPIRY=7d

# Database (local for now)
DATABASE_URL="postgresql://newhill:newhill_password@localhost:5432/newhill_spices?schema=public"

# Redis (local for now)
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Logging
LOG_LEVEL=info
```

**Create `apps/web/.env.local`:**
```bash
# Public variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database (same as API)
DATABASE_URL="postgresql://newhill:newhill_password@localhost:5432/newhill_spices?schema=public"

# Auth (same as API)
JWT_SECRET=SAME_SECRET_AS_API
```

### ✅ Step 4: Test Locally (10 minutes)

```bash
# Start database and Redis (if using Docker)
docker-compose up -d postgres redis

# OR use local PostgreSQL and Redis

# Start API (terminal 1)
cd apps/api
npm run dev

# Start Web (terminal 2)
cd apps/web
npm run dev
```

**Verify:**
- API: http://localhost:3001/health (should return `{"status":"healthy"}`)
- Web: http://localhost:3000 (should load homepage)

---

## 🌐 Deploy to Render (20 minutes)

### Quick Deploy Option 1: Using Render Dashboard

1. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Name: `newhill-db`
   - Plan: Standard
   - **Copy Internal Database URL**

2. **Create Redis Instance**
   - Dashboard → New → Redis  
   - Name: `newhill-redis`
   - Plan: Standard
   - **Copy Internal Redis URL**

3. **Deploy API Service**
   - Dashboard → New → Web Service
   - Connect GitHub repo
   - Root Directory: `apps/api`
   - Build: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start: `npm start`
   - **Add Environment Variables:**
     ```
     NODE_ENV=production
     PORT=3001
     DATABASE_URL=[paste Internal Database URL]
     REDIS_URL=[paste Internal Redis URL]
     JWT_SECRET=[generate new secure secret]
     CORS_ORIGIN=[your frontend URL]
     ```

4. **Deploy Web Service**
   - Dashboard → New → Web Service
   - Same repo
   - Root Directory: `apps/web`
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npm start`
   - **Add Environment Variables:**
     ```
     NODE_ENV=production
     NEXT_PUBLIC_API_URL=https://[your-api-url].onrender.com
     DATABASE_URL=[paste Internal Database URL]
     JWT_SECRET=[same as API]
     ```

### Quick Deploy Option 2: Using render.yaml

1. Copy `render.yaml` from `RENDER_DEPLOYMENT_GUIDE.md` to repo root
2. Update CORS_ORIGIN and NEXT_PUBLIC_SITE_URL
3. Push to GitHub
4. Render auto-deploys!

---

## ✅ Verification Checklist

After deployment, verify these:

### API Health
```bash
curl https://your-api.onrender.com/health
```
**Expected:**
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### Frontend
- [ ] Website loads: https://your-site.onrender.com
- [ ] No console errors
- [ ] Images load
- [ ] Navigation works
- [ ] SSL certificate active (🔒 green padlock)

### Backend
- [ ] API responds: https://your-api.onrender.com/api/v1/products
- [ ] Health check returns 200
- [ ] Database connected
- [ ] Redis connected

---

## 🐛 Quick Troubleshooting

### Issue: "JWT_SECRET is required"
**Fix:** Add JWT_SECRET in Render environment variables

### Issue: "Database connection failed"
**Fix:** Use **Internal Database URL** (not External)

### Issue: "Module not found: @prisma/client"
**Fix:** Update build command: `npm install && npx prisma generate && npm run build`

### Issue: "CORS error"
**Fix:** Add frontend URL to API's `CORS_ORIGIN` environment variable

---

## 📚 Documentation Reference

**For detailed guides, see:**

1. **`FULL_STACK_AUDIT_REPORT.md`**
   - Complete audit findings
   - Security analysis
   - Performance metrics

2. **`RENDER_DEPLOYMENT_GUIDE.md`**
   - Step-by-step deployment
   - Troubleshooting
   - Performance optimization

3. **`COMPLETE_FULL_STACK_SUMMARY.md`**
   - All changes made
   - Files modified
   - Architecture improvements

4. **`apps/web/FRONTEND_CHANGES.md`**
   - Frontend enhancements
   - Component updates
   - UI/UX improvements

5. **`apps/web/QUICK_START.md`**
   - Developer guide
   - Common tasks
   - Code examples

---

## 🎉 You're Done!

**Total Time:** ~1 hour  
**Status:** ✅ Production-ready  
**Next:** Monitor logs and enjoy your flawless deployment!

---

**Questions?** Check the comprehensive guides above. Everything is documented! 📖

**Happy Deploying! 🚀**
