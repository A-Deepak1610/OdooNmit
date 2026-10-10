# Hackathon Starter: Production-Grade Modular Monolith

A high-velocity, production-oriented full-stack starter template optimized for 24-hour hackathons with a 4-developer team.

---

## 1. System Architecture

```
                    ┌─────────────────────────┐
                    │    React + Vite Client  │
                    │       (TypeScript)      │
                    └────────────┬────────────┘
                                 │ HTTP (REST + Axios)
                                 ▼
                    ┌─────────────────────────┐
                    │   Express.js API Server │
                    │      (Node.js ESM)      │
                    └────────────┬────────────┘
                                 │ Prisma Client (MySQL Protocol)
                                 ▼
                    ┌─────────────────────────┐
                    │       TiDB Cloud        │
                    │   Serverless Database   │
                    └─────────────────────────┘
```

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router 6, Axios, Lucide React.
- **Backend:** Node.js 20+ (ES Modules), Express.js, Prisma ORM 5.x, TiDB (MySQL compatible).
- **Architecture:** Modular Monolith with strictly separated concerns and isolated feature-folder conventions.

---

## 2. Directory Layout & Feature Module Conventions

### Root Structure

```
ODOONMIT/
├── .env.example             # Shared environment template
├── .gitignore               # Ignored dependencies & build artifacts
├── AGENTS.md                # Mandatory rules for AI agents & developers
├── README.md                # System documentation & quickstart
├── package.json             # Root monorepo orchestration scripts
├── backend/                 # Express + Prisma + TiDB backend
└── frontend/                # React + Vite + Tailwind frontend
```

### Adding New Features (Post-Problem Statement)

When the hackathon problem statement is announced, developers create features in isolated directories to prevent merge conflicts:

#### Frontend Feature Convention
```
frontend/src/modules/<feature-name>/
├── pages/                   # Route page components (e.g. OrdersPage.tsx)
├── components/              # Feature-specific UI components
├── services/                # API calls using the shared `apiClient`
├── types/                   # TypeScript interfaces
└── hooks/                   # Custom React hooks
```

#### Backend Feature Convention
```
backend/src/modules/<feature-name>/
├── <feature-name>.routes.js       # Express router
├── <feature-name>.controller.js   # Thin HTTP controller
├── <feature-name>.service.js      # Business logic
├── <feature-name>.repository.js   # Database queries via central Prisma client
└── <feature-name>.validation.js   # Input payload validation
```

---

## 3. Quick Start & Developer Commands

### Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher

### Installation

Install root, backend, and frontend dependencies in one command:
```bash
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Environment Configuration

1. Copy `.env.example` to `backend/.env` and `frontend/.env`:
   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env
   ```
2. In `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="mysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?sslaccept=strict"
   ```
3. In `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

### Running the Application Locally

#### Run Both Concurrently (Recommended)
From workspace root:
```bash
npm run dev
```
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

#### Run Individually
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## 4. Prisma & TiDB Workflow

TiDB uses a standard MySQL wire protocol.

```bash
# Regenerate Prisma Client types after modifying schema.prisma
npm run prisma:generate

# Push schema directly to TiDB (prototyping mode)
npm run prisma:push
```

TiDB Cloud Serverless requires TLS encryption. Ensure `?sslaccept=strict` or `?ssl={"rejectUnauthorized":true}` is attached to your connection string in `.env`.

---

## 5. Health API Endpoints

The starter template includes production-ready health monitoring endpoints:

| Endpoint | Method | Purpose | DB Required? |
| :--- | :--- | :--- | :--- |
| `/api/v1/health/live` | `GET` | Process liveness probe (returns 200) | No |
| `/api/v1/health/ready` | `GET` | Dependency readiness probe (verifies TiDB) | Yes (503 on failure) |
| `/api/v1/health` | `GET` | Comprehensive system health summary | Yes (reports degraded on failure) |

---

## 6. Testing & Build Verification

```bash
# Run backend test suite (Vitest + Supertest)
npm run test:backend

# Build frontend production bundle
npm run build:frontend
```

---

## 7. How 4 Developers Should Coordinate Work

1. **Pair 1 (Developer A & B):** Feature 1 (e.g., Core submission flow)
   - Dev A implements backend module in `backend/src/modules/feature1/`
   - Dev B implements frontend module in `frontend/src/modules/feature1/`
2. **Pair 2 (Developer C & D):** Feature 2 (e.g., Evaluation/Review flow)
   - Dev C implements backend module in `backend/src/modules/feature2/`
   - Dev D implements frontend module in `frontend/src/modules/feature2/`
3. **Shared Navigation:**
   - Add new page links to `frontend/src/config/navigation.ts`. The shared `AppSidebar` automatically handles rendering and role filtering.
4. **Shared API Client:**
   - All modules use `import { apiClient } from '@/services/api-client'`. Never create ad-hoc Axios instances.
5. **Database Migration Coordination:**
   - Coordinate adding models in `backend/prisma/schema.prisma` before pushing to the shared database.
