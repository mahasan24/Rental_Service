# Rentel Service.com

A rental van booking website where users can view services, get smart van recommendations, and book rental vans online. Includes an AI-driven FAQ bot and optional AI-generated van descriptions.

**Team 18:** Mohammod Habib Ullah, Tanvir Ahammed, Emtiuz Bhuiyan, Mahmudul Hasan

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **AI:** OpenAI/Gemini via LangChain (RAG FAQ, van descriptions)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run migrate
npm run seed   # optional: seed vans
npm run dev
```

API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Database

Create a PostgreSQL database and set `DATABASE_URL` in `backend/.env`.

## Project Structure

- `frontend/` – React app (auth, van listing, booking, recommendations, FAQ bot)
- `backend/` – Express API (auth, vans, bookings, recommendations, RAG, description gen)
- `docs/` – Documentation and FAQ content for RAG
- `.github/workflows/` – CI
