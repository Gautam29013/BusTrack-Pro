# BusTrackPro 🚌

> Real-Time Bus Tracking System — Production-Ready

![Stack](https://img.shields.io/badge/Node.js-18-green) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Socket.io](https://img.shields.io/badge/Socket.io-4-white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-green) ![Redis](https://img.shields.io/badge/Redis-7-red)

## Features

- 🗺️ **Live map** with real-time bus markers (React-Leaflet + OpenStreetMap)
- 📡 **WebSocket updates** via Socket.io every 3 seconds
- ⏱️ **Smart ETA** using Haversine distance calculation
- 🔒 **JWT authentication** with access/refresh token rotation
- 🚌 **Bus simulator** — 5 mock buses moving along realistic routes (no GPS hardware needed)
- 🎨 **Premium dark UI** with glassmorphism, smooth Framer Motion animations
- 🐳 **Docker Compose** for full stack deployment
- 🛡️ Rate limiting, CORS, Helmet security headers

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS, Framer Motion |
| State | Zustand |
| Map | React-Leaflet + OpenStreetMap |
| Real-time | Socket.io (client + server) |
| Backend | Node.js + Express |
| Auth | JWT (access + refresh) |
| DB (relational) | PostgreSQL 15 |
| DB (GPS data) | MongoDB 7 |
| Cache / Pub-Sub | Redis 7 |
| HTTP Client | Axios |
| Logging | Winston |
| Email | Nodemailer |

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for databases)
- npm

### 1. Start databases
```bash
docker-compose up postgres mongo redis -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env    # edit if needed
npm install
npm run dev             # starts on :5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev             # starts on :3000
```

Open [http://localhost:3000](http://localhost:3000)

## Full Docker Deploy

```bash
docker-compose up -d
```

Services:
- Frontend → http://localhost:3000
- Backend API → http://localhost:5000
- PostgreSQL → localhost:5432
- MongoDB → localhost:27017
- Redis → localhost:6379

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh JWT |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current user |

### Buses
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/buses | All active buses |
| GET | /api/buses/locations | All current locations |
| GET | /api/buses/:id | Bus details |
| GET | /api/buses/:id/location | Bus GPS |
| GET | /api/buses/:id/route | ETA for stops |
| GET | /api/buses/search?q= | Search buses |

### Stops
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/stops | All stops |
| GET | /api/stops/:id/buses | Buses at stop |

### Users (Authenticated)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users/profile | Get profile |
| PUT | /api/users/profile | Update profile |
| GET | /api/users/favorites | Favorites list |
| POST | /api/users/favorites | Add favorite |

## WebSocket Events

**Namespace:** `/buses`

| Event | Direction | Payload |
|---|---|---|
| `subscribe` | Client → Server | `{ busId }` |
| `subscribe-all` | Client → Server | — |
| `location-update` | Server → Client | `{ busId, latitude, longitude, speed, heading, ... }` |

## Bus Simulator

The simulator automatically creates 5 buses (B101–B505) on 3 routes:
- **City Loop North** (blue)
- **City Express South** (green)
- **Downtown Shuttle** (amber)

Each bus moves smoothly along waypoints broadcasting every 3 seconds. Toggle via `ENABLE_BUS_SIMULATOR=true` in backend `.env`.

## Project Structure

```
BusTrackPro/
├── backend/             # Express API + Socket.io
│   ├── src/
│   │   ├── config/      # DB connections
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Auth, CORS, rate limit
│   │   ├── models/      # Mongoose + PG models
│   │   ├── routes/      # Express routers
│   │   ├── services/    # Business logic
│   │   ├── simulation/  # Bus GPS simulator
│   │   ├── sockets/     # Socket.io namespaces
│   │   └── utils/       # JWT, logger, distance
│   └── server.js
├── frontend/            # Next.js App Router
│   └── app/
│       ├── (auth)/      # Login + Signup pages
│       ├── (app)/       # Dashboard + Tracking + Profile
│       ├── components/  # MapView, BusList, ETACard...
│       ├── hooks/       # useSocket, useBusTracking...
│       ├── lib/         # Axios, Socket client
│       └── store/       # Zustand stores
├── docker-compose.yml
└── README.md
```
