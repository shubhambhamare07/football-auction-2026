# ⚽ BidBall.in — Real-Time Football Fantasy Auction

BidBall is a premium, real-time multiplayer football draft and auction game built for modern football managers. Create a lobby, invite your friends, and enter a live bidding arena to draft your dream squad. Upgrade your players in the Transfer Window, purchase game-changing powerups in the Boost Center, and share your championship squad with premium FUT-style share cards.

---

## 🚀 Key Features

* **Real-Time Bidding Wars:** Socket.IO-synced live auctioneer room draft cycles with micro-timer alerts and instant outbid sound synthetics.
* **Premium Nation-Themed Cards:** Fluid card layouts with gorgeous gradients inspired by each player's national colors, high-res silhouettes, and hover holographic shines.
* **Tactical Boost Center:** Buy card upgrades (e.g., Chemistry Boosts, Steal Cards, Budget Extensions) to outmaneuver rivals in the leaderboard standings.
* **Dynamic Transfer Window:** Buy, sell, or trade player assets with fellow managers using live Socket.IO negotiations.
* **Podium Celebrations &Confetti:** Rank standings podiums featuring CONFETTI explosions, MVP highlights, and bargain stats.
* **HD 1080x1440 Share Cards:** Rebuilt sharing card exporter compiled via `html-to-image` at exactly 3:4 aspect ratios. Includes system share sheets (`navigator.share`), X, WhatsApp, Snapchat, and Instagram gateways.
* **Seamless Invite Loop:** QR Code invite links encode the full join URLs (`/?join=XXXXXX`) for instant room entries on mobile.

---

## 🛠️ Technology Stack

### Frontend (Next.js Application)
* **Core:** React 19 / Next.js 16 (App Router) / TypeScript
* **Animations:** Framer Motion
* **Audio Engine:** Web Audio API & Howler.js for tactical synthesizers
* **Canvas Exporter:** `html-to-image` vector screenshot compiler
* **QR Compiler:** `qrcode.react` (vector SVG renderer)
* **Styling:** Vanilla Tailwind CSS with custom HSL variables

### Backend (Python ASGI Application)
* **API Framework:** FastAPI (ASGI Python web server)
* **Real-time Sync:** python-socketio (Asynchronous Socket.IO)
* **Database & Caching:** MongoDB (Persistence) & Redis (Real-time socket state caching)
* **State Fallbacks:** Pure in-memory local state mapping in Python (runs database-free for developer setups!)

---

## 📂 Project Directory Structure

```
football-auction/
├── backend/
│   ├── main.py              # FastAPI application server entrypoint
│   ├── socket_manager.py    # Socket.IO room, connection, and messaging handlers
│   ├── auction_engine.py    # Live bidding cycles, timers, and drawer logic
│   ├── transfers.py         # Transfer market negotiations
│   ├── boosts.py            # Tactical powerups database & handlers
│   ├── db.py                # MongoDB & Redis client configurations with local file fallbacks
│   ├── players_db.json      # Master database of footballers (180+ players)
│   ├── seed.py              # Script to populate database with elite attributes
│   └── requirements.txt     # Python requirements manifest
└── frontend/
    ├── public/              # Logo, static illustrations, and public assets
    ├── src/
    │   ├── app/             # Next.js routes, layout, global stylesheets
    │   ├── components/      # Views: Home, Join, Lobby, Auction, Pitch, Transfers, Boosts, Standings
    │   ├── types/           # TypeScript interface definitions
    │   └── utils/           # Socket client, sound engine wrapper, and converters
    └── package.json         # Node.js dependencies
```

---

## ⚙️ Environment Variables

Copy the environment parameters into appropriate `.env` files.

### Backend Configurations (`backend/.env`)
```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=football_auction
REDIS_URL=rediss://default:<password>@redis-server.upstash.io:6379
```

### Frontend Configurations (`frontend/.env.local`)
```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend-api.render.com
```
*Note: If `NEXT_PUBLIC_SOCKET_URL` is omitted, the frontend automatically falls back to standard client hostname connections on port `8000` (`http://localhost:8000`), which is ideal for local Wi-Fi testing.*

---

## 💻 Local Setup & Execution

### 1. Run the Backend ASGI Server
Ensure you have Python 3.9+ installed.

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database seed players (optional, if using MongoDB Atlas):
   ```bash
   python seed.py
   ```
4. Start the ASGI Server on port `8000`:
   ```bash
   uvicorn main:app --host 0.0.0.5 --port 8000 --reload
   ```

### 2. Run the Next.js Frontend Dev Server
Ensure you have Node.js 18+ installed.

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js hot-reload dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment

### 1. Backend API (Render, Railway, or Docker)
The backend includes a `Dockerfile` and is fully ready to deploy.
* Set the environment variables (`MONGO_URI`, `REDIS_URL`, `PORT`) in your cloud provider's dashboard.
* If deploying on Render, configure the service as a **Web Service** with start command:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### 2. Frontend Application (Vercel)
The frontend is optimized for direct imports on Vercel.
* Import the repository, select `Next.js` preset, set directory to `frontend`, and define `NEXT_PUBLIC_SOCKET_URL` pointing to your deployed backend URL.

---

## 📄 License & Commercial Rights
All dependencies inside this project are licensed under highly permissive open-source licenses:
* **Frontend Packages:** `next` (MIT), `react` (MIT), `framer-motion` (MIT), `html-to-image` (MIT), `lucide-react` (ISC), `canvas-confetti` (MIT).
* **Backend Packages:** `fastapi` (MIT), `uvicorn` (BSD-3), `python-socketio` (MIT), `pymongo` (Apache 2.0).

This project is **100% safe for commercial publication**, modifications, and hosting. It contains zero restrictive licensing blocks.