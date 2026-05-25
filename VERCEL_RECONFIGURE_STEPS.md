# Vercel Reconfiguration Steps - Fix 404 Error

## The Problem
The 404 error is happening because Vercel isn't properly serving the React SPA. This is likely due to incorrect project settings in the Vercel dashboard.

## Solution: Reconfigure Vercel Project Settings

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Find your "bharat-secure-phi" project
3. Click on it

### Step 2: Go to Project Settings
1. Click "Settings" tab at the top
2. Click "General" in the left sidebar

### Step 3: Update Root Directory
**IMPORTANT:** This is likely the issue!

- Scroll to "Root Directory"
- Click "Edit"
- **Leave it BLANK** or set to: `frontend`
- Click "Save"

### Step 4: Update Build & Development Settings
Click "Build & Development Settings" in the left sidebar

**Framework Preset:** Vite (or Other)

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

**Root Directory:**
```
frontend
```

### Step 5: Verify Environment Variables
Click "Environment Variables" in the left sidebar

Make sure these are set:
```
VITE_API_URL = https://bharatsecure-backend.onrender.com
VITE_SUPABASE_URL = https://fzsvxkuzyivihtqpoqid.supabase.co
VITE_SUPABASE_ANON_KEY = <your_key>
```

### Step 6: Redeploy
1. Go to "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Check "Use existing Build Cache" (optional)
5. Click "Redeploy"

### Step 7: Alternative - Delete and Reimport
If the above doesn't work:

1. Go to Settings → General
2. Scroll to bottom
3. Click "Delete Project"
4. Confirm deletion
5. Go back to Vercel dashboard
6. Click "Add New..." → "Project"
7. Import your repository again
8. **Set Root Directory to: `frontend`**
9. Set environment variables
10. Deploy

## Expected Result
After redeployment, visiting `https://bharat-secure-phi.vercel.app/login` should:
- Load the React app (not 404)
- Show the login page
- Handle OAuth redirects properly

## Why This Fixes It
The issue is that Vercel needs to know:
1. Where to find the frontend code (`frontend` directory)
2. Where the built files are (`frontend/dist`)
3. That all routes should serve `index.html` (SPA routing)

The `vercel.json` at the root level can cause confusion if the Root Directory isn't set correctly in the dashboard.

## Test After Deployment
1. Visit: `https://bharat-secure-phi.vercel.app/login`
2. Should see login page (not 404)
3. Click "Continue with Google"
4. Should redirect properly and log you in

## If Still Not Working
Check the deployment logs:
1. Go to Deployments tab
2. Click on the latest deployment
3. Click "Building" to see build logs
4. Look for errors

Common issues:
- Build fails → Check build command
- 404 on all routes → Root directory is wrong
- OAuth fails → Check Supabase redirect URLs
