# Skyline Student Association — Student Organization System

[![CI Pipeline](https://github.com/A-Deepak1610/OdooNmit/actions/workflows/ci.yaml/badge.svg)](https://github.com/A-Deepak1610/OdooNmit/actions)
![Node Version](https://img.shields.io/badge/Node.js-v20.x-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)
![TiDB](https://img.shields.io/badge/Database-TiDB%20Serverless%20(MySQL)-FF4500?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

> **A unified digital platform to manage campus events, memberships, ticketing, merchandise, volunteers, and finances in one place.**  
> Built as a production-oriented modular monolith for the 24-hour Odoo Hackathon.

---

## 1. Project Overview & Core Features

The **Skyline Student Association** platform replaces fragmented spreadsheets, cash-at-the-door ticketing, paper receipt tracking, and noisy WhatsApp groups with an integrated operating system:

- **Student Memberships & Dues:** Self-service registration, digital membership ID cards, automated dues ledger, expiration tracking, and member-exclusive discount validation.
- **Events & Ticketing:** Tiered pricing for members vs. guests, real-time ticket capacities, millisecond QR-code ticket check-ins, and post-event attendance/revenue metrics.
- **Razorpay Payments:** Cryptographically secured checkout for event ticketing and merchandise sales with timing-safe HMAC SHA-256 signature verification.
- **Announcements Board:** Centralized bulletin board with tagged notices (Meetings, Urgent, Social) and an auditable historical broadcast record.
- **Merchandise & Inventory:** Digital campus store with real-time size & variant inventory matrix (`S` through `XXL`), online checkout, and order fulfillment states.
- **Fundraisers & Task Board:** Kanban-style task coordinator for volunteer events (bake sales, galas) with assignees, deadlines, and budget tracking.
- **Treasury, Expenses & Ledger:** Automated financial aggregation of dues, tickets, and merchandise revenue alongside volunteer expense claims, receipt image tracking, and semester balance sheets.

---

## 2. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router 6, Axios, Lucide React icons.
- **Backend:** Node.js 20+ (native ES modules), Express.js, Prisma ORM 5.x, Razorpay SDK.
- **Database:** TiDB Cloud Serverless (MySQL 8.0 wire-compatible interface with TLS encryption).
- **Testing:** Vitest, Supertest.
- **CI/CD:** GitHub Actions (automated dependency caching, test validation, and build verification).
- **Deployment:** Render (automated Git-based deployments for the backend).

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Client (React 18 + Vite + TS)                      │
│   Tailwind Design System • Zustand Stores • Lucide React Icons         │
│   Shared Responsive Layout • Central AppSidebar (Role-Filtered)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON REST API / Axios
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Backend API Server (Node.js ESM)                     │
│   Express Gateway • Request ID UUID • CORS • Safe AppError Handler     │
│   Authentication & RBAC Middleware • Input Validation • Razorpay HMAC   │
├────────────────┬────────────────┬─────────────────┬────────────────────┤
│ Health Module  │ Members & Dues │ Events & Tickets│ Merch & Store      │
│ Announcements  │ Projects/Tasks │ Expense Claims  │ Financial Ledger   │
└────────────────┴────────┬───────┴─────────────────┴────────────────────┘
                          │ Parameterized MySQL Protocol
                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Prisma ORM 5.x  ──►  TiDB Cloud Serverless               │
│      Relational Schema • ACID Transactions • Encrypted TLS MySQL       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Repository Structure

The project uses a clean modular structure with two coordinated application roots:

```
OdooNmit/
├── .github/
│   ├── workflows/
│   │   └── ci.yaml              # Automated GitHub Actions CI workflow
│   └── pull_request_template.md # PR quality checklist
├── backend/                     # Express API Server
│   ├── prisma/
│   │   └── schema.prisma        # TiDB Prisma relational data schema
│   ├── src/
│   │   ├── config/              # env.js, database.js (Prisma singleton)
│   │   ├── middleware/          # auth, validate, request-id, error handler
│   │   ├── modules/             # health/ and business feature modules
│   │   ├── utils/               # app-error, logger, payment verification
│   │   ├── app.js               # Express application route setup
│   │   └── server.js            # Server entrypoint and graceful shutdown
│   ├── tests/                   # Vitest + Supertest automated test suites
│   ├── .env.example             # Backend environment template
│   └── package.json             # Backend dependencies & scripts
├── frontend/                    # Vite + React Client
│   ├── src/
│   │   ├── app/                 # App.tsx, router.tsx
│   │   ├── components/          # shared/ (AppSidebar, AppHeader) and ui/
│   │   ├── config/              # navigation.ts (role-filtered sidebar routes)
│   │   ├── layouts/             # AppLayout.tsx, AuthLayout.tsx
│   │   ├── services/            # api-client.ts (central Axios instance)
│   │   └── stores/              # auth.store.ts, ui.store.ts
│   ├── .env.example             # Frontend environment template
│   └── package.json             # Frontend dependencies & scripts
├── .gitignore                   # Ignored artifacts, logs, and environments
└── README.md                    # System documentation
```

---

## 5. Prerequisites

- **Node.js:** `v20.x` or higher
- **npm:** `v10.x` or higher
- **Database:** Free TiDB Cloud Serverless instance or local MySQL 8.0+

---

## 6. Local Installation & Startup

### Step 1: Clone Repository
```bash
git clone https://github.com/A-Deepak1610/OdooNmit.git
cd OdooNmit
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies reproducibly
npm install

# Configure environment variables
cp .env.example .env
```

Adjust your `backend/.env` with your database credentials:
```env
PORT=5000
NODE_ENV=development
APP_NAME=student-organization-system-backend
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict"
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="placeholder_secret"
```

Generate Prisma client types:
```bash
npm run prisma:generate
```

Start the backend server in watch mode:
```bash
npm run dev
# Server running on http://localhost:5000
```

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies reproducibly
npm install

# Configure environment variables
cp .env.example .env
```

Ensure `frontend/.env` points to your backend:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the Vite development server:
```bash
npm run dev
# Frontend running on http://localhost:3000
```

---

## 7. Database & Prisma Workflow

TiDB Cloud Serverless is 100% MySQL-compatible and requires TLS encryption.

```bash
cd backend

# Regenerate Prisma Client after modifying schema.prisma
npm run prisma:generate

# Synchronize schema directly to TiDB (prototyping mode)
npm run prisma:push
```

> **Note:** For TiDB Cloud Serverless, ensure `?sslaccept=strict` is appended to your connection string.

---

## 8. Testing & Quality Verification

Automated tests are implemented using **Vitest** and **Supertest** with mocked database calls to ensure zero dependency on live external connections:

```bash
# Run backend test suite
cd backend
npm test

# Run backend tests in watch mode during development
cd backend
npm run test:watch

# Verify frontend TypeScript types and production build
cd frontend
npm run build
```

### Existing Automated Test Suites:
- `backend/tests/health.test.js`: Validates `/live`, `/ready`, `/health` probes and 404 handler.
- `backend/tests/auth.test.js`: Validates Bearer authentication and role-based access control (RBAC).
- `backend/tests/payment.test.js`: Validates cryptographic HMAC SHA-256 Razorpay payment and webhook signatures.
- `backend/tests/validation.test.js`: Validates request body and query parameter validation schemas.
- `backend/tests/app.test.js`: Validates Express base routes, healthz, and `x-request-id` propagation.

---

## 9. CI/CD & Deployment

### GitHub Actions CI Workflow (`.github/workflows/ci.yaml`)
Automated continuous integration runs on every push and pull request targeting `main` and `master`:
- **Backend CI:** Installs dependencies (`npm ci`), generates the Prisma Client, and executes all Vitest test suites.
- **Frontend CI:** Installs dependencies (`npm ci`) and executes strict TypeScript typechecking and the Vite production build.
- **Safe Environment:** Uses safe mock credentials for CI steps without exposing secrets.
- **Concurrency Control:** Automatically cancels superseded runs to conserve resources.

### Live Deployment
- **Backend Hosting:** Deployed on **Render** with continuous deployment triggered on git push.
  - **Live Service URL:** [https://student-organization-system-odoo-nmit.onrender.com](https://student-organization-system-odoo-nmit.onrender.com)
  - **Health Probe:** [https://student-organization-system-odoo-nmit.onrender.com/healthz](https://student-organization-system-odoo-nmit.onrender.com/healthz)
- **Frontend Hosting:** Configured to consume the live Render backend via `VITE_API_URL`.

---

## 10. License

Distributed under the MIT License. Built with ❤️ by the Skyline Student Association Dev Team for the Odoo Hackathon.