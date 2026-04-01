# 🧠 CODEX WORKFLOW (STRICT MODE)

## 🔒 Global Rules (YOU MUST FOLLOW)

```txt
1. One Codex prompt = one task only
2. Never combine steps
3. After every step:
   - run app
   - test manually
   - check errors
4. Only then ask for next step
5. If something breaks → fix before moving
```

---

# 🧱 PHASE 1 — DATABASE FOUNDATION (CRITICAL)

## 🟢 STEP 1 — Full Database Schema

### 🎯 Goal

Replace test schema with real production schema.

### 📦 Codex Prompt

Create a complete Drizzle schema for a Smart Inventory System.

Tables:

- users
- categories
- products
- orders
- order_items
- restock_queue
- activity_logs

Requirements:

- Use PostgreSQL types
- Use enums for:
  - product status
  - order status
  - restock priority

- Add proper relations (foreign keys)
- Include timestamps
- Use UUID as primary keys
- Ensure type safety

Only modify:

- src/server/db/schema.ts

Do not touch any other files.

---

## 🟢 STEP 2 — Relations + Migration

### 🎯 Goal

Make schema usable.

### 📦 Codex Prompt

Add Drizzle relations for all tables in schema.

Ensure:

- users → orders
- categories → products
- orders → order_items
- products → order_items
- products → restock_queue

Then prepare schema for migration.

Only modify:

- src/server/db/schema.ts

Do not generate migrations manually.

---

### 🧪 After Step 2 (YOU do manually)

```bash
pnpm db:generate
pnpm db:push
```

If this fails → STOP and fix.

---

# 🔐 PHASE 2 — AUTH (REAL, NOT DEMO)

## 🟢 STEP 3 — DB-backed Auth

### 🎯 Goal

Replace demo login with real DB auth.

### 📦 Codex Prompt

Replace demo credentials auth with database-backed authentication.

Requirements:

- Use users table
- Validate email + password
- Hash passwords using bcrypt
- Return proper user session
- Keep NextAuth structure intact

Only modify:

- src/lib/auth.ts
- create helper in src/server/auth/

Do not touch UI yet.

---

## 🟢 STEP 4 — Signup API

### 🎯 Goal

Allow user creation.

### 📦 Codex Prompt

Create a signup API using Hono.

Requirements:

- POST /api/auth/signup
- Validate input using zod
- Hash password
- Insert user into DB
- Return success or error

Only modify:

- src/app/api/[[...route]]/route.ts
- create validation in src/server/validations/

---

# 🧭 PHASE 3 — DASHBOARD SHELL

## 🟢 STEP 5 — Layout + Navigation

### 🎯 Goal

Real app structure.

### 📦 Codex Prompt

Create a dashboard layout with:

- Sidebar navigation
- Top header
- Main content area

Routes:

- dashboard
- categories
- products
- orders
- restock queue
- activity logs

Use:

- shadcn components
- clean spacing
- responsive layout

Only modify:

- src/components/layout/
- src/app/dashboard/layout.tsx

---

# 📦 PHASE 4 — CATEGORY MODULE

## 🟢 STEP 6 — Category Backend

Create category APIs using Hono:

- GET /categories
- POST /categories
- PUT /categories/:id
- DELETE /categories/:id

Add validation using zod.

Only modify:

- src/app/api/[[...route]]/route.ts
- src/server/services/category.service.ts

---

## 🟢 STEP 7 — Category UI

Build category UI:

- Category list table
- Add category modal/form
- Edit + delete actions

Use:

- shadcn table, dialog, form
- react-hook-form + zod

Only modify:

- src/app/categories/page.tsx
- src/components/categories/

---

# 📦 PHASE 5 — PRODUCT MODULE

## 🟢 STEP 8 — Product Backend

Create product APIs:

- GET /products
- POST /products
- PUT /products/:id
- DELETE /products/:id

Rules:

- link with category
- include stock + threshold
- include product status

Only modify:

- services + api files

---

## 🟢 STEP 9 — Product UI

Build product UI:

- product table
- add/edit product form
- show stock status badge
- show low stock indicator

Use:

- shadcn components
- clean UX

Only modify:

- product pages + components

---

# 🧾 PHASE 6 — ORDER SYSTEM (CORE LOGIC)

## 🟢 STEP 10 — Order Creation API (IMPORTANT)

Create order creation API with transaction.

Rules:

- prevent duplicate product entries
- validate stock availability
- calculate total price
- insert order + order_items
- deduct stock
- update product status if needed

Use transaction.

Only modify:

- order.service.ts
- api route

---

## 🟢 STEP 11 — Order UI

Build order creation UI:

- dynamic product selection
- quantity input
- auto total calculation
- validation messages

Prevent:

- duplicate products
- invalid quantities

Only modify:

- order page + components

---

[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]
[PENDING_FROM_HERE_GO_TO_THIS_LINE]

# 🔄 PHASE 7 — STOCK & RESTOCK

## 🟢 STEP 12 — Restock Logic

Implement restock queue logic:

- if stock < threshold → add to queue
- assign priority
- avoid duplicates
- mark resolved when restocked

Only modify:

- restock.service.ts

---

## 🟢 STEP 13 — Restock UI

Build restock queue UI:

- table of low stock products
- priority badge
- restock action

Only modify:

- restock pages

---

# 📊 PHASE 8 — DASHBOARD + LOGS

## 🟢 STEP 14 — Activity Logs

Implement activity logging system:

- log order creation
- log stock updates
- log restock actions

Store in activity_logs table.

Only modify:

- activity-log service

---

## 🟢 STEP 15 — Dashboard Metrics

Build dashboard metrics:

- total orders today
- revenue today
- low stock count
- pending vs completed orders

Add summary widgets.

Only modify:

- dashboard page

---

# ✨ PHASE 9 — POLISH

## 🟢 STEP 16 — UX Polish

Improve UX:

- loading skeletons
- empty states
- error states
- toast notifications (sonner)
- smooth animations (framer motion)

Do not change business logic.

---

## 🟢 STEP 17 — Performance + Cleanup

Optimize app:

- remove unused code
- optimize queries
- ensure no unnecessary re-renders
- improve type safety

Do not add new features.

---

# 🚀 PHASE 10 — DEPLOYMENT

## 🟢 STEP 18 — Deployment

Prepare app for deployment:

- env validation
- production-safe configs
- error handling
- logging

Target:

- Vercel + Neon

---

# 🧠 FINAL RULE (IMPORTANT)

When using Codex:

```txt
YOU:
- paste ONE prompt
- wait for response
- implement
- test

ME:
- give next step
```

---
