# Global Football Auction 2026 - Deployment Guide

This document contains step-by-step instructions to deploy the football auction multiplayer game.

---

## Architecture Overview
* **Frontend**: Next.js v16 (React v19) styled with Tailwind CSS. Can be deployed to static/serverless platforms (like Vercel) or containerized.
* **Backend**: FastAPI + Socket.IO (ASGI). **Must** be hosted on a persistent server (not serverless) that supports WebSockets.
* **Databases**: MongoDB (rooms & player database persistence) and Redis (real-time live bidding state). The backend falls back to in-memory storage if these are not connected, but data will reset when the backend restarts.

---

## 🚀 Option A: Cloud Managed Hosting (Recommended)
This is the easiest and most robust method. It uses **Vercel** for the frontend, **Render** (or Railway) for the backend, and free-tier databases.

### 1. Database Setup (Optional but Recommended)
* **MongoDB**:
  1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
  2. Create a free shared cluster.
  3. Under **Database Access**, create a user with a password.
  4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere, required for Render/Vercel).
  5. Get your Connection String (looks like `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`).
* **Redis**:
  1. Create a free account at [Upstash Redis](https://upstash.com/).
  2. Create a database in your preferred region.
  3. Copy the **Redis URL** (looks like `redis://default:xxxx@xxxx.upstash.io:6379`).

---

### 2. Backend Deployment (Render or Railway)
Because the backend uses Socket.IO, it requires a persistent server connection. We will use **Render**.

1. Go to [Render](https://render.com/) and sign up.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following details:
   * **Name**: `football-auction-backend`
   * **Language**: `Python` or use the `Dockerfile` option.
   * **Build Command** (if Python): `pip install -r requirements.txt`
   * **Start Command** (if Python): `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add the following **Environment Variables**:
   * `PORT`: `10000` (Render sets this automatically, but good to have)
   * `MONGO_URI`: *[Your MongoDB Atlas Connection String]*
   * `REDIS_URL`: *[Your Upstash Redis URL]*
   * `DB_NAME`: `football_auction`
6. Deploy the web service and copy the generated URL (e.g. `https://football-auction-backend.onrender.com`).

---

### 3. Frontend Deployment (Vercel)
Vercel is optimized for Next.js and has a generous free tier.

1. Go to [Vercel](https://vercel.com/) and log in.
2. Click **Add New** -> **Project** and import your repository.
3. In the project configure settings:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: `frontend`
4. Add the following **Environment Variable**:
   * `NEXT_PUBLIC_SOCKET_URL`: *[Your Render Backend URL]* (e.g., `https://football-auction-backend.onrender.com`)
   * *Note: Do not include a trailing slash in the URL.*
5. Click **Deploy**. Vercel will build and launch your application.

---

## 🐳 Option B: Self-Hosted Single VPS (Docker Compose)
If you own a VPS (DigitalOcean, Linode, AWS EC2, Hetzner, etc.), you can run the entire stack with a single command. 

### Prerequisites
Make sure your VPS has Docker and Docker Compose installed:
```bash
# Verify installation
docker --version
docker compose version
```

### Setup Steps
1. Clone the repository onto your VPS.
2. Navigate to the root directory (where `docker-compose.yml` is located).
3. Start all services in detached mode:
   ```bash
   docker compose up -d --build
   ```
4. This starts four containers:
   * `football-auction-frontend` on port `3000`
   * `football-auction-backend` on port `8000`
   * `football-auction-mongodb` on port `27017`
   * `football-auction-redis` on port `6379`

### How Routing Works (No Rebuild Required)
The Next.js client utilizes a dynamic WebSocket connection utility. If no `NEXT_PUBLIC_SOCKET_URL` is set during build, it automatically connects to `http://<your-vps-ip>:8000`. 
Therefore, you can visit `http://<your-vps-ip>:3000` in your browser, and the game will connect to the backend on port `8000` automatically.

---

## ⚙️ Post-Deployment Checklist
1. **Verification**: Open your deployed frontend URL. Open the browser DevTools console (F12) and verify there are no WebSocket connection errors. You should see `Connected to WebSocket backend server, SID: ...`.
2. **CORS Restrictions** (Optional): If you want to lock down the backend CORS, modify `backend/main.py` and replace `allow_origins=["*"]` with your specific Vercel URL (e.g. `allow_origins=["https://your-app.vercel.app"]`).
3. **Database Seeding**: If you are using a new MongoDB database, you can seed the master list of 180 elite players by running the seed script. Connect to your VPS or run locally:
   ```bash
   cd backend
   python seed.py
   ```
   *(Ensure `MONGO_URI` is set in your terminal environment before running the seed script.)*
