# Tenadam Assessment App

A full-stack assessment application built with Next.js (frontend) and Express.js with Prisma (backend).

## Project Structure

```
tenadam-assessment-app/
├── frontend/          # Next.js React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express.js API server
│   ├── src/
│   ├── prisma/        # Database schema and migrations
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your PostgreSQL database and update the `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/tenadam_assessment"
   ```

4. Generate Prisma client and push schema:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Database

The application uses PostgreSQL with Prisma ORM. The schema includes:
- Users
- Assessments
- Responses
- Scores
- Admin Notes

## Development

- Backend runs on port 5000
- Frontend runs on port 3000
- Database schema is managed through Prisma migrations
