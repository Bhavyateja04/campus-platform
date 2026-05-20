# Campus Admin Web

This workspace contains a Vite frontend and an Express/MongoDB backend.

## Run the backend

```powershell
cd Backend
npm install
npm run dev
```

The backend listens on `http://localhost:5000` and now exposes a dev auth token endpoint plus CRUD routes for users, lost & found, marketplace, canteens, notifications, memories, clubs, placements, exam halls, and exams.

## Run the frontend

```powershell
cd ..
npm install
npm run dev
```

## Run both locally

From the project root you can start both the backend and frontend together:

```powershell
npm install
npm run dev:all
```

The frontend automatically requests a development admin token from the backend and stores it locally, so you do not need to paste a JWT manually during local development.

## Password login

New users created from the admin panel receive a generated password by email and can authenticate through `POST /api/auth/login` with `{ "email": "...", "password": "..." }`.

## Environment

If needed, set these values in `.env` files:

- `Backend/.env`: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- `Backend/.env` for welcome emails: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- `Backend/.env` optional preview mode: `EMAIL_TEST_MODE=true`
- Frontend `.env`: `VITE_API_BASE_URL` or `VITE_ADMIN_TOKEN` (optional)

If the SMTP variables are not set, the backend now fails the welcome-email send with a clear error instead of silently pretending the message was delivered.
If you want a console-only preview during development, set `EMAIL_TEST_MODE=true`.
