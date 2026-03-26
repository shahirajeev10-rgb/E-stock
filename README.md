# eStock

eStock is an interactive web-based learning platform for beginner stock trading education. It combines guided lessons, a personalised dashboard, and a risk-free trading simulator.

## Open the Website

Live website:

- [e-stock-vert.vercel.app](https://e-stock-vert.vercel.app)

Live backend health check:

- [estock-backend-umho.onrender.com/health](https://estock-backend-umho.onrender.com/health)

## Project Structure

- `frontend`: React frontend
- `Backend`: Node.js / Express backend
- `DEPLOYMENT.md`: deployment notes

## Run Locally

### 1. Start the backend

```bash
cd Backend
npm install
npm start
```

The backend runs on:

- `http://localhost:3002`

### 2. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend runs on:

- `http://localhost:3000`

## Environment Notes

For local development, the backend expects environment variables such as:

- `MONGO_URI` or `MONGO_URL`
- `SESSION_SECRET`
- `CLIENT_URL`

The frontend can use:

- `REACT_APP_API_URL`

See `DEPLOYMENT.md` for production setup details.

## Main Features

- User registration and login
- Structured beginner stock trading lessons
- Personalised dashboard
- Lesson progress tracking
- Trading simulator with virtual money
- Portfolio and holdings view
- Support request feature

## Tech Stack

- React
- Bootstrap
- Node.js
- Express.js
- MongoDB Atlas
- Vercel
- Render
