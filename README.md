<div align="center">

# 🔐 Enclave Portal

### Production-Ready Secure Contact Portal with Admin Dashboard

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://enclave-portal-omega.vercel.app/)
[![API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://enclave-portal.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Nishant28-sh/enclave-portal)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Upload-3448C5?style=flat&logo=cloudinary)](https://cloudinary.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat&logo=jsonwebtokens)](https://jwt.io/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌐 Overview

**Enclave Portal** is a full-stack, production-ready contact form application with a secure admin dashboard. It demonstrates real-world patterns including JWT authentication, image uploads via Cloudinary, Zod schema validation, rate limiting, structured logging, and skeleton loading UI — all deployed on cloud platforms.

Built to serve as a reference implementation for modern MERN-stack applications.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🌍 Frontend (Vercel) | https://enclave-portal-omega.vercel.app/ |
| ⚙️ Backend API (Render) | https://enclave-portal.onrender.com/api/health |
| 🔐 Admin Dashboard | https://enclave-portal-omega.vercel.app/admin |
| 🔑 Admin Login | https://enclave-portal-omega.vercel.app/login |

> **Note:** The Render free-tier server may take ~30s to wake up on first request.

---

## ✨ Features

### 📬 Contact Form
- Full-form validation with **Zod** (server) and real-time field errors (client)
- Optional **image attachment** uploaded to Cloudinary (JPEG, PNG, WebP, GIF — max 5MB)
- Rate limiting — max 5 submissions per minute per IP
- Success/error feedback messages

### 🛡️ Admin Dashboard
- **JWT-based authentication** — 24-hour token, stored in localStorage
- Protected routes — unauthenticated users are redirected to `/login`
- View all contact submissions in a sortable table (newest first)
- Thumbnail preview of uploaded images (click to open full size)
- Delete any contact entry with confirmation
- **Refresh** button to reload data
- Automatic redirect on expired/invalid token

### ⚡ Developer Experience
- **Skeleton loading UI** — shimmer animation while fetching data
- **Lazy-loaded** React components via `React.lazy` + `Suspense`
- Structured server logging with **Winston** and **Morgan**
- Helmet for HTTP security headers
- CORS configured per environment

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI Library |
| [Vite](https://vitejs.dev/) | Build Tool & Dev Server |
| [React Router DOM v6](https://reactrouter.com/) | Client-side Routing |
| [Axios](https://axios-http.com/) | HTTP Client with Request Interceptors |
| Vanilla CSS | Styling (Neobrutalist Design System) |
| Space Grotesk | Typography (Google Fonts) |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express.js](https://expressjs.com/) | Web Framework |
| [MongoDB Atlas](https://www.mongodb.com/) | Database |
| [Mongoose](https://mongoosejs.com/) | ODM |
| [Zod](https://zod.dev/) | Schema Validation |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | JWT Auth |
| [Multer](https://github.com/expressjs/multer) | Multipart File Handling |
| [Cloudinary](https://cloudinary.com/) | Image Storage & CDN |
| [Helmet](https://helmetjs.github.io/) | HTTP Security Headers |
| [Morgan](https://github.com/expressjs/morgan) | HTTP Request Logger |
| [Winston](https://github.com/winstonjs/winston) | Structured Logging |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Rate Limiting |
| [Nodemon](https://nodemon.io/) | Dev Auto-restart |

### Infrastructure
| Service | Purpose |
|---|---|
| [Vercel](https://vercel.com/) | Frontend Deployment |
| [Render](https://render.com/) | Backend Deployment |
| [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Cloud Database |
| [Cloudinary](https://cloudinary.com/) | Image CDN |
| [GitHub](https://github.com/) | Version Control |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel)                       │
│                                                             │
│  ┌──────────┐   ┌─────────────┐   ┌────────────────────┐   │
│  │  /        │   │  /login     │   │  /admin            │   │
│  │ Contact  │   │  Login Page │   │  Admin Dashboard   │   │
│  │ Form     │   │  (JWT Auth) │   │  (Protected Route) │   │
│  └──────────┘   └─────────────┘   └────────────────────┘   │
│                        │ Axios + JWT Interceptor             │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┼────────────────────────────────────┐
│               SERVER (Render / Express)                      │
│                        │                                     │
│  ┌─────────────────────▼─────────────────────────────────┐  │
│  │  Middleware Stack                                      │  │
│  │  Helmet → CORS → Morgan → Body Parser → Rate Limiter  │  │
│  └──────────────────┬─────────────────┬──────────────────┘  │
│                     │                 │                      │
│  ┌──────────────────▼──┐  ┌──────────▼──────────────────┐  │
│  │  POST /api/auth/*   │  │  /api/contact  /api/admin/* │  │
│  │  (Login + Verify)   │  │  (JWT Protected on admin)   │  │
│  └─────────────────────┘  └──────────┬──────────────────┘  │
│                                       │                      │
│  ┌────────────────────────────────────▼──────────────────┐  │
│  │         Controllers + Zod Validation + Winston Log    │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐  ┌──────▼────────┐       │
    │  MongoDB Atlas │  │  Cloudinary   │       │
    │  (Contacts DB) │  │  (Images CDN) │       │
    └────────────────┘  └───────────────┘       │
```

---

## 📁 Project Structure

```
enclave-portal/
│
├── client/                          # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactForm.jsx      # Contact form with image upload
│   │   │   ├── ContactTable.jsx     # Admin contacts table with thumbnails
│   │   │   ├── ProtectedRoute.jsx   # JWT route guard
│   │   │   └── SkeletonTable.jsx    # Shimmer skeleton loader
│   │   ├── pages/
│   │   │   ├── Admin.jsx            # Admin dashboard page
│   │   │   └── Login.jsx            # Admin login page
│   │   ├── services/
│   │   │   ├── auth.service.js      # Login / logout / token helpers
│   │   │   └── contact.service.js   # API calls + JWT interceptor
│   │   ├── App.jsx                  # Routes + layout
│   │   ├── main.jsx                 # BrowserRouter entry point
│   │   └── index.css                # Global styles + design system
│   ├── vercel.json                  # SPA rewrite rules
│   ├── .env                         # Local env vars
│   └── package.json
│
└── server/                          # Node.js + Express Backend
    ├── src/
    │   ├── config/
    │   │   ├── db.js                # MongoDB connection
    │   │   └── cloudinary.js        # Cloudinary upload helper
    │   ├── controllers/
    │   │   ├── auth.controller.js   # Login + token verify
    │   │   └── contact.controller.js # CRUD for contacts
    │   ├── middlewares/
    │   │   ├── auth.middleware.js   # JWT verification
    │   │   ├── upload.middleware.js # Multer file handling
    │   │   ├── validate.middleware.js # Zod validation
    │   │   ├── rateLimit.middleware.js # Rate limiting
    │   │   ├── notFound.middleware.js
    │   │   └── error.middleware.js
    │   ├── models/
    │   │   └── Contact.js           # Mongoose schema
    │   ├── routes/
    │   │   ├── auth.routes.js       # POST /api/auth/login
    │   │   ├── contact.routes.js    # POST /api/contact
    │   │   └── admin.routes.js      # GET/DELETE /api/admin/contacts (protected)
    │   ├── schemas/
    │   │   └── contact.schema.js    # Zod validation schema
    │   ├── utils/
    │   │   └── logger.js            # Winston logger
    │   ├── app.js                   # Express app setup
    │   └── server.js                # Server entry point
    ├── .env                         # Local env vars
    ├── .env.example                 # Env template
    └── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/Nishant28-sh/enclave-portal.git
cd enclave-portal
```

### 2. Set Up the Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)
npm run dev
```

Server runs at: `http://localhost:8888`

### 3. Set Up the Client

```bash
cd client
npm install
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8888/api
npm run dev
```

Client runs at: `http://localhost:5173`

---

## 🔧 Environment Variables

### Server (`server/.env`)

```env
# Server
NODE_ENV=development
PORT=8888

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:8888/api
```

---

## 📡 API Documentation

### Base URL
```
https://enclave-portal.onrender.com/api
```

---

### Auth Routes

#### `POST /auth/login`
Authenticate as admin and receive a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `401`:**
```json
{
  "success": false,
  "message": "Invalid username or password."
}
```

---

#### `GET /auth/verify`
Verify if the current JWT token is still valid.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:** `{ "success": true, "message": "Token is valid." }`

**Response `401`:** `{ "success": false, "message": "Session expired. Please log in again." }`

---

### Contact Routes

#### `POST /contact`
Submit a new contact message (with optional image).

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | 3–50 characters |
| `email` | string | ✅ | Valid email address |
| `subject` | string | ✅ | 5–100 characters |
| `message` | string | ✅ | 20–500 characters |
| `image` | file | ❌ | JPEG/PNG/WebP/GIF, max 5MB |

**Response `201`:**
```json
{
  "success": true,
  "message": "Contact message submitted successfully.",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Hello",
    "message": "This is my message...",
    "imageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2026-07-05T14:00:00.000Z"
  }
}
```

**Response `400` (validation error):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "name", "message": "Name must be at least 3 characters." }
  ]
}
```

> ⚠️ Rate limited: max **5 requests per minute** per IP.

---

### Admin Routes
> All admin routes require `Authorization: Bearer <token>` header.

#### `GET /admin/contacts`
Fetch all submitted contacts (newest first).

**Response `200`:**
```json
{
  "success": true,
  "count": 3,
  "data": [ { ... }, { ... }, { ... } ]
}
```

---

#### `DELETE /admin/contacts/:id`
Delete a contact by its MongoDB ID.

**Response `200`:**
```json
{
  "success": true,
  "message": "Contact deleted successfully."
}
```

**Response `404`:**
```json
{
  "success": false,
  "message": "Contact not found."
}
```

---

### Health Check

#### `GET /health`
```json
{
  "success": true,
  "message": "Server is running successfully."
}
```

---

## 🚀 Deployment

### Frontend → Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com/)
2. Set these in **Project Settings → General:**
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add in **Settings → Environment Variables:**
   ```
   VITE_API_BASE_URL = https://your-render-app.onrender.com/api
   ```
4. Redeploy — the `vercel.json` handles SPA routing.

---

### Backend → Render

1. Create a **Web Service** from your GitHub repo on [Render](https://render.com/)
2. Set:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Add all required **Environment Variables** (see table above)
4. Click **Save and Deploy**

> ⚠️ Do **not** set a `PORT` variable — Render injects it automatically.

---

## 🔒 Security Highlights

| Feature | Implementation |
|---|---|
| **JWT Auth** | 24h signed tokens, verified on every admin request |
| **HTTP Headers** | Helmet middleware (XSS, clickjacking, HSTS, etc.) |
| **Rate Limiting** | express-rate-limit — 5 req/min on contact endpoint |
| **Input Validation** | Zod schemas on all POST endpoints |
| **File Validation** | Multer — type whitelist + 5MB size cap |
| **CORS** | Restricted to configured `CLIENT_URL` origin |
| **Env Secrets** | All credentials in `.env`, never committed |

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it as a reference or starter for your own projects.

---

<div align="center">

Made with ❤️ by **Nishant Sharma**

⭐ Star this repo if you found it helpful!

</div>
