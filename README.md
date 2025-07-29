# Mission Control - Personal Productivity Dashboard

A modern, gaming-inspired task board designed for software engineers and productivity enthusiasts. Built with Astro, React, TypeScript, and Prisma.

## ✨ Features

### 🎯 Task Management
- **Smart Task Organization**: Backlog, Today, Doing, Completed, Tomorrow columns
- **Drag & Drop**: Intuitive task movement between states
- **Priority System**: ASAP, High, Medium, Low priority levels
- **Rich Task Details**: Descriptions, time estimates, resources, and complexities

### 🚀 Sprint Objectives
- **Monthly Goals**: Set and track sprint objectives
- **Task Linking**: Connect tasks to objectives for better organization
- **Progress Tracking**: Visual progress indicators

### 🍅 Pomodoro Timer
- **Focus Sessions**: Built-in Pomodoro timer with work/break cycles
- **Session Tracking**: Monitor your focus time and productivity
- **Customizable Intervals**: Adjust work and break durations

### 📝 Notes & Documentation
- **Markdown Support**: Rich text editing for notes and documentation
- **Tagging System**: Organize notes with custom tags
- **Project Organization**: Group notes by project

### 📅 Meeting Management
- **Schedule Meetings**: Create and track upcoming meetings
- **Alerts**: Customizable reminders before meetings
- **Meeting Notes**: Link notes to specific meetings

### 🔐 Authentication & Multi-User Support
- **Secure Authentication**: JWT-based authentication system
- **Multi-User Support**: Each user has isolated data
- **Protected Routes**: Astro middleware-based route protection
- **User Management**: Registration, login, and profile management

### 📊 Analytics & Insights
- **Daily Statistics**: Track completed tasks and focus sessions
- **Progress Monitoring**: Visual feedback on daily and monthly goals
- **Work Schedule**: Configurable work hours and lunch breaks

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Astro with file-based routing
- **Database**: PostgreSQL
- **Authentication**: JWT tokens, bcryptjs
- **UI Components**: Radix UI, Lucide Icons
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mi-taskboard
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key-here"
```

4. Set up the database:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:4321](http://localhost:4321) in your browser.

## 🔐 Authentication System

The app features a comprehensive authentication system with:

### Frontend Authentication
- **Login/Register Forms**: Modern, responsive forms with validation
- **Astro Routing**: File-based routing with middleware protection
- **Auth Context**: Global authentication state management
- **Persistent Sessions**: Automatic token validation on app load

### Backend Security
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Astro middleware for route protection
- **User Data Isolation**: Each user only accesses their own data
- **Password Security**: bcrypt hashing with salt rounds

### Usage Examples

#### Protecting API Routes
```typescript
import { withAuth } from '../../../lib/middleware';

export const GET = withAuth(async ({ request }) => {
  const { user } = request;
  // User data is automatically available and verified
  // All database queries are automatically scoped to this user
});
```

#### Using Authentication in Components
```typescript
import { useAuth } from './AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.username}!</div>;
}
```

#### Astro Middleware Protection
```typescript
// src/middleware.ts
export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, redirect } = context;
  const user = getUserFromRequest(request);
  
  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard') && !user) {
    return redirect('/auth');
  }
  
  return next();
});
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components (Radix UI)
│   ├── AuthContext.tsx # Authentication state management
│   ├── AuthPage.tsx    # Login/Register page component
│   ├── LoginForm.tsx   # Login form component
│   ├── RegisterForm.tsx # Registration form component
│   ├── AuthGuard.tsx   # Authentication status display
│   └── App.tsx         # Main dashboard
├── modules/            # Feature modules (vertical slicing)
│   ├── auth/          # Authentication
│   │   ├── auth.service.ts  # Auth business logic
│   │   └── auth.types.ts    # Auth type definitions
│   ├── tasks/         # Task management (to be implemented)
│   ├── objectives/    # Sprint objectives (to be implemented)
│   └── ...            # Other feature modules
├── lib/               # Utilities
│   ├── prisma.ts      # Database client
│   ├── auth.ts        # JWT utilities
│   └── middleware.ts  # API middleware
├── pages/             # Astro pages & API routes
│   ├── api/
│   │   ├── auth/      # Authentication endpoints
│   │   ├── tasks/     # Task management endpoints
│   │   └── user/      # User management endpoints
│   ├── auth.astro     # Authentication page
│   ├── dashboard.astro # Protected dashboard page
│   └── index.astro    # Root page with redirects
├── middleware.ts      # Astro route protection middleware
└── styles/           # Global styles
```

## 🏗️ Architecture

The application uses **Astro's file-based routing** with middleware for authentication:

### Route Structure
- `/auth` - Login and registration page
- `/dashboard` - Protected dashboard for authenticated users
- `/` - Root redirects based on auth status
- `/api/*` - API endpoints with JWT protection

### Feature Modules
Each feature is contained in its own module with:
- **Components**: UI components specific to the feature
- **Services**: Business logic and data access
- **Types**: TypeScript type definitions
- **API Handlers**: Server-side endpoints

This approach makes the codebase more maintainable and scalable.

## 🔒 Security Features

- **Multi-User System**: Full support for multiple users with data isolation
- **JWT Authentication**: Secure token-based authentication with 7-day expiry
- **Astro Middleware**: Server-side route protection
- **Protected API Routes**: JWT validation on all protected endpoints
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Environment Variables**: Sensitive data stored securely
- **CORS Headers**: Configurable cross-origin resource sharing
- **Request Validation**: Input validation on all API endpoints

## 🔗 API Examples

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

### Protected Endpoints
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create a new task
- `GET /api/user/profile` - Get user profile with statistics

All protected endpoints automatically:
- Validate JWT tokens
- Provide user context
- Scope data to the authenticated user
- Handle authentication errors

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
4. Deploy

The app is optimized for Vercel's edge runtime and serverless functions.

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use. The authentication system and multi-user support make it suitable for team use or SaaS applications.

## 📄 License

MIT License

## 🛡️ Security Considerations

- Always use HTTPS in production
- Set a strong JWT_SECRET in production
- Consider implementing rate limiting for auth endpoints
- Monitor for suspicious authentication attempts
- Regularly rotate JWT secrets
- Implement proper password policies

## 🔮 Future Enhancements

- [ ] OAuth integration (GitHub, Google)
- [ ] Two-factor authentication
- [ ] Password reset functionality
- [ ] User roles and permissions
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Audit logging
- [ ] Email notifications
