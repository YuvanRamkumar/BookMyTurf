# Turf Booking Platform Prototype

A full-stack sports turf booking application built with Next.js 14, Tailwind CSS, and a file-based mock database.

## Features

### Role-Based Authentication
- **User**: Search turfs, view details, book hourly slots, and view booking history.
- **Admin (Turf Owner)**: Create turfs (with auto-slot generation), manage slots (manual blocking), and view dashboard stats. Requires Super Admin approval after registration.
- **Super Admin**: Manage all users, approve/suspend admins, view platform-wide stats, and delete turfs.

### Core Logic
- **Atomic Booking**: Simulated atomic updates to prevent double bookings.
- **Dynamic Slots**: Auto-generates hourly slots based on turf opening/closing times.
- **Slot Status**: Color-coded slots (Green: Available, Red: Booked, Grey: Past).

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@test.com` | `admin123` |
| Admin | `admin@test.com` | `admin123` |

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Auth**: JWT based sessions (using `jose`)
- **Database**: JSON-based mock DB (saved in `data/db.json`)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Visit**: [http://localhost:3000](http://localhost:3000)

## Project Structure
- `app/`: Next.js pages and API routes.
- `components/`: Shared UI components (Sidebar, Shell).
- `lib/`: Core logic (Auth, Database helpers, Utils).
- `data/`: Local storage for the JSON database.
