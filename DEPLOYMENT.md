# MathChrono — Deployment Guide

MathChrono is a **fully static Vue 3 app**. There is no backend, no database, and no environment variables required. All data is stored in the user's browser (`localStorage`).

---

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free tier is sufficient)
- [Node.js](https://nodejs.org) 18+ installed locally (for running locally or testing the build)

---

## 1. Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 2. Build for Production (optional check)

```bash
cd frontend
npm run build
```

The production-ready files are output to `frontend/dist/`.

---

## 3. Deploy to Vercel

### Option A — Via GitHub (recommended, auto-deploys on push)

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/MathChrono.git
   git push -u origin master
   ```

2. Go to [https://vercel.com/new](https://vercel.com/new) and click **"Import Git Repository"**.

3. Select your `MathChrono` repository.

4. Vercel will automatically detect the `vercel.json` configuration:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

5. Click **Deploy**. Done!

6. Every future `git push` to `master` will trigger a new deployment automatically.

### Option B — Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 4. After Deployment

- Share the Vercel URL with your child.
- Go to `https://your-app.vercel.app/settings` to set the current week's stage.
- Quiz history is saved in the browser's `localStorage` — it persists across visits on the same device/browser.

---

## Notes

- **No environment variables** are needed.
- **No database** is used — quiz history lives in the browser only.
- If your child switches devices or clears browser data, history will be lost (this is by design for a simple family app).
- The `/settings` page is not password-protected — it's accessible via URL. For a family device this is fine.
