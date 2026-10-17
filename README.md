# Newtonite Operations Platform (Ops Hub)
> **One-Day Full-Stack Engineering Assessment — Operations Under Pressure**  
> *A high-reliability coordination platform designed for multi-team operational environments under pressure.*

---

## 🚀 Live Demo & Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.15)
- **npm** or **pnpm**

### 2. Installation & Run Locally
```bash
# Clone the repository
git clone https://github.com/abhinav050504/OPS-PLATFORM.git
cd newtonite-ops-platform

# Install dependencies
npm install

# Start the interactive development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Production Build
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

---

## ⚡ How to Test Critical Behaviors (Evaluator Walkthrough)

To verify the non-trivial distributed behaviors requested in the candidate brief, use the **Critical Behaviour Lab** bar located right beneath the header:

### 1. Optimistic Concurrency Control (HTTP 409 Conflict)
- Select ticket `OPS-4029`.
- Click **`1. Trigger Remote Conflict`** in the top bar. (This simulates another engineer in a different timezone resolving or modifying the ticket on the server).
- Now try changing the status or editing `OPS-4029`.
- **Observed Behavior**: The system detects a version mismatch (`v4` expected, `v5` found), rejects the silent overwrite, and opens the **Concurrency Conflict Modal** with a side-by-side diff comparing your draft against the committed server state. You can either accept the server state or force an overwrite with a logged audit entry.

### 2. Ownership Race Condition ("Claim War")
- Select ticket `OPS-4024` (Unassigned Triage).
- Click **`2. Simulate Ownership Race War`**.
- **Observed Behavior**: Simulates another responder acquiring the mutex lease 8ms earlier. An alert banner notifies you that another teammate just claimed it, preventing duplicate investigation work.

### 3. Idempotent Deduplication (Rapid Double-Clicks)
- Select any work item.
- Click **`3. Test Rapid Double-Click (Idempotency)`**.
- **Observed Behavior**: Two identical mutations with the same client `Idempotency-Key` are fired within 200ms. The second request is suppressed and returns the cached outcome, preventing duplicate audit logs.

### 4. RBAC & Operational Sign-off Gate
- Switch the active user in the top navigation between **Elena Rostova (Compliance Officer)**, **David Kim (Admin)**, and **Aisha Patel (Operations Engineer)**.
- Observe how operational approval buttons on `OPS-4028` (GDPR Data Purge) or `OPS-4029` (Payout Reversals) strictly enforce role authorization at the logic layer.

---

## 📂 Project Structure

```
newtonite-ops-platform/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # Brand, telemetry, team filter, RBAC persona switcher
│   │   ├── SimulationBar.tsx          # 1-click critical behavior evaluator lab
│   │   ├── StatsOverview.tsx          # At-a-glance KPI triage metrics
│   │   ├── FilterBar.tsx              # Search and multi-attribute filters
│   │   ├── WorkItemList.tsx           # High-density operational queue
│   │   ├── WorkItemDetail.tsx         # Detailed inspection, next actions, audit trail
│   │   ├── ConcurrencyConflictModal.tsx # Side-by-side version diff & reconciliation
│   │   ├── CreateWorkItemModal.tsx    # Creation flow with incident templates
│   │   └── ToastContainer.tsx         # Distributed event notifications
│   ├── context/
│   │   └── OpsContext.tsx             # State store, optimistic locking, RBAC, idempotency
│   ├── mock/
│   │   └── initialData.ts             # Realistic operations seed data (incidents, payments, GDPR)
│   ├── types/
│   │   └── ops.ts                     # TypeScript data contracts & audit event definitions
│   ├── App.tsx                        # Master layout assembly
│   ├── main.tsx                       # React DOM entry
│   └── index.css                      # Tailwind CSS v4 styling
├── ENGINEERING_DECISIONS.md           # 5 Key architectural decisions & trade-offs
├── UI_UX_DESIGN.md                    # In-depth UX philosophy & design system spec
└── README.md                          # Project documentation & run guide
```

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Build Tool**: Vite 8
- **State Management**: React Context with Optimistic Concurrency Control (OCC)

---

## 📄 Documentation Links
- [Engineering Decisions (`ENGINEERING_DECISIONS.md`)](./ENGINEERING_DECISIONS.md)
- [UI/UX Design Specification (`UI_UX_DESIGN.md`)](./UI_UX_DESIGN.md)
