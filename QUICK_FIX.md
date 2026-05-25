# Quick Fix for 404 Error - Do This Now!

## The Real Problem
Your Vercel project is NOT configured with the correct Root Directory. This is why you're getting 404 errors.

## Fix in 3 Steps

### Step 1: Update Vercel Project Settings
1. Go to: https://vercel.com/dashboard
2. Click on your "bharat-secure-phi" project
3. Click "Settings" → "General"
4. Find "Root Directory"
5. Click "Edit"
6. **Set it to: `frontend`**
7. Click "Save"

### Step 2: Update Build Settings
Still in Settings:
1. Click "Build & Development Settings"
2. Set these values:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Redeploy
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

## What Changed in Code
I simplified `vercel.json` to only handle routing:
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

This tells Vercel: "For any route, serve index.html" (SPA routing)

## Commit and Push
```bash
git add vercel.json
git commit -m "Simplify vercel.json for SPA routing"
git push
```

Vercel will auto-redeploy after push.

## Test
After deployment:
1. Visit: https://bharat-secure-phi.vercel.app/login
2. Should see login page ✅
3. Click "Continue with Google"
4. Should work without 404 ✅

## Why This Works
- **Root Directory = `frontend`**: Tells Vercel where your app code is
- **Output Directory = `dist`**: Tells Vercel where built files are
- **Rewrites**: Tells Vercel to serve index.html for all routes (SPA)

The previous config was trying to build from the root directory, which doesn't have a package.json, causing issues.
