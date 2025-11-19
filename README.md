# HealthCare Pakistan - Multi-Agent Health Management System

A hybrid health management application for Pakistan featuring multi-agent AI architecture, emergency tracking, women's health services, appointment scheduling, pharmacy finder, and an interactive facility map.

## Features

### Core Features
- **Multi-Agent AI System**: 6 autonomous agents powered by OpenAI (Triage, Eligibility, Facility Finder, Follow-Up, Analytics, Knowledge)
- **Emergency Tracking**: Real-time emergency request system with hospital assignment
- **Women's Health Services**: Specialized health awareness and screening reminders
- **Facility Map**: Interactive map with Google Places API integration showing nearby hospitals
- **Appointment Scheduling**: Book appointments with doctors at various hospitals
- **Bilingual Support**: English and Urdu language support
- **Role-Based Access**: Separate interfaces for patients and hospital administrators

### Technical Features
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **PostgreSQL Database**: Powered by Neon serverless PostgreSQL with Drizzle ORM
- **Real-time Updates**: Live facility data from Google Places API
- **Caching & Rate Limiting**: Optimized API calls with server-side caching
- **Offline Support**: Graceful degradation when services are unavailable

## Tech Stack

### Frontend
- React + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- React Query (data fetching)
- Wouter (routing)
- Leaflet (maps)
- Zustand (state management)

### Backend
- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- JWT + bcrypt
- OpenAI API
- Google Places API

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- OpenAI API key
- Google Maps API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://...your-neon-db-url...

# Authentication
JWT_SECRET=your-secret-key-change-in-production
SESSION_SECRET=your-session-secret

# OpenAI API
OPENAI_API_KEY=sk-...your-openai-key...

# Google Maps API
GOOGLE_API_KEY=...your-google-maps-key...
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Push database schema:
```bash
npm run db:push
```

3. Seed the database with sample data:
```bash
tsx scripts/seed.ts
```

This creates:
- Patient user: `username=patient`, `password=patient123`
- Hospital admin 1: `username=jinnah_admin`, `password=hospital123`
- Hospital admin 2: `username=services_admin`, `password=hospital123`
- 3 sample hospitals
- Women's health awareness topics

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Authentication System

### How It Works

1. **Registration/Login**: Users register or login with username and password
2. **Role Assignment**: Users are assigned either "patient" or "hospital" role
3. **JWT Tokens**: Server issues JWT tokens valid for 7 days
4. **Token Storage**: Frontend stores token in localStorage via Zustand
5. **Auth Headers**: All API requests include `Authorization: Bearer <token>` header
6. **Role Guards**: Routes are protected based on user role

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (requires auth)

#### Emergencies
- `POST /api/emergencies` - Create emergency (patient only)
- `GET /api/emergencies` - List hospital emergencies (hospital only)
- `GET /api/emergencies/my` - List patient emergencies (patient only)
- `GET /api/emergencies/:id` - Get emergency details
- `PATCH /api/emergencies/:id/status` - Update status (hospital only)

#### Agent System
- `POST /api/agent/sessions` - Create agent session (requires auth)
- `GET /api/agent/sessions/:id` - Get session (owner only)
- `POST /api/agent/chat` - Send message to agent (requires auth)
- `GET /api/agent/messages/:sessionId` - Get conversation history (owner only)

#### Facilities
- `GET /api/facilities/hospitals` - Search nearby hospitals (Google Places API)
- `GET /api/facilities/photo` - Get facility photo

## Hospital Dashboard

Hospital administrators can:
- View all assigned emergencies
- Update emergency status (active → responding → resolved)
- Assign emergencies to specific hospitals
- Monitor patient requests in real-time

Access via: `http://localhost:5000/hospital-dashboard` (requires hospital role)

## Multi-Agent System

The MCP (Multi-Agent Coordinator Protocol) system includes:

1. **Triage Agent**: Symptom analysis and urgency classification
2. **Eligibility Agent**: Program matching and benefit assessment
3. **Facility Finder Agent**: Smart hospital/pharmacy matching
4. **Follow-Up Agent**: Autonomous scheduling and reminders
5. **Analytics Agent**: Protocol retrieval and medical guidance
6. **Knowledge Agent**: Pattern detection and outbreak monitoring

All agents support bilingual communication (English/Urdu) and maintain user session isolation.

## Database Schema

Main tables:
- `users` - User accounts with roles
- `hospitals` - Hospital information
- `emergencies` - Emergency requests
- `agent_sessions` - AI agent conversation sessions
- `agent_messages` - Conversation history
- `agent_events` - System events
- `womens_health_awareness` - Health education content
- `screening_reminders` - User health reminders

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Role-based access control (RBAC)
- ✅ User session isolation (users can only access their own data)
- ✅ Protected API endpoints with auth middleware
- ✅ Automatic token expiration handling
- ✅ PII protection and data anonymization
- ✅ Rate limiting on facility search endpoints

## Development

### Database Migrations

After making schema changes in `shared/schema.ts`:

```bash
npm run db:push
```

This safely syncs your schema to the database.

### Running Tests

```bash
npm run check
```

### Code Structure

```
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities (auth, queryClient)
│   │   └── App.tsx       # Main app component
├── server/               # Backend Express app
│   ├── routes/           # API route handlers
│   │   ├── auth.ts       # Authentication routes
│   │   ├── emergencies.ts# Emergency routes
│   │   ├── agents.ts     # Agent system routes
│   │   ├── facilities.ts # Facility search routes
│   │   └── photos.ts     # Photo proxy routes
│   ├── middleware/       # Express middleware
│   │   └── auth.ts       # JWT auth middleware
│   ├── mcp/              # Multi-agent system
│   │   ├── agents/       # Individual agent implementations
│   │   ├── orchestrator/ # Agent coordination logic
│   │   └── services/     # Shared services (translation, PII)
│   ├── db/               # Database connection
│   ├── storage.ts        # Data access layer (Drizzle)
│   └── index.ts          # Server entry point
├── shared/               # Shared between frontend/backend
│   └── schema.ts         # Database schema + Zod types
└── scripts/              # Utility scripts
    └── seed.ts           # Database seeding
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check Neon dashboard for connection limits
- Ensure database is not paused (Neon auto-pauses after inactivity)

### Google Maps Not Loading
- Verify `GOOGLE_API_KEY` is set
- Enable "Places API" and "Maps JavaScript API" in Google Cloud Console
- Check API key restrictions and quotas

### Authentication Errors
- Clear localStorage if experiencing token issues
- Verify `JWT_SECRET` is set in environment
- Check that user role matches the route requirements

## Contributing

This is a project built for health management in Pakistan. Contributions are welcome!

## License

MIT
