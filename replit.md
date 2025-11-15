# Overview

This is a comprehensive healthcare mobile application for Pakistan, built as a full-stack Progressive Web App (PWA). The application serves two primary user groups: patients and healthcare facilities (hospitals). It provides AI-powered symptom triage, health program eligibility assistance, appointment booking, emergency services, medical record management, and extensive health education resources.

The system implements a multi-agent architecture using the Model Context Protocol (MCP) where specialized AI agents handle different healthcare domains (triage, eligibility checking, facility recommendations, follow-ups, analytics, and knowledge aggregation).

**Key Features:**
- AI-powered symptom assessment and triage
- Pakistan health program eligibility checker
- Hospital/doctor appointment management
- Emergency assistance with real-time coordination
- Medical history and profile management
- Comprehensive medicine and disease libraries
- Women's health, child health, and mental health modules
- Vaccination tracking
- Lab test information
- Dual-role system (patient portal + hospital dashboard)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework:** React 18 with TypeScript  
**Routing:** Wouter (lightweight client-side routing)  
**State Management:** TanStack Query (React Query) for server state  
**UI Framework:** Shadcn/ui components built on Radix UI primitives  
**Styling:** Tailwind CSS with custom design system

**Rationale:** The application uses a component-based architecture optimized for mobile-first healthcare UX. Shadcn/ui was chosen for its accessibility-first approach (critical for healthcare apps) and customizability. Wouter provides minimal routing overhead suitable for mobile devices.

**Design System:**
- Follows Material Design principles adapted for healthcare (trust, clarity, calm interface)
- Typography: Inter font family with hierarchical scales (24px headings down to 12px labels)
- Spacing: Tailwind units (4px base grid: px-4, py-6, gap-8)
- Color system: HSL-based with semantic tokens (primary, destructive, muted, accent)
- Mobile-optimized layouts with responsive grids and cards

## Backend Architecture

**Framework:** Express.js with TypeScript  
**API Style:** RESTful JSON APIs  
**Build Tool:** esbuild for production bundling  
**Development:** tsx for TypeScript execution

**Key API Routes:**
- `/api/agent/*` - Multi-agent system endpoints (sessions, chat)
- `/api/emergencies/*` - Emergency request handling
- `/api/appointments/*` - Appointment CRUD operations
- `/api/hospitals/*` - Hospital and doctor management
- `/api/womens-health/*` - Women's health awareness content

**Rationale:** Express provides flexibility for custom middleware and route handling. The server acts as an orchestrator for the MCP agent system while also serving traditional CRUD operations. The separation of agent routes from standard REST routes allows the AI system to evolve independently.

## Multi-Agent System (MCP)

**AI Provider:** OpenAI GPT-5 via Replit AI Integrations  
**Architecture Pattern:** Event-driven agent orchestration

**Agents:**
1. **Triage Agent** - Symptom analysis, urgency assessment, healthcare routing
2. **Eligibility Agent** - Health program qualification checking (Sehat Card, EPI, BISP, etc.)
3. **Facility Finder Agent** - Location-based hospital/BHU recommendations
4. **Follow-Up Agent** - Medication reminders, vaccination schedules
5. **Analytics Agent** - Medical protocol retrieval (WHO, Pakistan NIH)
6. **Knowledge Agent** - Outbreak detection, health trend analysis

**Communication:** Event bus system for inter-agent messaging with traceable logs  
**Configuration:** Centralized in `/server/mcp/index.ts` with 7 retries, exponential backoff (2s-128s), concurrency limit of 2

**Rationale:** The multi-agent architecture separates concerns by domain expertise, allowing each agent to reason autonomously while collaborating through events. This mirrors real healthcare systems where specialists consult on complex cases. The event bus ensures all agent interactions are logged for audit trails (critical in healthcare).

## Data Storage

**ORM:** Drizzle ORM  
**Database Driver:** @neondatabase/serverless (PostgreSQL)  
**Schema Location:** `/shared/schema.ts`  
**Migration Strategy:** Drizzle Kit push commands

**Core Tables:**
- `users` - Patient and hospital accounts (role-based)
- `hospitals` - Healthcare facility registry
- `doctors` - Doctor profiles with specializations
- `appointments` - Booking system with status workflow
- `emergencies` - Real-time emergency requests
- `womens_health_awareness` - Educational content
- `screening_reminders` - Healthcare notifications
- `agent_sessions` / `agent_messages` / `agent_events` - MCP agent state
- `cached_responses` - AI response caching for offline mode
- `knowledge_alerts` - Health trend alerts
- `protocol_sources` - Medical guideline references

**Session Management:** PostgreSQL-backed sessions via connect-pg-simple

**Rationale:** Drizzle provides type-safe database access with minimal overhead. PostgreSQL was chosen for ACID compliance (critical for medical records) and JSON support (flexible agent state storage). The schema separates patient data, hospital operations, and agent infrastructure into distinct domains.

## Knowledge Base Integration

**Static Data Sources:**
- `/shared/health-programs.ts` - Pakistan health schemes (20+ programs)
- `/shared/disease-library.ts` - Common diseases with symptoms, treatments
- `/shared/medicine-library.ts` - Drug information with dosages and interactions
- `/shared/symptom-triage.ts` - Rule-based triage logic

**Rationale:** Health program information and medical protocols are embedded as TypeScript modules for zero-latency access and version control. This ensures the app functions offline and provides instant responses for common queries. The data is structured for easy AI agent consumption.

## Authentication & Authorization

**Strategy:** Role-based access control (RBAC)  
**Roles:** `patient` | `hospital`  
**Storage:** localStorage for demo (client-side role persistence)  
**Guards:** `RoleGuard` component for route protection

**Rationale:** The current implementation uses localStorage for role management (suitable for prototype). Hospital users access `/hospital/*` routes with management dashboards, while patients access `/dashboard` and health tools. The guard system prevents cross-role access.

**Production Consideration:** This should be replaced with JWT-based authentication with HTTP-only cookies and server-side session validation.

## Real-Time Features

**Emergency System:**
- Client polls `/api/emergencies` every 5 seconds
- Hospital dashboard shows live emergency count
- Status updates trigger cache invalidation via TanStack Query

**Rationale:** Polling was chosen over WebSockets for simplicity and serverless compatibility. The 5-second interval balances real-time requirements with server load. For production scale, consider WebSocket or Server-Sent Events.

## Offline Capability

**Strategy:** Cached AI responses stored in database  
**Degraded Mode:** Agent system designed to serve cached responses when OpenAI unavailable

**Rationale:** Healthcare apps must function during network outages. The `cached_responses` table stores previous AI interactions for offline retrieval. The agent system checks cache before making API calls.

# External Dependencies

## Third-Party Services

**OpenAI GPT-5 (via Replit AI Integrations)**
- Purpose: Multi-agent reasoning, symptom triage, health program advice
- Integration: Environment variables `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`
- Model: `gpt-5` (temperature: 1, max tokens: 8192)
- Billing: Charged to Replit credits

**Neon Database (PostgreSQL)**
- Purpose: Primary data store
- Connection: `DATABASE_URL` environment variable
- Driver: Serverless WebSocket-based connection pooling

## UI Component Libraries

**Radix UI Primitives** - 20+ accessible component primitives (Dialog, Select, Tabs, etc.)  
**Shadcn/ui** - Pre-styled Radix components with Tailwind  
**Lucide Icons** - Icon set for healthcare UI

**Rationale:** Radix provides WAI-ARIA compliant components (essential for healthcare accessibility). Shadcn allows customization while maintaining accessibility standards.

## Development Tools

**Vite** - Frontend build tool with HMR  
**TypeScript** - Type safety across frontend/backend  
**Drizzle Kit** - Schema management and migrations  
**TanStack Query** - Server state management  
**Wouter** - Client-side routing (3KB alternative to React Router)

## Optional Integrations (Referenced in Documentation)

**Google Maps API** - Facility navigation (not yet implemented)  
**SMS Gateway** - Appointment reminders and health alerts (not yet implemented)  
**Pakistan NSER/BISP APIs** - Eligibility verification (planned)

**Rationale:** These integrations are documented in attached assets but not yet implemented. The architecture allows for future extension without major refactoring.