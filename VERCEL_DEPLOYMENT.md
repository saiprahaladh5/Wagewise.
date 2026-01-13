# Vercel Deployment Guide

This project is ready for deployment on Vercel. Follow these steps to deploy:

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Ensure your Supabase project is set up and running
3. **Together AI API Key**: Get your API key from [together.ai](https://together.ai)

## Environment Variables

You need to set the following environment variables in Vercel:

### Required Variables

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Your Supabase project URL
   - Found in Supabase Dashboard → Settings → API → Project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Your Supabase anonymous/public key
   - Found in Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
   - This is safe to expose in the browser

3. **`TOGETHER_API_KEY`**
   - Your Together AI API key
   - Get it from [together.ai](https://together.ai) dashboard
   - Keep this secret (server-side only)

### Optional Variables

4. **`TOGETHER_API_URL`** (Optional)
   - Defaults to: `https://api.together.xyz/v1/chat/completions`
   - Only set if you need a custom endpoint

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to the project directory:
   ```bash
   cd moneybuddy
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Set environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add TOGETHER_API_KEY
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub/GitLab/Bitbucket**
   - Make sure your code is in a Git repository
   - Push to GitHub (or your preferred Git provider)

2. **Import Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Select the `moneybuddy` folder as the root directory

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `moneybuddy`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test user registration and login
- [ ] Test transaction creation
- [ ] Test AI chat feature
- [ ] Verify Supabase database connection
- [ ] Check that cookies are working (for authentication)
- [ ] Test on mobile devices (if applicable)

## Troubleshooting

### "Auth session missing!" Error

If you see this error after deployment:
1. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
2. Clear browser cookies and try logging in again
3. Check that Supabase project is active and accessible

### Build Failures

If the build fails:
1. Check that all dependencies are in `package.json`
2. Verify Node.js version (Vercel uses Node 18.x by default)
3. Check build logs in Vercel dashboard for specific errors

### API Route Errors

If API routes fail:
1. Verify `TOGETHER_API_KEY` is set correctly
2. Check that the API route is properly handling authentication
3. Review server logs in Vercel dashboard

## Database Setup

Make sure your Supabase database has the required tables:

1. **`transactions` table** with columns:
   - `id` (primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `type` (text: 'income' or 'expense')
   - `amount` (numeric)
   - `category` (text)
   - `date` (date)
   - `note` (text, nullable)
   - `currency_code` (text, default 'USD')
   - `created_at` (timestamp)

2. **Row Level Security (RLS)** policies:
   - Users can only read/write their own transactions
   - See `supabase_setup.sql` for reference

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

## Monitoring

- **Vercel Analytics**: Enable in Project Settings → Analytics
- **Logs**: View real-time logs in Vercel Dashboard → Deployments → [Your Deployment] → Functions
- **Performance**: Check Vercel Speed Insights for performance metrics

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
