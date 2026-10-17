# Engineering Decisions & Architectural Trade-offs
**Challenge:** Operations Under Pressure — Newtonite Engineering Assessment  
**Document:** `ENGINEERING_DECISIONS.md`

This document details the five critical architectural and engineering decisions made during the design and implementation of the Newtonite Operations Platform, explicitly discussing the trade-offs involved.

---

### Decision 1: Optimistic Concurrency Control (OCC) with Explicit Conflict Diffing
* **Context**: In an organization of hundreds of employees, multiple operators frequently view and update the same incident simultaneously. Traditional "last-write-wins" silently obliterates critical investigation notes or status updates.
* **Chosen Approach**: Every work item entity carries an integer `version` field (monotonically increasing revision counter). Any mutation request must supply `expectedVersion`. If `expectedVersion !== serverVersion`, the server aborts the transaction with HTTP `409 Conflict`. On the frontend, instead of a generic error message, the user is presented with a **side-by-side visual diff** showing their local draft alongside the newly committed server state, allowing the operator to either rebase or explicitly force an overwrite with a logged justification.
* **Trade-off**: 
  - *Pro*: Complete protection against data loss and phantom updates without database lock contention.
  - *Con*: Requires the UI to maintain both local draft state and remote snapshot state, increasing frontend state management complexity.

---

### Decision 2: Mutex Leases for Incident Claiming ("Race Condition Safeguard")
* **Context**: During high-severity outages (P0), multiple on-call engineers attempt to "take responsibility" simultaneously. Without protection, two people begin separate investigations without realizing someone else took it.
* **Chosen Approach**: Work item ownership acquisition is governed by an atomic compare-and-swap (CAS) operation. When a claim request arrives, the backend checks whether `assigneeId === null`. If already claimed by another user, the server rejects subsequent claims with an ownership conflict response, and client-side listeners broadcast the winning assignee within milliseconds.
* **Trade-off**:
  - *Pro*: Prevents split-brain triage and duplicate communication with executive leadership or customers.
  - *Con*: Requires an explicit "handover" or "reassignment" workflow if the original claimant becomes unresponsive.

---

### Decision 3: Client-Generated Idempotency Keys for Duplicate Suppression
* **Context**: Flaky network connections, latency spikes, or hurried double-clicking by stressed operators can trigger duplicate mutations (e.g., duplicated refund scripts or duplicate status changes).
* **Chosen Approach**: Every state-altering action generates an `Idempotency-Key` (UUIDv4) stored in an in-memory/Redis LRU set for 120 seconds. If an identical key is received while processing or after completion, the system returns the cached outcome rather than creating duplicated audit logs or repeating side effects.
* **Trade-off**:
  - *Pro*: Guarantees at-most-once execution semantics under pressure.
  - *Con*: Requires client orchestration to persist idempotency keys across transient retries.

---

### Decision 4: System-Enforced Role-Based Access Control (RBAC) & Approval Gates
* **Context**: The candidate brief requires: *"Authorization must be enforced by the system itself and should not rely only on hiding controls in the user interface."*
* **Chosen Approach**: Sensitive operations (e.g., approving payout reversals, GDPR data erasure scripts, changing P0 priority levels) are protected by a state-machine gate. Even if a user bypasses UI elements (e.g., executing raw HTTP mutations), the business logic layer verifies the actor's role against permissions (`ADMIN`, `TEAM_LEAD`, `COMPLIANCE_OFFICER`). Unauthorized attempts immediately record an `UNAUTHORIZED_ATTEMPT` event in the audit trail.
* **Trade-off**:
  - *Pro*: Zero trust architecture; security is completely decoupled from the presentation layer.
  - *Con*: Role boundaries must be carefully calibrated to avoid operational deadlocks during emergency off-hours.

---

### Decision 5: Synchronous State Transitions vs. Asynchronous Secondary Side Effects
* **Context**: Operations items require numerous secondary tasks (sending Slack webhooks, dispatching PagerDuty alerts, indexing search documents, archiving compliance logs).
* **Chosen Approach**: The database transaction boundary is strictly limited to the core work item mutation and audit ledger insertion (synchronous). Secondary tasks (telemetry, outbound webhook alerts, search re-indexing) are decoupled and dispatched asynchronously via an event emitter / worker queue.
* **Trade-off**:
  - *Pro*: Sub-15ms response times for operators under stress; external webhook failures cannot block ticket resolution.
  - *Con*: Eventual consistency for downstream notification feeds, requiring retry queues and dead-letter handling.

---

### What Was Intentionally Not Built (Scope Discipline)
1. **Full Video/Voice Bridge Integration**: During an incident, voice bridges are best handled by existing tools (Zoom, Slack Huddle); embedding custom video calling inside the work tracker adds unnecessary latency and maintenance overhead.
2. **Complex Drag-and-Drop Kanban Boards**: Freeform drag-and-drop boards encourage chaotic ad-hoc status shifting. For critical operations, an explicit state machine with required transition justifications provides superior auditability and compliance guarantees.
