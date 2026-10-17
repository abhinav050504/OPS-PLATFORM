# Newtonite Operations Platform — UI/UX Design Specification
**Challenge:** Operations Under Pressure — Newtonite Engineering Assessment  
**Author:** Candidate Brief Submission  
**Focus:** High-density, high-reliability operations coordination for multi-team distributed organizations.

---

## 1. Executive Summary & Design Philosophy

As a rapidly growing organization scales past several hundred employees, operational communication naturally fragments across Slack threads, spreadsheets, and emails. In high-pressure operational environments (incidents, payment disputes, compliance deadlines), the primary failure mode is **cognitive overload combined with ambiguous ownership**.

### Core UX Principles
1. **High Information Density Over Decorative Space**: Operational engineers and incident commanders require immediate visibility into context, SLA countdowns, and active collaborators without infinite scrolling.
2. **Next Action Prominence**: Every work item must prominently answer: *"What requires attention next?"*
3. **Explicit Concurrency & Conflict Surfacing**: Silent overwrites and stale edits cause catastrophic duplicate work. The UI transparently communicates when another user is modifying an item and provides side-by-side reconciliation when conflicts occur.
4. **Enforced State & Approval Gates**: Actions requiring legal, compliance, or management sign-offs are protected by system-enforced authorization gates rather than mere UI hiding.

---

## 2. Information Architecture (IA)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER: Brand • Live Telemetry • Team Switcher • RBAC Persona • [+ New] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CRITICAL BEHAVIOUR LAB: 1-Click Concurrency / Race / Idempotency Simulators    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ TRIAGE KPI METRICS: P0 Critical • Pending Approvals • Assigned to Me • Triage   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ FILTER & COMMAND BAR: Instant Search (ID, Title, Tag) • Status & Priority Filter│
├───────────────────────────────────────┬─────────────────────────────────────────┤
│ WORK ITEM QUEUE (5 Columns)           │ WORK ITEM DETAIL INSPECTION (7 Columns) │
│ - Urgent visual badges (P0, SLA)      │ - Active Viewer Presence Pill           │
│ - Instant "Next Action" preview       │ - "Immediate Attention Required" Callout│
│ - Single-click "Take Ownership"       │ - Operational Approval Gate             │
│ - Collaborator presence indicators    │ - Tabs: Context • Audit Trail • Decisions│
└───────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 3. Resolving the Core Challenge Requirements

| Requirement in Newtonite Brief | How the UI/UX Directly Solves It |
| :--- | :--- |
| **What the item is & why it exists** | Dedicated **Operational Context & Root Cause** section highlighting the original trigger (Slack escalation, PagerDuty alert, Zendesk ticket). |
| **Current state & importance** | High-contrast, standardized Priority Pills (`P0 Critical`, `P1 High`) and Lifecycle badges (`Triage`, `Investigating`, `Pending Approval`, `In Progress`, `Resolved`, `Blocked`). |
| **Who is responsible for it** | Prominent Assignee Pill with team affiliation and single-click **"Take Ownership"** mutex claim. |
| **What has happened previously** | Chronological **Audit Trail** displaying actor identity, timestamp, action type, diffs, and audit reasons. |
| **What requires attention next** | High-contrast amber **"Next Action Required"** highlight box on both the card preview and the inspection pane. |
| **Multi-team & Access Control** | Contextual Team Switcher (`Payments Engineering`, `Production Ops`, `Compliance & Legal`, etc.) paired with an interactive **RBAC Persona Switcher** to test permission boundaries. |

---

## 4. Concurrency & Conflict Resolution UX (HTTP 409)

When multiple operators attempt to update the same item simultaneously:
1. **Optimistic Version Verification**: Every mutation passes the client's cached revision number (`v4`).
2. **Conflict Interception**: If the server revision has advanced (`v5`), the write is blocked and the **Concurrency Conflict Resolution Modal** appears.
3. **Side-by-Side Diffing**:
   - **Left column**: Displays the client's intended modification.
   - **Right column**: Displays the committed server state and the teammate who made the change.
4. **Actionable Resolution Paths**:
   - *Option A (Default)*: **"Accept Server State"** — Pulls the latest state into the active view without data corruption.
   - *Option B*: **"Force Overwrite with Audit Note"** — Allows authorized leads to override, automatically logging a `CONFLICT_RESOLVED` event in the audit ledger.

---

## 5. Race Condition & Idempotency Safeguards

- **"Claim Wars" Prevention**: If User A and User B click "Take Ownership" concurrently, the first request acquires the lease. The second user receives an immediate visual toast: *"Marcus Vance locked this item 8ms earlier"*, preventing duplicated investigation effort.
- **Idempotency Deduplication**: Rapid double-clicks (or unstable mobile connections) carry a client-generated UUID idempotency key. Subsequent calls within the deduplication window are suppressed with an informative feedback toast: *"Idempotent Request Deduplicated"*.

---

## 6. Color System & Visual Hierarchy

- **Background**: Deep Slate (`#020617`, `#0f172a`) to minimize eye fatigue during extended incident response rotations.
- **P0 Critical Incidents**: Vibrant Rose Red (`#f43f5e`) with pulsing indicators.
- **Pending Approvals / Blocking Gates**: Warm Amber (`#f59e0b`).
- **Investigating / Active Work**: Electric Indigo (`#6366f1`) and Cyan (`#06b6d4`).
- **Resolved / Clean State**: Emerald Green (`#10b981`).

---

## 7. Interactive Evaluator Simulation Bar

To ensure Newtonite evaluators can verify all edge cases during their review, a dedicated **Critical Behaviour Lab** is embedded directly at the top of the interface:
- **Button 1**: *Trigger Remote Conflict* (Simulates remote server state modification).
- **Button 2**: *Simulate Ownership Race War* (Tests simultaneous claim collision).
- **Button 3**: *Test Rapid Double-Click* (Demonstrates idempotency key deduplication).
