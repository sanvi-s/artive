Artive Server (Node + Express + TypeScript)

Overview
- Node.js + Express + TypeScript backend for Artive.
- MongoDB via Mongoose, Cloudinary for media uploads.
- Idempotent migrations tracked in DB.
- Secure, minimal payload design; free-tier friendly.

Setup
1) Copy env:
   - cp .env.example .env
   - Fill all values. All external URLs and connection strings must come from environment variables only.

2) Install deps:
   - npm install

3) Run dev:
   - npm run dev

4) Migrations:
   - npm run migrate:status
   - npm run migrate:up

Frontend env
- Create frontend/.env.local with:
  NEXT_PUBLIC_API_URL=${API_BASE_URL}
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}

Important notes
- Do not remove seeding data. Seed data must remain dynamic — the backend should support seeding but never require deletion as part of migrations.
- Keep payloads minimal — by default the API returns only the fields necessary for feed/list views; to get full content use the ?full=true query on single seed endpoints.

Environment variables
- MONGO_URI
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- API_BASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- PORT
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX
- FRONTEND_ORIGIN

Endpoints (summary)
- GET /api/health → { ok, env }
- GET /api/version → { version }
- GET /api/config → { apiBase, cloudinaryCloudName }
- POST /api/auth/register → { token, user }
- POST /api/auth/login → { token, user }
- GET /api/auth/me (Bearer token) → user
- GET /api/users/:id
- PUT /api/users/:id (Bearer token)
- GET /api/seeds?page=&limit=&type=&sort=&search=
- GET /api/seeds/:id?full=true
- POST /api/seeds (Bearer token)
- PUT /api/seeds/:id (Bearer token)
- DELETE /api/seeds/:id (Bearer token) – soft delete
- GET /api/seeds/:id/forks
- POST /api/seeds/:id/forks (Bearer token)
- GET /api/lineage/:id?depth=
- GET /api/lineage/:id/export
- POST /api/uploads (multipart/form-data field "file")
- DELETE /api/uploads/:public_id (Bearer token)
- GET /api/search?q=&type=&limit=

Error format
- { error: { message: string, code?: string, details?: any } }

Security
- CORS allows FRONTEND_ORIGIN. Helmet headers enabled.
- Rate limiting applied to write endpoints.
- JWT-based auth middleware for protected routes.

Database design (free-tier oriented)
- Minimal fields with targeted indexes (Seed: type+createdAt, text on title+snippet).
- Pagination for listings; prefer createdAt cursors.
- Large media is stored in Cloudinary; DB stores only URLs/metadata.

Example cURL
- Health: curl "$API_BASE_URL/api/health"
- Login: curl -X POST "$API_BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"username":"u","password":"p"}'
- Upload: curl -X POST "$API_BASE_URL/api/uploads" -F file=@"/path/to/image.jpg"



