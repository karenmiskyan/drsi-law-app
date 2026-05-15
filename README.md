# DRSI Law — Immigration Petition Application

Production app at **https://apply.drsi-law.com/**

## Architecture

```
drsi_backend/    Laravel 12 + Filament 3 (API + Admin)
drsi_front/      Vite + React 19 (SPA, OTP-authenticated)
```

Frontend and backend are served from the same domain (`apply.drsi-law.com`). Apache routes:
- `/api/*`, `/admin/*`, `/sanctum/*`, `/storage/*`, `/login`, `/logout` → Laravel (`drsi_backend/public/index.php`)
- Everything else → React SPA fallback (`index.html`)

## Stack

**Backend** (`drsi_backend/`)
- Laravel 12 + PHP 8.4
- Filament 3 admin panel at `/admin`
- Sanctum (Bearer-token API auth) + OTP via email
- MySQL (cPanel) — application data with JSON `form_data` column
- Resend (HTTP API) for transactional email
- DOMPDF + PhpWord for application PDFs

**Frontend** (`drsi_front/`)
- React 19 + TypeScript + Vite 7
- Tailwind 4 + Radix UI primitives
- React Hook Form + Zod validation
- Zustand state + localStorage persistence
- React Router 7 (SPA)

## Local development

```
# Backend
cd drsi_backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate
php artisan serve     # http://localhost:8000

# Frontend
cd drsi_front
npm install
npm run dev           # http://localhost:5173
```

## Deployment

Push to `main` → GitHub Actions deploys to production server automatically.

See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) for the pipeline:
1. Build `drsi_front` (`npm ci` + `npm run build`)
2. Rsync `drsi_backend` to `/home/drsilaw/drsi-backend/` (preserving `.env`, storage, public/assets)
3. Rsync built `drsi_front/dist` into `drsi-backend/public/`
4. On server: `composer install --no-dev`, `php artisan migrate --force`, cache configs, fix permissions

The server `.env` is **not** in this repo — it's managed manually on the production server.

## Admin Panel

`https://apply.drsi-law.com/admin/login`

Login as the Filament admin user (created via `php artisan make:filament-user` on the server).

## API endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/auth/send-otp` | public | Send 6-digit OTP to email |
| `POST /api/auth/verify-otp` | public | Verify OTP, get Bearer token |
| `GET /api/user` | bearer | Current user |
| `POST /api/auth/logout` | bearer | Revoke token |
| `GET /api/application` | bearer | Get current user's application |
| `PUT /api/application/save-progress` | bearer | Auto-save form (JSON) |
| `POST /api/application/upload-document` | bearer | Upload single document |
| `PATCH /api/application/document-translation` | bearer | Update translation status |
| `GET /api/application/document/{id}/view` | bearer | Inline preview of uploaded doc |
| `POST /api/application/submit-stage-1` | bearer | Submit Stage 1 |
| `POST /api/application/submit-stage-2` | bearer | Submit Stage 2 |
