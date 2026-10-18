# Newtonite Operations Control/Coordination Platform (Ops Hub)
> **Full-Stack Production Engineering Assessment — Operations Under Pressure**  
> *A high-reliability coordination platform designed for multi-team operational environments under pressure.*  
> Evaluator Zero-Setup Ready: Runs instantly with integrated Express backend and in-memory fallback.

---

## 🚀 Live Demo & Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v22/v24)
- **npm**

### 2. Run the Full Stack Application (Recommended)
You can start both backend and frontend concurrently:

```bash
# Clone the repository
git clone https://github.com/abhinav050504/OPS-PLATFORM.git
cd OPS-PLATFORM

# 1. Install dependencies
npm install
npm --prefix backend install

# 2. Start the Backend API (runs Express on port 3000)
npm run backend

# 3. In a second terminal, start the Frontend (runs Vite on port 5173)
npm run dev
```

Open **`http://localhost:5173`** in your browser.  
Notice the **`Backend API: Live (Port 3000)`** indicator pill in the header confirming real-time HTTP connectivity!

*(Note: The platform features a zero-dependency dual-mode database engine. If a local PostgreSQL instance is running on port 5432, it will connect to it; if not, it automatically boots with a high-fidelity in-memory seed store so evaluators don't need Docker or Postgres to test every capability).*

### 3. Run Automated Backend Tests
```bash
npm run test:backend
```
Executes 9 automated Vitest tests covering:
- `GET /health` service availability
- `POST /work-items` item creation and validation
- `PATCH /work-items/:id` Optimistic Concurrency Control (OCC 409 stale revision rejection)
- `POST /work-items/:id/claim` Atomic ownership mutex (Claim collision rejection)
- `Idempotency-Key` deduplication on duplicate requests
- RBAC authorization gates for operational approvals

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🎯 What This System Solves

In growing companies, operations fracture across Slack threads, spreadsheets, and emails. Work items get lost, ownership is ambiguous, and conflicting edits cause silent data loss.

This platform provides:
1. **Immediate Context**: Explains *what* the item is and *why* it exists (root cause, affected systems, impact).
2. **Current State & Urgency**: High-contrast Priority pills (`P0 Critical`, `P1 High`) and Lifecycle states.
3. **Explicit Responsibility**: Single-click ownership lease with built-in race-condition safeguards.
4. **Actionable Directive**: A dedicated **"What Requires Attention Next"** callout on every ticket.
5. **Immutable Audit Ledger**: Full history of actor identity, state transitions, reasons, and decisions.
6. **System-Enforced Authorization (RBAC)**: Operational approval gates for legal, compliance, and payout reversals that cannot be bypassed simply by manipulating UI elements.
7. **Spacious Dedicated Navigation**: 5 distinct pages (`Queue`, `Detail`, `Approvals`, `Concurrency Lab`, `Audit Log`) with clean light/white enterprise styling.

---

## ⚡ How to Test Critical Behaviors (Evaluator Walkthrough)

To verify the non-trivial distributed behaviors requested in the candidate brief, switch to the **Concurrency Lab** tab or use the simulation triggers:

### 1. Optimistic Concurrency Control (HTTP 409 Conflict)
- Go to the **Concurrency Lab** tab.
- Click **`1. Trigger Remote Conflict`**. (Simulates a teammate in another region updating ticket `OPS-4029` on the server).
- Switch to the **Detail** or **Queue** tab and attempt to change the status or priority of `OPS-4029`.
- **Observed Behavior**: The API or local engine detects a version mismatch (`v4` expected, `v5` found), rejects the silent overwrite with HTTP 409 `VERSION_CONFLICT`, and opens the **Concurrency Conflict Modal** with a side-by-side diff comparing your draft against the committed server state. You can either accept the server state or force an overwrite with a logged audit entry.

### 2. Ownership Race Condition ("Claim War")
- Go to the **Concurrency Lab** tab.
- Click **`2. Simulate Ownership Race War`**.
- **Observed Behavior**: Simulates another responder acquiring the mutex lease 8ms earlier. An alert banner notifies you that another teammate just claimed it, preventing duplicate investigation work.

### 3. Idempotent Deduplication (Rapid Double-Clicks)
- In the **Concurrency Lab** tab, click **`3. Test Rapid Double-Click (Idempotency)`**.
- **Observed Behavior**: Two identical mutations with the same client `Idempotency-Key` are fired within 200ms. The second request is suppressed and returns the cached outcome, preventing duplicate audit logs.

### 4. RBAC & Operational Sign-off Gate
- Switch the active user persona in the top navigation between **Elena Rostova (Compliance Officer)**, **David Kim (Admin)**, and **Marcus Vance (Operations Engineer)**.
- Visit the **Approvals** page or open `OPS-4028` (GDPR Data Purge).
- Notice that non-privileged roles (like standard Operations Engineer) receive an immediate authorization rejection, while Leads, Admins, and Compliance Officers can record formal signatures.

---

## 📂 Project Architecture

```
newtonite-ops-platform/
├── backend/                           # Express + TypeScript REST API
│   ├── src/
│   │   ├── app.ts                     # Express server & route registration
│   │   ├── db.ts                      # Dual-engine database (Postgres + In-Memory fallback)
│   │   ├── modules/
│   │   │   ├── auth/                  # JWT auth & user verification middleware
│   │   │   ├── authz/                 # RBAC permission checks & unit tests
│   │   │   └── workItems/             # Schemas, service, routes, OCC & concurrency tests
│   │   └── shared/
│   │       ├── errors.ts              # Standardized API error hierarchy
│   │       ├── idempotency.ts         # Mutation deduplication middleware
│   │       └── validate.ts            # Zod validation middleware
│   ├── package.json                   # Backend dependencies & test scripts
│   └── tsconfig.json
├── src/                               # React + Vite Frontend (White Theme)
│   ├── api/
│   │   └── backendClient.ts           # Type-safe API client & backend health monitor
│   ├── components/
│   │   ├── Header.tsx                 # Brand, backend health pill, team filter, RBAC persona
│   │   ├── NavigationTabs.tsx         # 5 dedicated page tabs
│   │   ├── WorkItemList.tsx           # High-density operational queue
│   │   ├── WorkItemDetail.tsx         # Detailed inspection, next actions, audit trail
│   │   ├── ConcurrencyConflictModal.tsx # Side-by-side version diff & reconciliation
│   │   ├── CreateWorkItemModal.tsx    # Creation flow with incident templates
│   │   └── ToastContainer.tsx         # Distributed event notifications
│   ├── context/
│   │   └── OpsContext.tsx             # Global state, backend client sync, OCC fallback
│   ├── mock/
│   │   └── initialData.ts             # Realistic operations seed data (incidents, payments, GDPR)
│   ├── types/
│   │   └── ops.ts                     # TypeScript data contracts & audit event definitions
│   ├── App.tsx                        # Master multi-page routing assembly
│   └── index.css                      # Clean enterprise white theme styling
├── package.json                       # Fullstack root scripts (dev, backend, test:backend, build)
├── ENGINEERING_DECISIONS.md           # 5 Key architectural decisions & trade-offs
├── UI_UX_DESIGN.md                    # In-depth UX philosophy & design system spec
└── DEVLOG.md                          # Engineering log & progression roadmap
```
