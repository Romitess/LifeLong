# Lifelong2 Deploy Notes

This folder is the deploy root for both apps:

- `frontend` - Quasar frontend
- `backend` - NestJS backend

Shared runtime configuration now lives in the root `.env`. Use `.env.example` as the template for new machines.

## Common Commands

```bash
npm run install:all
npm run build:all
docker compose up --build
```

Frontend and backend commands can still run from their own folders. Their config loaders read the root `.env` first.

## Ports

- Frontend: `http://localhost`
- Backend: proxied through frontend at `/api`
- Moodle: `http://localhost:8080`
- Adminer: `http://localhost:8081`
- phpMyAdmin: `http://localhost:8888`
