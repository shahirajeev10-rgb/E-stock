# Deployment Guide

## Recommended hosting

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 1. Deploy the backend on Render

Use the repo root and the included [render.yaml](/Users/srijana/Downloads/Estock/render.yaml), or create a Render web service with:

- Root directory: `Backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

### Backend environment variables

Set these in Render:

```env
NODE_ENV=production
MONGO_URL=your-mongodb-atlas-uri
SESSION_SECRET=your-long-random-secret
CLIENT_URL=https://your-frontend.vercel.app
CLIENT_URLS=https://your-frontend.vercel.app,https://www.yourdomain.com
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
PASSWORD_RESET_MODE=smtp
PASSWORD_RESET_URL=https://your-frontend.vercel.app/forgot-password
APP_NAME=eStock
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
MAIL_FROM=eStock <no-reply@yourdomain.com>
```

## 2. Deploy the frontend on Vercel

Import the repo into Vercel and set:

- Root directory: `frontend`
- Framework preset: Create React App
- Build command: `npm run build`
- Output directory: `build`

The included [vercel.json](/Users/srijana/Downloads/Estock/frontend/vercel.json) handles React Router refreshes.

### Frontend environment variables

Set this in Vercel:

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

## 3. Update backend frontend URLs

After Vercel gives you the final domain, update Render:

- `CLIENT_URL`
- `CLIENT_URLS`
- `PASSWORD_RESET_URL`

Restart the backend service after editing env values.

## 4. Verify production

Check these flows on the live site:

1. Homepage loads
2. Signup works
3. Login works
4. Dashboard loads live data
5. Lessons open
6. Simulator can buy and sell
7. Profile save works
8. Support ticket creation works
9. Forgot password email arrives and reset works

## 5. Optional custom domain

You do not need to buy a domain first.

Use the free hosting URLs for uni submission, then add a custom domain later if needed:

- frontend: `your-app.vercel.app`
- backend: `your-api.onrender.com`
