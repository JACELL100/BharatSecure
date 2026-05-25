# OAuth 404 Error Fix Guide

## Problem
After clicking "Sign in with Google", you're redirected to `/login` with authentication tokens in the URL hash, but you get a 404 NOT_FOUND error.

## Root Cause
The Vercel deployment wasn't properly configured to handle SPA (Single Page Application) routing, causing the OAuth callback URL to return a 404 instead of serving the React app.

## Changes Made

### 1. Updated `vercel.json`
Changed from `rewrites` to `routes` configuration to properly handle SPA routing:
```json
{
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

### 2. Added `_redirects` file
Created `frontend/public/_redirects` to ensure all routes serve `index.html`:
```
/* /index.html 200
```

## Required Steps in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Update Redirect URLs**
   - Go to: Authentication → URL Configuration
   - Add these URLs to **Redirect URLs**:
     - `https://bharat-secure-phi.vercel.app/login`
     - `https://bharat-secure-phi.vercel.app/*` (wildcard for all routes)
     - `http://localhost:5173/login` (for local development)

3. **Verify Site URL**
   - Ensure **Site URL** is set to: `https://bharat-secure-phi.vercel.app`

## Deployment Steps

1. **Commit and push changes**:
   ```bash
   git add vercel.json frontend/public/_redirects
   git commit -m "Fix OAuth callback routing for Vercel deployment"
   git push
   ```

2. **Redeploy on Vercel**:
   - Vercel should automatically redeploy when you push
   - Or manually trigger a redeploy from the Vercel dashboard

3. **Test the OAuth flow**:
   - Go to: https://bharat-secure-phi.vercel.app/login
   - Click "Continue with Google"
   - You should now be redirected properly without a 404 error

## How It Works Now

1. User clicks "Continue with Google"
2. Supabase redirects to Google OAuth
3. Google authenticates and redirects back to: `https://bharat-secure-phi.vercel.app/login#access_token=...`
4. Vercel serves the React app (not a 404)
5. Supabase client detects the session from URL hash
6. `AuthContext` picks up the session via `onAuthStateChange`
7. User is logged in and redirected to appropriate page

## Troubleshooting

### Still getting 404?
- Clear browser cache and try again
- Check Vercel deployment logs for errors
- Verify the build completed successfully

### OAuth not working?
- Check browser console for errors
- Verify Supabase environment variables are set in Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Ensure redirect URLs are correctly configured in Supabase dashboard

### Session not persisting?
- Check that `detectSessionInUrl: true` is set in `supabaseClient.js` (already configured)
- Verify localStorage is not being blocked by browser settings
- Check that cookies are enabled

## Additional Notes

- The `_redirects` file will be copied to the `dist` folder during build
- Vercel's `routes` configuration takes precedence over `_redirects`
- Both are included for maximum compatibility
