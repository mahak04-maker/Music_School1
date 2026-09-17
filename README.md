# Harmony Music School — Class Scheduler

A mobile-first web app for a small music school to manage and display its weekly class schedule. Students view the schedule publicly without logging in; the school owner signs in to add, edit, and delete classes.

## Features

### Public Schedule (no login)
- Weekly timetable grouped by day (Monday–Sunday)
- Color-coded class cards showing teacher, subject, time, room, and enrollment
- Filter by teacher
- "FULL" badge on classes that have reached capacity
- Mobile-first, responsive design

### Owner Login
- Email + password authentication
- Create account on first use, then sign in thereafter
- Session persists until logout

### Admin Dashboard (login required)
- Add, edit, and delete classes with a simple form
- Teacher, subject, day, start/end time, room, max capacity, and current enrollment
- Conflict detection: blocks saving if the same teacher already has an overlapping class on the same day
- Validation: prevents invalid time ranges, empty fields, and invalid capacity values
- Delete confirmation prompt to prevent accidental deletions

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend/Database/Auth:** Supabase (PostgreSQL with Row Level Security)
- **Routing:** React Router

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (URL and anon key in `.env`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Visit the app — the public schedule loads immediately with seed data for 3 teachers (Priya/Vocals, Arjun/Keyboard, Maya/Guitar)
2. Click "Owner Login" in the footer to access the admin area
3. On first visit, use "Create Account" to set up the owner email and password
4. After signing in, add/edit/delete classes from the admin dashboard
5. Changes appear instantly on the public schedule

## Database

The `classes` table stores all class information. Row Level Security policies ensure:
- **Public read access** — anyone can view the schedule
- **Authenticated-only writes** — only the logged-in owner can add, edit, or delete classes

See `supabase/migrations/` for the full schema and migration files.

## Project Structure

```
src/
├── App.tsx                    # Routing + auth state
├── main.tsx                   # Entry point
├── index.css                  # Tailwind directives
├── components/
│   └── ScheduleView.tsx       # Shared schedule display (class cards by day)
├── lib/
│   ├── supabase.ts            # Supabase client + types + constants
│   └── timeConflict.ts        # Time overlap detection logic
└── pages/
    ├── PublicSchedule.tsx     # Public schedule with teacher filter
    ├── AdminLogin.tsx         # Owner sign-in / sign-up
    └── AdminDashboard.tsx     # Admin CRUD with conflict validation
```
