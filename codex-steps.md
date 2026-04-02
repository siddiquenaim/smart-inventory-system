## Smart Inventory Completion Plan (Strict Small-Step Gates)

### Summary

We’ll implement requirements 4–8 in **small, sequential steps**.  
Rule: **no next step starts until the current step passes its gate** (API behavior, UI behavior, and regression checks).  
Decisions locked from your inputs:

- Completed orders = **Delivered only**
- Restock priority = **stock-ratio based**
- Restock queue tie-breaker = **oldest first**

### Implementation Steps (with hard gates)

1. **Step 4.1: Stock deduction + insufficient stock enforcement hardening**

- Backend: ensure order create/update paths always re-check live stock in transaction.
- Error contract: return exact warning pattern `Only X items available in stock`.
- Gate to pass:

1. Stock always deducts on successful order.
2. Insufficient stock blocks confirmation with correct warning.
3. If stock becomes 0, product status becomes `out_of_stock`.

4. **Step 6.1: Conflict detection hardening in order flows**

- Enforce on backend (not only UI):
- Reject duplicate product lines in same order with `This product is already added to the order.`
- Reject unavailable products (`out_of_stock`) with `This product is currently unavailable.`
- Apply to both order creation and any future order-item updates.
- Gate to pass:

1. Duplicate lines blocked consistently.
2. Out-of-stock product cannot be ordered even if request is crafted manually.

3. **Step 5.1: Automatic restock queue population**

- Add queue sync logic whenever stock changes (order placement, cancel/restock/manual stock update).
- Rule: product enters queue when `stockQuantity < threshold`.
- Queue ordering: `stockQuantity ASC`, then `requestedAt ASC` (oldest first tie-breaker).
- Priority (stock ratio):
- `high`: stock = 0
- `medium`: stock > 0 and stock/threshold <= 0.5
- `low`: stock/threshold > 0.5 and still below threshold
- Gate to pass:

1. Queue entry auto-created/updated when below threshold.
2. No duplicate queue rows per product (upsert behavior).
3. Priority/ordering matches rules above.

4. **Step 5.2: Restock Queue APIs + page**

- Add API endpoints under existing Hono router:
- `GET /api/restock-queue`
- `PATCH /api/restock-queue/:id` (manual restock stock update + priority recalc)
- `DELETE /api/restock-queue/:id` (manual remove)
- Add `/restock-queue` page with table, priority badge, stock info, restock action, remove action.
- Gate to pass:

1. Queue visible and correctly sorted.
2. Restock updates product stock and removes item when no longer low stock.
3. Manual remove works and reflects instantly in UI.

4. **Step 8.1: Activity log pipeline**

- Add service helper for log writes and list reads.
- Log actions for:
- order created
- order status changed
- stock updated/restocked
- product moved to restock queue
- Add `GET /api/activity-logs?limit=10` and `/activity-logs` page.
- Gate to pass:

1. Latest 5–10 actions visible in reverse chronological order.
2. Messages follow required style (time + action + actor/entity).

3. **Step 7.1: Dashboard insights backend**

- Replace placeholders with real metrics query service:
- Total Orders Today
- Pending vs Completed (completed = delivered only)
- Low Stock Items Count
- Revenue Today (sum of today’s order totals; use delivered orders)
- Product summary list: name + stock + state (Low Stock/OK)
- Add endpoint: `GET /api/dashboard/insights`.
- Gate to pass:

1. Metrics match DB data for same day boundaries.
2. Pending/completed split matches locked definition.
3. Product summary correctly labels low-stock vs ok.

4. **Step 7.2: Dashboard UI replacement**

- Wire dashboard cards and summary list to real API.
- Keep loading/empty/error states deterministic.
- Gate to pass:

1. No placeholder metrics remain.
2. Metrics update after order/stock operations.
3. Summary examples match required format semantics.

4. **Step 9 (stabilization before optional bonus)**

- End-to-end regression pass for auth + categories + products + orders + restock + dashboard + logs.
- Gate to pass:

1. All mandatory requirements 1–8 satisfied in one flow.
2. No route-level 404s from sidebar entries.
3. Clear error messages for all guarded actions.

### Public API / Interface Additions

- New APIs:
- `GET /api/restock-queue`
- `PATCH /api/restock-queue/:id`
- `DELETE /api/restock-queue/:id`
- `GET /api/activity-logs?limit=`
- `GET /api/dashboard/insights`
- Error message contracts (user-visible, stable):
- `Only X items available in stock`
- `This product is already added to the order.`
- `This product is currently unavailable.`

### Test Plan (required before each gate sign-off)

- **Stock handling:** exact deduction, insufficient stock rejection, zero-stock status transition.
- **Conflict detection:** duplicate line rejection, out-of-stock rejection via API-level tests.
- **Restock queue:** auto insert/update/remove, priority mapping correctness, deterministic sorting.
- **Dashboard:** today filters, pending/completed math, revenue correctness.
- **Activity logs:** required actions logged and ordered latest-first.
- **Integration flow:** create product/category -> create order -> low stock queue -> restock -> queue clear -> dashboard/log updates.

### Assumptions (locked)

- “Completed” means **Delivered** only.
- Restock priority uses **stock ratio** thresholds defined above.
- Queue tie-breaker for same stock is **oldest first** (`requestedAt ASC`).
- Optional bonus items (search/filter expansion, pagination, analytics chart, role-based access) start only after all mandatory gates pass.
