# 🚀 BharatSecure - Render + Vercel Deployment Guide

## 📋 Quick Overview

**Backend:** Render (Django API)  
**Frontend:** Vercel (React/Vite)  
**Database:** Supabase (Already configured)  
**Time:** 30 minutes  
**Cost:** FREE

---

## 🔑 Important: Your Credentials

Your actual API keys and credentials are in:
**`CREDENTIALS_LOCAL_ONLY.txt`** (Local only - NOT committed to GitHub)

Use those values when deploying to Render and Vercel.

---

## Part 1: Deploy Backend to Render (15 minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select "BharatSecure" repository
4. Click "Connect"

### Step 3: Configure Service

**Basic Settings:**
- Name: `bharatsecure-backend`
- Region: Choose closest to you
- Branch: `update` (or `main`)
- Root Directory: `backend`
- Runtime: `Python 3`

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

**Start Command:**
```bash
gunicorn backend.wsgi:application
```

**Instance Type:** Free

### Step 4: Add Environment Variables

Click "Advanced" → "Add Environment Variable"

**Get these values from `CREDENTIALS_LOCAL_ONLY.txt`:**

```
DATABASE_URL = <your_database_url>
DB_SSLMODE = require
DJANGO_DEBUG = False
DJANGO_SECRET_KEY = <your_generated_secret_key>
DJANGO_ALLOWED_HOSTS = .onrender.com,.vercel.app
SUPABASE_URL = <your_supabase_url>
SUPABASE_ANON_KEY = <your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY = <your_supabase_service_role_key>
SUPABASE_JWKS_URL = <your_supabase_jwks_url>
GROQ_API_KEY = <your_groq_api_key>
GEOAPIFY_API_KEY = <your_geoapify_api_key>
PYTHON_VERSION = 3.11.0
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for build
3. Copy your backend URL: `https://bharatsecure-backend.onrender.com`

### Step 6: Test Backend
Visit: `https://bharatsecure-backend.onrender.com/admin/`
You should see Django admin login page ✅

---

## Part 2: Deploy Frontend to Vercel (10 minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize Vercel

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Find "BharatSecure" repository
3. Click "Import"

### Step 3: Configure Project

**Root Directory:** `frontend`  
**Framework:** Vite (auto-detected)  
**Build Command:** `npm run build`  
**Output Directory:** `dist`

### Step 4: Add Environment Variables

**IMPORTANT:** Use your Render URL: `bharatsecure-backend.onrender.com`

```
VITE_API_URL = https://bharatsecure-backend.onrender.com
VITE_SUPABASE_URL = <from CREDENTIALS_LOCAL_ONLY.txt>
VITE_SUPABASE_ANON_KEY = <from CREDENTIALS_LOCAL_ONLY.txt>
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy your frontend URL: `https://bharat-secure-phi.vercel.app`

---

## Part 3: Update CORS (5 minutes)

### Step 1: Update Backend Code

1. Open `backend/backend/settings.py`
2. Find `CORS_ALLOWED_ORIGINS` (around line 65)
3. Update with your Vercel URL:

```python
CORS_ALLOWED_ORIGINS = [
    "https://bharat-secure-phi.vercel.app",  # BharatSecure Vercel URL
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### Step 2: Commit and Push

```bash
git add backend/backend/settings.py
git commit -m "Update CORS for production"
git push origin update
```

### Step 3: Wait for Auto-Deploy
Render will automatically redeploy (2-3 minutes)

---

## ✅ Testing Your Deployment

### Test Checklist:
- [ ] Visit frontend URL - page loads
- [ ] No console errors (F12)
- [ ] Can sign up / login
- [ ] Can report incident
- [ ] Map loads correctly
- [ ] Backend admin accessible

---

## 🆘 Troubleshooting

### Backend won't start
- Check Render logs
- Verify all environment variables
- Check Python version

### Frontend can't connect
- Check `VITE_API_URL` in Vercel
- Verify CORS settings
- Check browser console

### CORS errors
- Add Vercel URL to `CORS_ALLOWED_ORIGINS`
- Commit and push
- Wait for redeploy

---

## 🎉 Success!

Your app is now live:
- **Frontend:** `https://bharat-secure-phi.vercel.app`
- **Backend:** `https://bharatsecure-backend.onrender.com`
- **Admin:** `https://bharatsecure-backend.onrender.com/admin/`

---

## 📞 Important Files

- **Credentials:** `CREDENTIALS_LOCAL_ONLY.txt` (local only)
- **Backend Env Template:** `RENDER_ENV_VARIABLES.txt`
- **Frontend Env Template:** `VERCEL_ENV_VARIABLES.txt`

---

## ⚠️ Security Note

Consider rotating your API keys since they were in commit history:
1. Generate new Supabase keys
2. Generate new GROQ API key
3. Generate new Geoapify API key
4. Update in Render and Vercel

---

**Good luck with your deployment! 🚀**
