<h1 align="center">SyntaxShare</h1>
<p align="center">
  A developer-focused knowledge sharing platform built with React, Node.js, Express, and MongoDB.
</p>
<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
</p>

---

## 📸 Screenshots

> *(Add screenshots here after running the app)*

---

## ✨ Features

- **Public Feed** — Browse and read posts without signing in. Filter by tags or search keywords.
- **Authentication** — JWT-based register/login/logout with access + refresh token rotation.
- **Rich Text Editor** — Write posts in Markdown with a live split preview.
- **Syntax Highlighting** — Code blocks are highlighted server-agnostically via `rehype-highlight`.
- **Post Management** — Create, edit, delete posts. Draft and published states.
- **Engagement** — Like/unlike posts and comments. Bookmark posts to a personal reading list.
- **Comments & Replies** — Threaded discussion (one level deep).
- **User Profiles** — Public profile with bio, avatar, and post history. Edit your own profile.
- **Dark / Light Mode** — Theme toggle persisted to localStorage.
- **Responsive Design** — Mobile-friendly layout throughout.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (CSS custom properties) |
| Editor | @uiw/react-md-editor |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| HTTP client | Axios (with refresh token interceptor) |
| Backend | Node.js 20, Express 4 |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | JWT (access token 15m + refresh token 7d, httpOnly cookie) |
| Validation | express-validator |
| Deployment | Frontend → Vercel, Backend → Render |

---

## 🗂 Project Structure

```
Blogg/
├── server/   # Express API
│   └── src/
│       ├── config/       # MongoDB connection
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routers
│       ├── controllers/  # Business logic
│       ├── middleware/   # Auth + error handlers
│       └── utils/        # JWT helpers
└── client/   # React app (Vite)
    └── src/
        ├── api/          # Axios instance
        ├── context/      # Auth context
        ├── components/   # Reusable UI
        └── pages/        # Route pages
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier is fine)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/syntaxshare.git
cd syntaxshare
```

### 2. Configure the backend
```bash
cd server
cp .env .env.local   # or edit .env directly
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/syntaxshare
JWT_ACCESS_SECRET=<generate a strong random string>
JWT_REFRESH_SECRET=<generate a different strong random string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Install and run:
```bash
npm install
npm run dev
# → Server on http://localhost:5000
```

### 3. Configure the frontend
```bash
cd ../client
# Edit .env if needed:
echo "VITE_API_URL=/api" > .env
```

Install and run:
```bash
npm install
npm run dev
# → App on http://localhost:5173
```

---

## 🌐 MongoDB Atlas Setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user under **Security → Database Access**
3. Whitelist your IP (or `0.0.0.0/0` for development) under **Network Access**
4. Click **Connect → Drivers** and copy your connection string into `MONGO_URI`

---

## ☁️ Deployment

### Backend → Render
1. Push `server/` to GitHub (or the monorepo root)
2. Create a **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `server`
4. Build command: `npm install`  |  Start command: `npm start`
5. Add all environment variables from `server/.env` in the Render dashboard

### Frontend → Vercel
1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Framework preset: **Vite**
4. Add environment variable: `VITE_API_URL=https://your-render-service.onrender.com/api`
5. Deploy!

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/posts` | No | Feed (paginated) |
| GET | `/api/posts/:id` | No | Single post |
| POST | `/api/posts` | Yes | Create post |
| PATCH | `/api/posts/:id` | Yes | Update post |
| DELETE | `/api/posts/:id` | Yes | Delete post |
| POST | `/api/posts/:id/like` | Yes | Toggle like |
| POST | `/api/posts/:id/bookmark` | Yes | Toggle bookmark |
| GET | `/api/posts/user/bookmarks` | Yes | Get my bookmarks |
| GET | `/api/users/:username` | No | Public profile |
| PATCH | `/api/users/me` | Yes | Update profile |
| GET | `/api/comments/post/:postId` | No | Get comments |
| POST | `/api/comments/post/:postId` | Yes | Add comment |
| DELETE | `/api/comments/:id` | Yes | Delete comment |
| POST | `/api/comments/:id/like` | Yes | Like comment |
| GET | `/api/replies/comment/:id` | No | Get replies |
| POST | `/api/replies/comment/:id` | Yes | Add reply |
| DELETE | `/api/replies/:id` | Yes | Delete reply |
| GET | `/api/tags` | No | All tags with counts |

---

## 📄 License

MIT © [Your Name](https://github.com/your-username)
