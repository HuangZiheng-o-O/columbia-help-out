# Project Constraints (Frontend & Backend)

## Data & API
- Frontend must fetch all task data from the backend; no in-browser mock data. Active service: HTTP `taskService` pointing to `VITE_API_BASE` (fallback `http://localhost:4000`).
- Backend uses MySQL schema from `backend/taskall.sql`; seed data from `backend/dataall.sql` for realistic published/claimed/completed/cancelled tasks across multiple users.
- Task listing must respect scope filters: `published` requires `ownerUid`, `claimed` requires `claimedByUid`; client also double-filters to avoid mixed results.

## Permissions & Actions
- My Claimed Tasks: user cannot mark completed (publisher-only). Withdraw is allowed unless task is already completed/cancelled.
- My Published Tasks: if task is claimed by someone else, publisher cannot withdraw; show a prompt and block the action. Withdraw/Complete buttons disable when already completed/cancelled.
- Disabled action buttons must render gray with reduced opacity and a line-through.
- Claim/complete flow: claimer may assert “Mark as Done”, but the publisher must finalize by “Mark Completed” in My Published Tasks. Claimer cannot close the task.

## Detail Views (Discover vs. Manage)
- Discover (home) detail view shows “Ask First/Copy Email” with clipboard copy + toast.
- Task List / Manage detail views split into:
  - Plaza detail (viewing others’ tasks) → Copy Email + Claim, back to “Task Plaza”.
  - My Published detail → Mark Completed / Withdraw, back to “Task List”.
  - My Claimed detail → Copy Email / Mark as Done / Withdraw, back to “Task List”.
- Manage detail/settlement always return to Task List and keep sidebar on “My tasks”. If the task isn't cached, fetch by id before rendering detail.
- View detail from Manage routes to settlement when status is completed; otherwise to the appropriate detail view.

## UI/UX Layout & Scroll
- Sidebar is fixed on the left; on narrow screens it collapses to icons only. Only the main content scrolls; `html/body` overflow is hidden to prevent sidebar scroll.
- Task List (My Tasks) layout matches home width (up to ~1120px) and scrolls within the main pane, not as a centered card grid.
- Sort bar includes “Sort by:” label with icon and three options (newest/nearest/credits).
- Task cards and detail pages show category tags, urgency, and tags chips consistently.

## Buttons & States
- `.btn-row` disabled: gray, no shadow, not-allowed cursor, line-through text.
- Primary/Success/Warning variants retain disabled gray styling.

## Pending / Out of Scope
- Profile/Account creation page is deferred (documented but not implemented).

