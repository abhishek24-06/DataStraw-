# Datastraw Support CRM

A professional Customer Support Ticketing CRM System built for the Datastraw AI + Tech Intern Assessment.

## Project Overview

This is a full-stack web application that enables support teams to manage customer support tickets efficiently. The system provides ticket creation, listing, searching, filtering, detailed views, status updates, and note-taking capabilities with persistent PostgreSQL storage.

## Features

### Core Requirements
- **Create Tickets**: Create tickets with customer name, email, subject, description, and priority
- **Auto-generated Ticket IDs**: Human-readable format (TKT-000001, TKT-000002, etc.)
- **List All Tickets**: Professional dashboard with ticket table/card view
- **Search**: Real-time backend-backed search across customer name, email, ticket ID, subject, and description
- **Status Filtering**: Filter by Open, In Progress, Closed
- **Ticket Detail View**: Complete ticket information with chronological notes timeline
- **Update Tickets**: Change status, priority, and add notes
- **Delete Tickets**: Delete tickets and all associated notes with confirmation
- **Persistent Storage**: PostgreSQL database with proper relationships

### Standout Feature: Ticket Priority
Added priority field with four levels: **Low**, **Medium** (default), **High**, **Urgent**.

**Reasoning**: Priority was added because support teams need a lightweight mechanism to distinguish routine tickets from urgent customer issues without introducing a more complex workflow. This allows teams to triage effectively and respond to critical issues first.

### Additional Features
- Real-time search with 350ms debounce
- Combined search and filter functionality
- Ticket statistics dashboard (total, open, in progress, closed)
- Responsive design (desktop table, mobile cards)
- Loading states, empty states, and error handling
- Accessible form inputs with proper labels
- Professional UI with clear status/priority badges

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Axios** for API communication

### Backend
- **FastAPI** for REST API
- **SQLAlchemy 2.0** for ORM
- **Pydantic v2** for validation
- **PostgreSQL** database
- **Alembic** for migrations
- **Uvicorn** ASGI server

### Deployment
- **Docker** & **Docker Compose** for local development
- Backend ready for **Railway/Render**
- Frontend ready for **Vercel**
- Database compatible with **Supabase PostgreSQL**

## Architecture

```
Browser (React Frontend)
    ↓ HTTP/REST
FastAPI Backend (Python)
    ↓ SQLAlchemy ORM
PostgreSQL Database (Supabase compatible)
```

## Database Schema

### Tickets Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| ticket_id | String(20) | Unique, Indexed |
| customer_name | String(255) | Not Null |
| customer_email | String(255) | Not Null, Indexed |
| subject | String(500) | Not Null |
| description | Text | Not Null |
| status | Enum | Open, In Progress, Closed (Default: Open) |
| priority | Enum | Low, Medium, High, Urgent (Default: Medium) |
| created_at | DateTime | Not Null, UTC |
| updated_at | DateTime | Not Null, UTC |

### Notes Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| ticket_id | Integer | Foreign Key → tickets.id, Not Null, Indexed |
| note_text | Text | Not Null |
| created_at | DateTime | Not Null, UTC |

**Relationship**: Ticket 1 —— N Notes

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets` | List tickets (with search, filter, pagination) |
| GET | `/api/tickets/stats` | Get ticket statistics |
| GET | `/api/tickets/{ticket_id}` | Get ticket details with notes |
| PUT | `/api/tickets/{ticket_id}` | Update ticket (status, priority, add note) |
| DELETE | `/api/tickets/{ticket_id}` | Delete ticket and all associated notes |

### Query Parameters (GET /api/tickets)
- `search` - Search across customer name, email, subject, description, ticket ID
- `status` - Filter by status (Open, In Progress, Closed)
- `priority` - Filter by priority (Low, Medium, High, Urgent)
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

### Example Requests
```bash
# Create ticket
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"John Doe","customer_email":"john@example.com","subject":"Issue","description":"Details","priority":"High"}'

# List tickets with search and filter
curl "http://localhost:8000/api/tickets?status=Open&search=john&page=1&page_size=20"

# Get ticket details
curl http://localhost:8000/api/tickets/TKT-000001

# Update ticket
curl -X PUT http://localhost:8000/api/tickets/TKT-000001 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress","priority":"High","note":"Started working on this"}'

# Delete ticket
curl -X DELETE http://localhost:8000/api/tickets/TKT-000001
```

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+ (or Docker)

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
alembic upgrade head

# Seed database with demo data
python seed.py

# Start development server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with VITE_API_BASE_URL if different from default

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

### Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

Services:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/datastraw_crm
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
ENVIRONMENT=development
API_PREFIX=/api
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Testing

### Backend Tests
```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```

Tests cover:
- Ticket creation (valid/invalid)
- Listing tickets
- Search functionality
- Status filtering
- Ticket detail retrieval
- Status updates
- Note addition
- Ticket deletion
- Notes cascade deletion
- 404 handling
- Validation errors

### Frontend Checks
```bash
cd frontend
npm run build   # TypeScript compilation + Vite build
npm run lint    # ESLint checks
```

## Deployment

### Backend (Railway/Render)
1. Connect repository
2. Set environment variables:
   - `DATABASE_URL` (Supabase/PostgreSQL connection string)
   - `CORS_ORIGINS` (your frontend URL)
   - `ENVIRONMENT=production`
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Run migrations: `alembic upgrade head` (can be a release command)
6. Seed database: `python seed.py` (run once)

### Frontend (Vercel)
1. Import repository
2. Set framework preset: Vite
3. Set environment variable:
   - `VITE_API_BASE_URL` = your backend URL (e.g., `https://your-app.railway.app`)
4. Deploy

### Database (Supabase)
1. Create new Supabase project
2. Get connection string from Settings → Database
3. Use in `DATABASE_URL` (format: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`)
4. Run migrations and seed

## Engineering Decisions

### Database
- **SQLAlchemy 2.0** with declarative models for type safety
- **Alembic** migrations for schema versioning
- **Indexes** on frequently queried columns (ticket_id, customer_email, status, created_at)
- **Cascade delete** on notes when ticket is deleted
- **UTC timestamps** throughout

### API Design
- **RESTful** endpoints with proper HTTP status codes
- **Pydantic schemas** for request/response validation
- **Partial updates** on PUT endpoint (only provided fields updated)
- **Centralized error handling** with user-friendly messages
- **CORS** configured for development and production origins

### Frontend Architecture
- **Centralized API client** with Axios interceptors
- **Custom hooks** for data fetching (useTickets, useTicketDetail, useTicketStats)
- **Debounced search** (350ms) to reduce API calls
- **Component composition** with reusable UI components
- **TypeScript** for type safety across API boundaries

### Code Quality
- **Modular structure** with clear separation of concerns
- **Consistent naming** conventions
- **No hardcoded secrets** - all config via environment variables
- **Proper .gitignore** excluding sensitive files
- **Error boundaries** and user-friendly error states

## Challenges Solved

1. **Ticket ID Generation**: Implemented atomic backend-side generation using regex parsing of last ticket to ensure uniqueness without race conditions.

2. **Search Performance**: Added database indexes and implemented backend search with ILIKE across multiple columns, combined with frontend debouncing.

3. **Partial Updates**: Designed PUT endpoint to accept optional fields, allowing status, priority, and note updates independently or together.

4. **Responsive Tables**: Used CSS overflow for desktop tables and would adapt to card layout on mobile (implemented via responsive Tailwind classes).

5. **Type Safety**: Shared TypeScript types between frontend and backend via Pydantic models, ensuring API contract consistency.

6. **Empty/Error States**: Comprehensive handling for no data, network errors, 404s, and validation failures with retry mechanisms.

## Future Improvements

With more time, I would add:
- **Authentication & Authorization** (JWT-based with role-based access)
- **Email notifications** for ticket updates
- **File attachments** on tickets and notes
- **SLA tracking** with response/resolution time metrics
- **Tags/Categories** for better ticket organization
- **Rich text editor** for descriptions and notes
- **Keyboard shortcuts** for power users
- **Audit log** for all ticket changes
- **Webhook support** for integrations
- **Automated ticket assignment** based on workload
- **Customer portal** for self-service ticket viewing

## License

This project was created for the Datastraw AI + Tech Intern Assessment.