# 🚀 Complete Vercel + Cloudflare R2 Deployment Guide
### Markup CMS — 100% Free Production Setup

You can host **everything** (Frontend, Backend CMS, APIs, and PostgreSQL Database) directly on **Vercel for $0**, keeping **Cloudflare R2** solely for the 10 GB free media/photo storage.

---

## 🏛️ High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERCEL (100% Free Tier)                         │
│                                                                        │
│   ┌──────────────────────────────┐    ┌─────────────────────────────┐  │
│   │   Vercel Project 1: Web      │    │   Vercel Project 2: Admin   │  │
│   │   apps/web-demo              │◄───┤   apps/admin                │  │
│   │   yourdomain.com             │    │   admin.yourdomain.com      │  │
│   └──────────────────────────────┘    └──────────────┬──────────────┘  │
│                                                      │                 │
│                                       (Prisma ORM)   │                 │
│                                                      ▼                 │
│                                       ┌─────────────────────────────┐  │
│                                       │   Vercel Postgres (Free)    │  │
│                                       │   (1-Click in Vercel Dash)  │  │
│                                       └─────────────────────────────┘  │
└──────────────────────────────────────────────────────┬─────────────────┘
                                                       │
                                   (Photos & Media)    │
                                                       ▼
                                        ┌─────────────────────────────┐
                                        │    CLOUDFLARE R2 STORAGE    │
                                        │  (markup-media-production)  │
                                        │    10 GB Free • $0 Egress   │
                                        │    media.yourdomain.com     │
                                        └─────────────────────────────┘
```

---

## 📋 What You Need
1. A **Vercel Account** (Free Hobby plan at [vercel.com](https://vercel.com) using your GitHub account).
2. Your repository pushed to **GitHub**.
3. A **Cloudflare Account** for the free R2 photo storage bucket.

---

## Step 1: Deploy Backend & Admin CMS (`apps/admin`) on Vercel

1. Log into [vercel.com](https://vercel.com) and click **"Add New..."** > **"Project"**.
2. Select your GitHub repository.
3. In the setup screen:
   - **Project Name:** `markup-admin-cms`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click "Edit" and choose `apps/admin`.
4. Click **Deploy**. Vercel will install dependencies and build the CMS.

---

## Step 2: Add 1-Click Free PostgreSQL Database on Vercel

1. In your Vercel Dashboard, go to your new `markup-admin-cms` project.
2. Click the **"Storage"** tab at the top.
3. Click **"Create Database"** > Select **"Postgres"**.
4. Choose a region close to you (e.g. `Washington D.C.` or `Singapore / Mumbai`).
5. Click **"Create"**.
6. Click **"Connect Project"** and select `markup-admin-cms`.
   > **Note:** Vercel automatically creates and injects `DATABASE_URL` and `POSTGRES_PRISMA_URL` into your project settings with zero manual typing!
7. Run migrations:
   - In your local project terminal (with the Vercel `DATABASE_URL` in your `.env`), run:
     ```bash
     pnpm --filter @headless/database push
     ```

---

## Step 3: Connect Cloudflare R2 for Photos & Media

1. In your [Cloudflare Dashboard](https://dash.cloudflare.com), go to **R2** > **Create bucket**.
2. Name: `markup-media-production`.
3. Go to **Manage R2 API Tokens** > **Create API token** (Permissions: *Object Read & Write*).
4. Copy the keys and add them to your Vercel Admin project under **Settings** > **Environment Variables**:
   | Variable Name | Value |
   |---|---|
   | `STORAGE_DRIVER` | `cloudflare_r2` |
   | `R2_ACCOUNT_ID` | Your Cloudflare Account ID |
   | `R2_ACCESS_KEY_ID` | Your R2 Access Key ID |
   | `R2_SECRET_ACCESS_KEY` | Your R2 Secret Key |
   | `R2_BUCKET_NAME` | `markup-media-production` |
   | `R2_PUBLIC_URL` | `https://media.yourdomain.com` (or your R2 public dev URL) |
   | `JWT_SECRET` | A secure random 32+ character string |
   | `NEXT_PUBLIC_APP_URL` | `https://admin.yourdomain.com` |
   | `NEXT_PUBLIC_API_URL` | `https://admin.yourdomain.com/api/v1` |

---

## Step 4: Deploy the Public Website Frontend (`apps/web-demo`) on Vercel

1. In [vercel.com](https://vercel.com), click **"Add New..."** > **"Project"**.
2. Select the same GitHub repository.
3. Configure settings:
   - **Project Name:** `markup-web-frontend`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click "Edit" and choose `apps/web-demo`.
4. Add Environment Variables:
   | Variable Name | Value |
   |---|---|
   | `NEXT_PUBLIC_CMS_API_URL` | `https://your-admin-project.vercel.app/api/v1` (or your custom admin domain) |
   | `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
   | `NEXT_PUBLIC_R2_MEDIA_URL` | `https://media.yourdomain.com` |
5. Click **Deploy**.

---

## Step 5: Connect Custom Domains (Free)

In Vercel, go to **Settings** > **Domains**:
* For `markup-web-frontend`: Add `yourdomain.com` and `www.yourdomain.com`.
* For `markup-admin-cms`: Add `admin.yourdomain.com`.

Vercel will give you the DNS records (A and CNAME) to add to your domain registrar. SSL certificates are provisioned automatically for free!

---

## 💰 Total Cost Breakdown

| Item | Provider | Monthly Cost |
|---|---|---|
| Frontend Website | Vercel (Hobby) | **$0.00** |
| Backend & Headless CMS | Vercel (Hobby) | **$0.00** |
| PostgreSQL Database | Vercel Postgres (Neon) | **$0.00** |
| Media & Assets | Cloudflare R2 (10 GB free) | **$0.00** |
| SSL & DDoS Protection | Vercel & Cloudflare | **$0.00** |
| **Total** | | **$0.00 / month** |
