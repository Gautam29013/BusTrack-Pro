# Deploying BusTrackPro to Vercel

BusTrackPro is a full-stack application divided into two parts:
1. **Frontend:** Built with Next.js (React)
2. **Backend:** Built with Node.js & Express

Vercel is the best platform for deploying the **Frontend** (Next.js). Below are the complete details and steps.

---

## ⚙️ Project Specifications for Vercel

- **Framework:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (Auto-detected by Vercel)
- **Install Command:** `npm install` (Auto-detected by Vercel)
- **Output Directory:** `.next` (Auto-detected by Vercel)

---

## 🚀 Step-by-Step Deployment Guide

### 1. Push Code to GitHub
Ensure all your latest code is pushed to your GitHub repository (this is already done).
```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Import Project in Vercel
1. Go to [Vercel's Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
2. Connect your GitHub account (if not already connected).
3. Select your `BusTrack-Pro` repository and click **Import**.

### 3. Configure the Project
Since the code is inside the `frontend` folder, you must tell Vercel where to look:

1. **Root Directory:** Click "Edit" and select the `frontend` folder.
2. **Framework Preset:** Vercel will automatically detect **Next.js**.
3. **Environment Variables:** Open the "Environment Variables" dropdown and add any keys from your `frontend/.env.local` file. 
   - *Example:* If your backend is hosted on another service (like Render or Railway), you will need to add:
     - `Name`: `NEXT_PUBLIC_API_URL`
     - `Value`: `https://your-backend-url.com`

### 4. Deploy
Click the **Deploy** button. Vercel will now install dependencies, build the Next.js app, and deploy it to a live URL!

---

## 💻 How to Run Locally

If you want to run or test the frontend locally before deploying:

1. Open your terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Note on the Backend
Vercel is optimized for frontend and serverless functions. Your `backend` directory (Node.js/Express with Postgres/Mongo/Redis) is meant to run continuously. 

For the backend, it is highly recommended to deploy it on a platform like **Render, Railway, or Heroku**, and then paste that live backend URL into Vercel's Environment Variables as `NEXT_PUBLIC_API_URL`.
