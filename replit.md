# Health Management Mobile App

## Overview

A healthcare mobile application built with React and Express that provides AI-powered health assistance, appointment booking, emergency services, and medical history tracking. The app follows Material Design principles adapted for healthcare contexts, prioritizing clarity, trust, and accessibility.

**Core Features:**
- AI health chatbot for symptom triage
- **Doctor appointment scheduling with intelligent schedule cross-checking**
  - Dynamic doctor lookup by department
  - Real-time availability checking based on doctor schedules
  - Time slot generation with automatic booking conflict detection
  - Only shows available appointment times (filters out already booked slots)
- Emergency assistance with one-tap alerts
- Medical history and records management
- Nearby facility finder with navigation (hospitals and pharmacies)
- User profile and health information management

**Tech Stack:**
- Frontend: React with TypeScript, Vite build system
- Backend: Express.js with TypeScript
- UI Framework: shadcn/ui (Radix UI primitives)
- Styling: Tailwind CSS with custom healthcare theme
- Database: PostgreSQL via Neon serverless
- ORM: Drizzle ORM
- State Management: TanStack Query (React Query)
- Routing: Wouter (lightweight client-side routing)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component-Based Structure:**
- Reusable UI components following atomic design principles
- Custom healthcare-specific components (AppointmentCard, ChatBubble, FacilityCard, MedicalHistoryCard, etc.)
- shadcn/ui base components for consistent design system
- Page-level components for each major feature (Dashboard, Chat, Appointments, Emergency, Map, History, Profile)

**Styling Strategy:**
- Tailwind CSS utility-first approach with custom healthcare theme
- CSS variables for theming (light mode defined, dark mode ready)
- Design tokens from `design_guidelines.md` (Inter font, specific spacing primitives)
- Custom utility classes for elevation and hover states (`hover-elevate`, `active-elevate-2`)

**State Management:**
- TanStack Query for server state and data fetching
- React hooks for local component state
- Custom query client configuration with credential-based authentication
- Centralized API request handling in `lib/queryClient.ts`

**Routing:**
- Client-side routing with Wouter
- Route definitions: `/` (onboarding), `/login`, `/dashboard`, `/chat`, `/appointments`, `/emergency`, `/map`, `/history`, `/profile`
- Navigation managed through `useLocation` hook

**Design Decisions:**
- Mobile-first responsive design (healthcare apps are primarily mobile)
- Healthcare-specific color scheme emphasizing trust and calm
- Accessibility-focused component library (Radix UI primitives)
- Component examples provided for development reference

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type safety
- ESM module system throughout the application
- Request/response logging middleware for API monitoring
- JSON body parsing with raw body preservation for webhooks

**API Structure:**
- RESTful endpoints under `/api` prefix
- Routes defined in `server/routes.ts`
- **Appointment Booking Endpoints:**
  - `GET /api/test-user` - Fetches test user ID for development
  - `GET /api/doctors?department=X` - Gets doctors filtered by department
  - `GET /api/doctors/:id/available-slots?date=YYYY-MM-DD` - Returns available time slots for a doctor on a specific date
  - `POST /api/appointments` - Creates new appointment booking
  - `GET /api/appointments?userId=X` - Retrieves user's appointments with doctor details
- **Schedule Cross-Checking Logic:**
  - Generates time slots based on doctor's weekly schedule (day of week, start/end times, slot duration)
  - Queries existing appointments for the selected doctor and date
  - Filters out booked time slots to show only available times
  - Prevents double-booking conflicts automatically

**Database Layer:**
- Storage abstraction through `IStorage` interface in `server/storage.ts`
- `DbStorage` implementation using Drizzle ORM
- Connection pooling via Neon serverless PostgreSQL
- WebSocket configuration for serverless database connections

**Data Models:**
- **Users**: Basic authentication with username/password, UUID primary key
- **Doctors**: Name, department (lowercase normalized), specialization, phone, UUID primary key
- **Doctor Schedules**: Links to doctor, day of week (0-6), start time, end time, slot duration (default 30 min)
- **Appointments**: User-doctor relationship with appointment date/time, status (pending/confirmed/completed), notes
- **Recent Changes (Nov 2025):**
  - Implemented full appointment booking system with schedule cross-checking
  - Database seeded with 6 doctors across 4 departments (cardiology, general, orthopedics, pediatrics)
  - Doctor schedules: Mon-Thu 9:00 AM - 5:00 PM, Fri 9:00 AM - 2:00 PM
  - Test user created for development (username: testuser)

**Development Setup:**
- Vite dev server in middleware mode for HMR during development
- Production build pipeline: Vite for frontend, esbuild for backend
- Database migrations via Drizzle Kit
- Seed script for populating test data

**Architectural Decisions:**
- Separation of concerns: storage layer abstracted from route handlers
- Type-safe database operations through Drizzle ORM schema definitions
- Serverless-ready architecture (Neon PostgreSQL, stateless Express)
- Session management ready via connect-pg-simple (imported but not fully configured)

### External Dependencies

**Database:**
- **Neon PostgreSQL**: Serverless PostgreSQL database
  - Connection via `@neondatabase/serverless` with WebSocket support
  - Environment variable: `DATABASE_URL`
  - Used for all persistent data storage

**UI Component Library:**
- **Radix UI**: Headless, accessible component primitives
  - Multiple components: Dialog, Dropdown, Popover, Tabs, Toast, Calendar, etc.
  - Provides keyboard navigation and ARIA compliance
  - Styled via Tailwind CSS

**Third-Party Services (Potential):**
- Google Fonts CDN for Inter typography
- Maps integration (referenced in facility finder, not yet implemented)
- Phone/SMS services for emergency alerts (planned feature)
- AI/LLM service for chatbot responses (UI ready, backend not connected)

**Development Tools:**
- **Vite**: Build tool and dev server with HMR
- **Replit Plugins**: Development banner, cartographer, runtime error overlay
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type checking across entire stack

**Form & Data Validation:**
- React Hook Form with Zod resolvers for type-safe form validation
- Drizzle-Zod for automatic schema-to-validation conversion
- Date manipulation via date-fns library

**Design System:**
- shadcn/ui configuration in `components.json`
- Tailwind config with custom theme variables
- Class variance authority for component variants
- Custom healthcare color palette and spacing system