# Mission Control - Taskboard

A personal productivity taskboard application built with Astro, React, and PostgreSQL.

## Features

- **Gaming-style Dashboard**: Videogame aesthetics with progress bars and mission control theme
- **Sprint Objectives**: Track main objectives with deadline status indicators
- **Task Management**: Organize tasks in Backlog, Today, Doing, Completed, and Tomorrow columns
- **Pomodoro Timer**: Customizable focus sessions in 3, 4, or 5 work cycles
- **Notes System**: Quick notes with option to convert to virtual notebook entries
- **Meetings Management**: Schedule and track meetings with alerts
- **Daily Statistics**: Track completion rates and productivity metrics
- **Settings**: Customize work schedule and timer preferences

## Tech Stack

- **Frontend**: Astro + React
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT (single user)
- **Deployment**: Vercel
- **Styling**: Custom CSS (no Tailwind)

## Setup Instructions

### 1. Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL database (Supabase recommended)

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mi-taskboard

# Install dependencies
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database (Get from Supabase)
DATABASE_URL="postgresql://username:password@db.your-supabase-project.supabase.co:5432/postgres"

# JWT Secret (Generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# App Settings
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push database schema (for development)
pnpm db:push

# Or run migrations (for production)
pnpm db:migrate
```

### 5. Development

```bash
# Start development server
pnpm dev
```

Visit `http://localhost:4321` to access the application.

### 6. Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── ui/             # Base UI components
│   ├── AuthWrapper.tsx # Authentication wrapper
│   ├── Dashboard.tsx   # Main dashboard
│   └── App.tsx         # Root app component
├── layouts/            # Astro layouts
├── lib/                # Utilities
│   ├── prisma.ts       # Database client
│   └── auth.ts         # Authentication utilities
├── modules/            # Feature modules (vertical slicing)
│   ├── auth/          # Authentication
│   ├── tasks/         # Task management
│   ├── objectives/    # Sprint objectives
│   ├── pomodoro/      # Focus timer
│   ├── meetings/      # Meeting management
│   ├── notes/         # Notes system
│   ├── settings/      # App settings
│   └── dashboard/     # Dashboard features
├── pages/             # Astro pages
│   ├── api/          # API routes
│   └── index.astro   # Main page
└── styles/           # Global styles
```

## Architecture

The application uses **vertical slicing** architecture, where each feature is contained in its own module with:

- Components
- Services
- Types
- API handlers (when needed)

This approach makes the codebase more maintainable and scalable.

## Security

- Single-user system (only one user can register)
- JWT authentication for API protection
- All API routes validate authentication
- Environment variables for sensitive data

## Contributing

This is a personal project, but feel free to fork and customize for your own use.

## License

MIT License
