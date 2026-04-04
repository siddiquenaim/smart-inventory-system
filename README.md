# Live Link
https://smart-inventory-system-naim.vercel.app/

# Smart Inventory & Order Management System
This project is a web app for businesses that need a simple way to keep track of products, stock levels, customer orders, and items that need restocking.

In normal terms, it helps a team answer questions like:
- What products do we have right now?
- Which items are running low?
- What orders have been created?
- Which orders are still waiting, shipped, or delivered?
- What actions happened recently in the system?

The goal of the project is to make everyday inventory work easier and less error-prone.

## What This App Does

### 1. Secure login
Users can create an account and sign in with email and password.

There is also a demo login option so the app can be tested quickly without creating a new account first.

### 2. Product and category management
Users can create categories such as:
- Electronics
- Grocery
- Clothing

They can also add products manually with:
- product name
- category
- price
- stock quantity
- minimum stock threshold
- current availability status

This makes it easier to organize items and understand what is available or out of stock.

### 3. Order management
Users can create customer orders using multiple products in one order.

Each order stores:
- customer name
- selected products
- quantity for each product
- total price
- order status

The order statuses are:
- Pending
- Confirmed
- Shipped
- Delivered
- Cancelled

### 4. Stock protection
When an order is created, the app automatically reduces stock.

If a user tries to order more than what is available, the app stops the action and shows a clear warning instead of allowing bad data.

If stock reaches zero, the product is automatically marked as out of stock.

### 5. Restock queue
If a product drops below its minimum threshold, it is automatically added to a restock queue.

This helps the business quickly see:
- what needs restocking
- which items are highest priority
- which items can be updated and removed after replenishment

### 6. Conflict prevention
The app prevents common mistakes such as:
- adding the same product twice in one order
- ordering products that are unavailable
- creating orders with invalid quantities

This is important because inventory systems become unreliable very quickly if small mistakes are allowed.

### 7. Dashboard overview
The dashboard gives a quick summary of the business situation, including:
- total orders today
- order progress summary
- low stock count
- today’s revenue
- product stock summary

This means a user does not need to open every page just to understand what is happening.

### 8. Activity log
The system keeps a recent history of important actions, such as:
- order created
- order status changed
- stock updated
- item added to restock queue

That gives visibility into recent activity and helps users follow what changed.

## Why This Project Matters
This project is useful for small and medium businesses that need something more structured than spreadsheets, but still easy to understand and use.

It is designed to reduce manual mistakes, improve stock visibility, and make order tracking more organized.

## Technical Summary

### Stack
- Next.js
- React
- TypeScript
- PostgreSQL
- Neon
- Drizzle ORM
- NextAuth
- Hono
- shadcn/ui
- Tailwind CSS

### Why these technologies were used
- **Next.js**: good for building a full web application with pages, APIs, authentication, and deployment in one place.
- **React**: helps build a fast and interactive user experience.
- **TypeScript**: reduces mistakes by making data and logic more structured and predictable.
- **PostgreSQL**: a strong and reliable database for structured business data like products, orders, and stock.
- **Neon**: makes PostgreSQL easier to host in the cloud and is convenient for modern web deployment.
- **Drizzle ORM**: keeps the database schema and application code closely aligned, which helps avoid data mismatches.
- **NextAuth**: handles login sessions securely without building auth from scratch.
- **Hono**: keeps API routes clean and organized.
- **shadcn/ui**: provides polished UI building blocks so the app feels production-ready.
- **Tailwind CSS**: helps build consistent layouts and responsive UI quickly.

### Deployment
- Frontend and server routes are deployed on **Vercel**
- Database is hosted on **Neon**

This setup was chosen because it is simple, practical, and works well for a modern full-stack web application.
