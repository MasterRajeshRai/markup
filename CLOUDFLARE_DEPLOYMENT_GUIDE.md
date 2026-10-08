# Complete Cloudflare Deployment Guide — Markup Headless CMS
### Frontend (`apps/web-demo`) & Full-Stack Backend CMS (`apps/admin`)

This guide walks you through deploying the entire Markup Headless CMS platform on **Cloudflare**, including:
1. **Public Website Frontend** on Cloudflare Pages (`yourdomain.com`)
2. **Headless CMS & Admin Backend** on Cloudflare Pages (`admin.yourdomain.com`)
3. **Cloudflare R2 Object Storage** for high-resolution media & assets (`media.yourdomain.com`)
4. **Serverless PostgreSQL Database** (via Neon, Supabase, or Cloudflare Hyperdrive)

---

## 🏛️ High-Level Cloudflare Architecture

```
                                  ┌──────────────────────────────┐
                                  │      Cloudflare DNS & Edge    │
                                  └──────────────┬───────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   │                                                           │
                   ▼                                                           ▼
    ┌─────────────────────────────┐                             ┌─────────────────────────────┐
    │   Cloudflare Pages (Web)    │                             │   Cloudflare Pages (Admin)  │
    │   apps/web-demo             │                             │   apps/admin                │
    │   yourdomain.com            │                             │   admin.yourdomain.com      │
    └──────────────┬──────────────┘                             └──────────────┬──────────────┘
                   │                                                           │
                   │ (Fetch content / media via APIs)                          │
                   └───────────────────────────►◄──────────────────────────────┘
                                                 │
                                                 │  (Store & serve media assets)
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │     Cloudflare R2 Bucket     │
                                  │   (markup-media-production)  │
                                  │  0 egress fees • Global CDN  │
                                  └──────────────────────────────┘
                                                 │
                                                 │  (Prisma ORM database)
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │   Serverless PostgreSQL      │
                                  │   (Neon / Supabase / Aiven)  │
                                  └──────────────────────────────┘
```

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. A **Cloudflare Account** (Free tier is completely sufficient).
2. Your repository pushed to **GitHub** (private or public).
3. A free cloud **PostgreSQL database** (recommended: [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com)).

---

## Step 1: Set Up Cloudflare R2 Storage for Media

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com).
2. On the left sidebar, navigate to **R2** > **Create bucket**.
3. Set Bucket name: `markup-media-production`.
4. Click **Create bucket**.
5. Under bucket **Settings** > **Public Access**:
   - Connect a custom domain (e.g. `media.yourdomain.com`) OR enable the R2 dev subdomain.
6. Create an R2 API Token:
   - Go to **R2** > **Manage R2 API Tokens** > **Create API token**.
   - Permissions: **Object Read & Write**.
   - Copy the following keys:
     - `R2_ACCOUNT_ID`
     - `R2_ACCESS_KEY_ID`
     - `R2_SECRET_ACCESS_KEY`

---

## Step 2: Deploy Backend & Admin CMS (`apps/admin`)

1. In the Cloudflare Dashboard, go to **Compute (Workers) & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your GitHub repository.
3. Configure the Build Settings:
   - **Project Name:** `markup-admin-cms`
   - **Production Branch:** `main` (or your active branch)
   - **Framework Preset:** `Next.js`
   - **Root directory:** `apps/admin`
   - **Build command:**
     ```bash
     pnpm --filter @headless/database generate && pnpm run build
     ```
   - **Build output directory:** `.next`
4. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon/Supabase PostgreSQL connection string (`postgresql://...`) |
   | `JWT_SECRET` | A secure random 32+ character string |
   | `STORAGE_DRIVER` | `cloudflare_r2` |
   | `R2_ACCOUNT_ID` | Your Cloudflare Account ID |
   | `R2_ACCESS_KEY_ID` | Your R2 Access Key |
   | `R2_SECRET_ACCESS_KEY` | Your R2 Secret Key |
   | `R2_BUCKET_NAME` | `markup-media-production` |
   | `R2_PUBLIC_URL` | `https://media.yourdomain.com` |
   | `NEXT_PUBLIC_APP_URL` | `https://admin.yourdomain.com` |
   | `NEXT_PUBLIC_API_URL` | `https://admin.yourdomain.com/api/v1` |
5. Click **Save and Deploy**.
6. Under **Custom Domains**, attach: `admin.yourdomain.com`.

---

## Step 3: Deploy Frontend Website (`apps/web-demo`)

1. In Cloudflare Dashboard, go to **Compute (Workers) & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select the same GitHub repository.
3. Configure the Build Settings:
   - **Project Name:** `markup-web-frontend`
   - **Production Branch:** `main`
   - **Framework Preset:** `Next.js`
   - **Root directory:** `apps/web-demo`
   - **Build command:**
     ```bash
     pnpm run build
     ```
   - **Build output directory:** `.next`
4. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_CMS_API_URL` | `https://admin.yourdomain.com/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
   | `NEXT_PUBLIC_R2_MEDIA_URL`| `https://media.yourdomain.com` |
5. Click **Save and Deploy**.
6. Under **Custom Domains**, attach: `yourdomain.com` (and `www.yourdomain.com`).

---

## Step 4: Verify Live Sync & Cloudflare R2 Sync Engine

Once both applications are live:
1. Log into your Admin Dashboard at `https://admin.yourdomain.com/admin/gallery`.
2. Notice the **Cloudflare R2 Storage Cockpit**:
   - Target bucket: `markup-media-production`
   - Click **"Sync to Cloudflare R2"**.
3. All local photographs and uploads are synced directly to your Cloudflare R2 bucket.
4. The frontend will serve assets through Cloudflare's edge network with global zero-egress caching.

---

## ⚡ Summary of URLs

| Service | Target Domain | Hosting Layer |
|---|---|---|
| **Frontend Website** | `yourdomain.com` | Cloudflare Pages |
| **Admin & CMS APIs** | `admin.yourdomain.com` | Cloudflare Pages |
| **Media & Gallery CDN** | `media.yourdomain.com` | Cloudflare R2 |
| **Database** | Managed Postgres | Neon / Supabase |
