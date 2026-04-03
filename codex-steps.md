## Smart Inventory Completion Plan

Rule: do one step at a time and do not move forward until the current step is correct.

### Step Status

1. `[DONE]` Step 4.1: Stock deduction + insufficient stock enforcement hardening
2. `[DONE]` Step 6.1: Conflict detection hardening in order flows
3. `[DONE]` Step 5.1: Automatic restock queue population
4. `[DONE]` Step 5.2: Restock Queue APIs + page
5. `[DONE]` Step 8.1: Activity log pipeline
6. `[DONE]` Step 7.1: Dashboard insights backend
7. `[DONE]` Step 7.2: Dashboard UI replacement
8. `[DONE]` Step 9: Stabilization and regression pass

### Locked Rules

- Completed orders = `delivered` only
- Restock priority = stock-ratio based
- Restock queue tie-breaker = oldest first

### Step Details

#### Step 4.1: Stock deduction + insufficient stock enforcement hardening

- Ensure successful order creation deducts stock automatically.
- If requested quantity exceeds stock, show `Only X items available in stock`.
- If stock becomes `0`, product status becomes `out_of_stock`.

#### Step 6.1: Conflict detection hardening in order flows

- Reject duplicate product lines with `This product is already added to the order.`
- Reject unavailable products with `This product is currently unavailable.`
- Enforce at both UI and API level.

#### Step 5.1: Automatic restock queue population

- Add queue sync whenever stock changes.
- If `stockQuantity < threshold`, add or update the restock queue entry.
- Sort queue by lowest stock first, then oldest request first.
- Priority rules:
- `high`: stock = 0
- `medium`: stock ratio <= 0.5
- `low`: still below threshold, but stock ratio > 0.5

#### Step 5.2: Restock Queue APIs + page

- Add:
- `GET /api/restock-queue`
- `PATCH /api/restock-queue/:id`
- `DELETE /api/restock-queue/:id`
- Add `/restock-queue` page with restock and remove actions.

#### Step 8.1: Activity log pipeline

- Log:
- order created
- order status changed
- stock updated/restocked
- product added to restock queue
- Add `GET /api/activity-logs?limit=10`
- Add `/activity-logs` page

#### Step 7.1: Dashboard insights backend

- Add real metrics:
- Total Orders Today
- Pending vs Completed
- Low Stock Items Count
- Revenue Today
- Product summary list
- Add `GET /api/dashboard/insights`

#### Step 7.2: Dashboard UI replacement

- Replace placeholder dashboard cards and lists with live data.

#### Step 9: Stabilization and regression pass

- Validate requirements 1 to 8 together.
- Verify no broken routes or missing pages from the sidebar.
- Verify guarded actions show clear errors.
