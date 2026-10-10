# AGENTS.md — Mandatory Architectural Rules & Developer Conventions

> **Target Audience:** All AI Coding Agents and Human Developers working on this repository during the 24-hour hackathon.
> **Status:** Active & Strictly Enforced.

---

## 1. General Architecture & Scope Boundaries

1. **Modular Monolith Only:** The system consists of two coordinated roots: `frontend/` (React + TypeScript + Vite) and `backend/` (Node.js ESM + Express + Prisma + TiDB). **Do not introduce microservices, serverless functions, or secondary backends.**
2. **Zero Predefined Business Assumptions:** Do not invent data models, user roles, business entities (orders, bookings, products, inventory, finance), or fake business dashboards until the official hackathon problem statement is supplied.
3. **Inspect Before Editing:** Always inspect existing components, utilities, and endpoints before writing new code.
4. **Preserve Working Code:** Never discard working code, remove established infrastructure, or clobber uncommitted changes.

---

## 2. Modular Feature Conventions

When the problem statement is announced, implement every new feature in its isolated module directory:

### Frontend Feature Convention (`frontend/src/modules/<feature-name>/`)

```
frontend/src/modules/<feature-name>/
├── pages/             # Page-level route views (e.g., FeatureListPage.tsx)
├── components/        # Feature-specific components (e.g., FeatureCard.tsx)
├── services/          # Feature API service functions calling shared apiClient
├── types/             # Feature-specific TypeScript interfaces/types
└── hooks/             # Feature-specific React hooks (e.g., useFeature.ts)
```

### Backend Feature Convention (`backend/src/modules/<feature-name>/`)

```
backend/src/modules/<feature-name>/
├── <feature-name>.routes.js       # Express router definition
├── <feature-name>.controller.js   # Thin request/response controller
├── <feature-name>.service.js      # Core business logic
├── <feature-name>.repository.js   # Database queries via central Prisma client
└── <feature-name>.validation.js   # Request payload/param validation schemas
```

*Include these files only when their specific responsibilities are needed.*

---

## 3. Frontend Development Rules

1. **Language & Framework:** Strict TypeScript with React 18+ and Vite.
2. **Reuse Shared Infrastructure:**
   - Always use the shared layout: [AppLayout](file:///d:/OODO/ODOONMIT/frontend/src/layouts/AppLayout.tsx) for application views and [AuthLayout](file:///d:/OODO/ODOONMIT/frontend/src/layouts/AuthLayout.tsx) for public flows.
   - Reuse the centralized [AppSidebar](file:///d:/OODO/ODOONMIT/frontend/src/components/shared/AppSidebar.tsx) and [AppHeader](file:///d:/OODO/ODOONMIT/frontend/src/components/shared/AppHeader.tsx). Never create parallel sidebars for separate roles.
   - Register future navigation items exclusively in [config/navigation.ts](file:///d:/OODO/ODOONMIT/frontend/src/config/navigation.ts).
   - Use the centralized Axios instance in [services/api-client.ts](file:///d:/OODO/ODOONMIT/frontend/src/services/api-client.ts). Never instantiate new `axios.create()` instances in modules.
3. **Design Tokens & UI:**
   - Use predefined Tailwind design system tokens (`brand-*`, `surface-*`).
   - Use Lucide React icons.
   - Reuse base UI primitives: `Button`, `Card`, `Input`, `Badge`.
   - Every async or list page must gracefully handle states using `LoadingState`, `ErrorState`, and `EmptyState`.
4. **State Management:**
   - Use [auth.store.ts](file:///d:/OODO/ODOONMIT/frontend/src/stores/auth.store.ts) for authenticated user state (`user`, `role`, `status`).
   - Use [ui.store.ts](file:///d:/OODO/ODOONMIT/frontend/src/stores/ui.store.ts) for global UI preferences (e.g. sidebar collapsed).
   - Keep feature-specific state local to the component or inside a module-scoped hook.
5. **Security Realism:**
   - Client-side route guards (`RouteGuard`) are purely UX aids. **Frontend guards provide zero real security.**
   - All authorization and permissions MUST be validated independently by backend middlewares and services.

---

## 4. Backend Development Rules

1. **Language & Modules:** Standard Node.js with native ES modules (`"type": "module"`).
2. **Separation of Concerns:**
   - **Controllers:** Keep thin. Parse input, invoke service, return HTTP response with standard status codes.
   - **Services:** Contain pure business logic and orchestrate operations.
   - **Repositories / Prisma:** Database queries must use the centralized Prisma singleton via [database.js](file:///d:/OODO/ODOONMIT/backend/src/config/database.js).
   - **Validation:** Validate incoming request body, query params, and route parameters before reaching business logic.
3. **Database & TiDB Guidelines:**
   - TiDB is 100% MySQL-compatible. Define relational schemas in [prisma/schema.prisma](file:///d:/OODO/ODOONMIT/backend/prisma/schema.prisma).
   - Re-run `npm run prisma:generate` after modifying `schema.prisma`.
   - Never construct raw SQL strings by interpolating user inputs. Use parameterized queries or Prisma standard methods.
4. **Error Handling & Security:**
   - Always throw or pass instances of `AppError` (`utils/app-error.js`).
   - Never expose internal database stack traces, SQL syntax errors, or connection secrets to API clients.
   - Environment variables must be validated via [env.js](file:///d:/OODO/ODOONMIT/backend/src/config/env.js).
5. **Testing Requirement:**
   - Every newly created endpoint or service must have automated unit/integration tests in `backend/tests/`.
   - Mock external database calls in unit tests so tests can execute without requiring live database access.

---

## 5. Team Collaboration (4 Parallel Developers)

In a 24-hour hackathon, four developers will be building features simultaneously. To prevent blocking:

1. **API Contracts First:** Before writing code, pair frontend and backend developers on each feature to agree on endpoint URLs, HTTP methods, request payloads, and response JSON formats.
2. **Minimize Shared File Contention:**
   - Feature code belongs inside `modules/<feature-name>/`.
   - When registering routes, import the feature router in `app.js` or `router.tsx` in a single targeted commit.
   - When modifying `schema.prisma`, communicate model changes with the team before running `prisma db push`.
3. **Zero Duplication:** Check existing utilities (`cn`, `logger`, `asyncHandler`, `apiClient`, `Button`, `Card`, etc.) before creating duplicate helpers.
4. **Git Hygiene:**
   - Never reset shared branches or overwrite teammate commits.
   - Make small, focused commits per feature module.

---

## 6. Code Quality & Verification

1. **Verify Before Declaring Success:** Never claim tests pass or builds succeed without executing `npm test` or `npm run build`.
2. **No Placeholders or Dead Code:** Do not commit empty placeholder files or dummy console logs.
3. **Update Documentation:** If new environment variables or commands are added, immediately document them in `.env.example` and `README.md`.
