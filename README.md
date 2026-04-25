# Sporting Goods Store

A full-stack e-commerce platform for a sporting goods retailer, featuring a customer-facing storefront, role-based staff dashboards, inventory management, order tracking, real-time delivery coordination, and customer support.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database](#database)
- [Backend (Next.js API)](#backend-nextjs-api)
- [Frontend (React/Vite)](#frontend-reactvite)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Project Structure

```
sporting-goods-store/
├── app/                        # Next.js App Router (backend API + layouts)
│   ├── api/                    # All REST API routes
│   │   ├── auth/               # login, logout, register, reset-password, update-password
│   │   ├── products/           # product catalog, sponsored products, discounts
│   │   ├── orders/             # order creation, status, items, tracking
│   │   ├── cart/               # cart item management
│   │   ├── deliveries/         # delivery status, driver location tracking
│   │   ├── reviews/            # product reviews
│   │   ├── profile/            # user profile, purchase history
│   │   ├── support/            # tickets, chat messages, chatbot
│   │   ├── admin/              # user role management, policies, analytics
│   │   ├── attendance/         # staff clock-in/out, schedules
│   │   ├── refunds/            # refund approvals
│   │   ├── suppliers/          # supplier management
│   │   ├── sponsors/           # sponsorship management
│   │   ├── recommendations/    # product recommendations
│   │   └── in-store/           # POS purchases
│   └── layout.tsx              # Root layout
├── lib/                        # Shared backend utilities
│   ├── supabase/
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── types.ts            # Generated database types
│   ├── auth/
│   │   └── requireRole.ts      # Role-based access control middleware
│   ├── api/
│   │   └── errors.ts           # Centralized API error handler
│   └── validations/            # Zod schemas (auth, cart, orders, products, reviews, staff, suppliers, support)
├── scripts/
│   └── seed.ts                 # Database seed script (users, products, orders, policies)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema (tables, views, triggers, functions, indexes)
├── Frontend/                   # React 18 SPA (Vite)
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── context/            # AuthContext, CartContext
│       ├── pages/              # Page components + staff dashboards
│       ├── lib/                # Supabase client, API wrapper, utilities
│       ├── App.jsx             # Root router
│       └── main.jsx            # Vite entry point
├── .env.local.example          # Environment variable template
├── package.json                # Backend dependencies
├── tsconfig.json               # TypeScript config
└── postcss.config.mjs          # PostCSS / Tailwind config
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + SSR (`@supabase/ssr`) |
| Validation | Zod 4 |
| Styling (server components) | Tailwind CSS 4 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18.2.0 |
| Build Tool | Vite 5 |
| Routing | React Router DOM 6 |
| Database Client | `@supabase/supabase-js` 2 |
| Styling | Tailwind CSS 3 |
| Notifications | react-hot-toast |
| Date Utilities | date-fns |
| Validation | Zod 4 |

---

## Architecture Overview

```
Frontend (React/Vite)
        │
        │  HTTP (fetch via /lib/api.js)
        ▼
Backend API (Next.js App Router)
        │  Zod validation
        │  Role-based auth middleware
        │  Business logic
        ▼
Supabase (PostgreSQL)
        │  Row Level Security (RLS)
        │  Triggers & functions
        │  Views & indexes
```

The backend is an API-only Next.js application. The frontend is a fully separate React SPA built with Vite that communicates exclusively through the Next.js REST API. Both share the same Supabase project for database and authentication.

---

## Database

**Type:** PostgreSQL (Supabase)

### Tables

| Table | Description |
|---|---|
| `profiles` | User profiles, roles, reward points, salary |
| `products` | Product catalog (name, brand, category, price, stock status) |
| `suppliers` | Supplier companies |
| `supplier_products` | Supplier ↔ product relationships |
| `stock` | Inventory quantities, reorder thresholds, warehouse location |
| `discounts` | Time-based product discounts |
| `sponsors` | Company sponsors |
| `sponsored_products` | Sponsored product links |
| `cart_items` | Active shopping cart items per user |
| `orders` | Customer orders with status, payment method, tracking number |
| `order_items` | Individual line items within orders |
| `reviews` | Product reviews with star ratings |
| `rewards_log` | Loyalty points earning/spending history |
| `support_tickets` | Customer support tickets |
| `chat_messages` | Support chat thread messages |
| `staff_attendance` | Employee clock-in/clock-out records |
| `staff_schedules` | Employee shift schedules |
| `driver_locations` | Real-time GPS coordinates for delivery drivers |
| `profits` | Monthly revenue & profit analytics |
| `store_policies` | Configurable business rules (refund window, points rate, shipping fees) |

### Views

| View | Purpose |
|---|---|
| `vw_product_catalog` | Full product info with active discounts and average ratings |
| `vw_active_sponsored` | Currently active sponsored products |
| `vw_customer_dashboard` | Per-customer order & reward summary |
| `vw_order_tracking` | Order status joined with shipping details |
| `vw_low_stock_alerts` | Products below reorder threshold |
| `vw_manager_analytics` | Revenue, transaction counts, top categories |
| `vw_refund_eligible_items` | Order items within the refund window |
| `vw_staff_attendance` | Attendance records with calculated hours worked |
| `vw_salary_report` | Staff hours and salary calculations |
| `vw_top_products` | Best-selling products by quantity sold |
| `vw_support_dashboard` | Support ticket metrics and open ticket counts |
| `vw_recommendation_inputs` | Aggregated data for the recommendation engine |

### Triggers & Automated Business Logic

| Trigger | Behavior |
|---|---|
| `on_auth_user_created` | Auto-creates a `profiles` row when a user registers |
| `update_stock_after_order` | Decrements inventory after an order is placed |
| `restore_stock_on_cancel` | Restores stock when an order is cancelled |
| `enforce_cancellation_rules` | Blocks cancellation if order is already shipped |
| `enforce_refund_window` | Blocks refund requests outside the policy window |
| `calculate_reward_points` | Awards loyalty points on purchase completion |
| `apply_discount_points` | Applies points redemption to eligible orders |
| `update_stock_status` | Updates `in_stock / low_stock / out_of_stock` status automatically |
| `calculate_monthly_profits` | Aggregates revenue into the `profits` table monthly |

### Security

All tables are protected with **Row Level Security (RLS)** policies. Access is scoped per user role so that customers, staff, drivers, and admins each see only what they are permitted to access.

---

## Backend (Next.js API)

### API Routes

**Authentication** — `/api/auth/`
- `POST /login` — Sign in with email and password
- `POST /logout` — End session
- `POST /register` — Create a new customer account
- `POST /reset-password` — Send password reset email
- `POST /update-password` — Set a new password from reset token

**Products** — `/api/products/`
- `GET /products` — List products (with filters, pagination)
- `POST /products` — Create a product (admin/manager)
- `GET /products/sponsored` — Fetch sponsored products
- `GET /products/discounts` — Fetch active discounts

**Orders** — `/api/orders/`
- `GET /orders` — List orders for authenticated user
- `POST /orders` — Place a new order (validates stock, applies discounts/rewards)
- `GET /orders/[id]` — Order detail
- `PATCH /orders/[id]/status` — Update order status
- `GET /orders/[id]/items` — Order line items
- `GET /orders/track/[trackingNumber]` — Public order tracking

**Cart** — `/api/cart/`
- `GET /cart` — Fetch current user's cart
- `POST /cart` — Add item to cart
- `DELETE /cart/[id]` — Remove item from cart

**Deliveries** — `/api/deliveries/`
- `GET /deliveries` — Active deliveries for driver
- `PATCH /deliveries/[id]/status` — Update delivery status
- `POST /deliveries/location` — Update driver GPS coordinates

**Reviews** — `/api/reviews/`
- `GET /reviews/product/[id]` — Reviews for a product
- `POST /reviews` — Submit a review

**Profile** — `/api/profile/`
- `GET /profile` — Get own profile
- `PATCH /profile` — Update profile details
- `GET /profile/purchase-history` — Full purchase history

**Support** — `/api/support/`
- `GET /support/tickets` — List own tickets
- `POST /support/tickets` — Open a new ticket
- `GET /support/tickets/[id]/messages` — Chat history for a ticket
- `POST /support/tickets/[id]/messages` — Send a chat message
- `POST /support/chatbot` — Automated chatbot response

**Admin** — `/api/admin/`
- `GET /admin/users` — List all users with roles
- `PATCH /admin/users/[id]/role` — Change user role
- `GET /admin/analytics` — Platform-wide analytics
- `GET /admin/policies` — Fetch store policies
- `PATCH /admin/policies` — Update store policies

**Attendance** — `/api/attendance/`
- `POST /attendance/clock-in` — Staff clock in
- `POST /attendance/clock-out` — Staff clock out
- `GET /attendance/schedules` — Fetch shift schedules

**Suppliers** — `/api/suppliers/`
- `GET /suppliers` — List suppliers
- `POST /suppliers` — Add a supplier
- `GET /suppliers/[id]/products` — Products from a supplier

**Other**
- `POST /api/refunds` — Submit a refund request
- `GET /api/sponsors` — Sponsor management
- `GET /api/recommendations` — Personalized product recommendations
- `POST /api/in-store/purchase` — POS in-store sale

### Shared Utilities

- **[`lib/auth/requireRole.ts`](lib/auth/requireRole.ts)** — Middleware that enforces role requirements on API routes. Unauthenticated or unauthorized requests receive 401/403.
- **[`lib/api/errors.ts`](lib/api/errors.ts)** — Standardized API error responses.
- **[`lib/validations/`](lib/validations/)** — Zod schemas that validate request bodies before any database interaction.

---

## Frontend (React/Vite)

### Pages & Routes

**Public**
| Route | Page |
|---|---|
| `/` | `HomePage.jsx` — Hero, featured/sponsored products, categories |
| `/products` | `ProductListingPage.jsx` — Browse with filters and search |
| `/product/:id` | `ProductDetailPage.jsx` — Product info, reviews, add to cart |
| `/login` | `LoginPage.jsx` |
| `/register` | `RegisterPage.jsx` |
| `/reset-password` | `ResetPasswordPage.jsx` |
| `/track/:orderId` | `TrackOrderPage.jsx` — Public order tracking link |

**Customer (authenticated)**
| Route | Page |
|---|---|
| `/cart` | `CartPage.jsx` |
| `/checkout` | `CheckoutPage.jsx` |
| `/account` | `AccountPage.jsx` — Profile, rewards, settings |
| `/orders` | `OrderHistoryPage.jsx` |
| `/orders/:id` | Order detail view |
| `/support` | `SupportPage.jsx` — Open / list tickets |
| `/support/tickets/:id` | `SupportTicketPage.jsx` — Live chat thread |

**Staff & Admin Dashboards**
| Route | Page | Roles |
|---|---|---|
| `/dashboard/inventory` | `InventoryPage.jsx` — Stock levels, alerts, reorder | staff, inventory_staff, manager, admin |
| `/dashboard/pos` | `POSPage.jsx` — In-store point of sale | staff, manager, admin |
| `/dashboard/support` | `SupportDashboardPage.jsx` — Ticket queue & metrics | support_staff, manager, admin |
| `/dashboard/deliveries` | `DeliveriesPage.jsx` — Active routes, GPS map | driver |
| `/dashboard/employees` | `EmployeesPage.jsx` — Schedules, attendance, salary | manager, admin |
| `/dashboard/analytics` | `AnalyticsPage.jsx` — Revenue charts, top products | manager, admin |
| `/dashboard/admin` | `AdminPage.jsx` — User roles, store policies | admin |

### Key Components

| Component | Purpose |
|---|---|
| `Navbar.jsx` | Responsive navigation with cart badge and role-aware links |
| `ProductCard.jsx` | Reusable product tile used in listing and home pages |
| `ProtectedRoute.jsx` | Wraps routes; redirects unauthenticated users or wrong roles |
| `SupportChat.jsx` | Live chat widget embedded in support ticket pages |
| `CategoryBar.jsx` | Horizontal category filter bar |
| `StarRating.jsx` | Interactive and display-only star rating component |
| `LoadingSpinner.jsx` | Shared loading indicator |

### State Management

| Context | Provides |
|---|---|
| `AuthContext` | Current user, session, login/logout helpers |
| `CartContext` | Cart item count, add/remove/clear helpers |

---

## User Roles

| Role | Access |
|---|---|
| `customer` | Storefront, cart, checkout, orders, support, account |
| `staff` | + POS, inventory view |
| `inventory_staff` | + Full inventory management |
| `support_staff` | + Support dashboard and ticket management |
| `driver` | + Delivery dashboard, GPS location updates |
| `manager` | + Employee management, analytics, full inventory |
| `admin` | Full access including user role management and store policies |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema applied

### 1. Clone & install backend dependencies

```bash
git clone <repo-url>
cd sporting-goods-store
npm install
```

### 2. Apply the database schema

```bash
# Via Supabase CLI
supabase db push

# Or paste supabase/migrations/001_initial_schema.sql directly in the Supabase SQL editor
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
# Fill in your Supabase project URL and keys
```

### 4. (Optional) Seed sample data

```bash
npm run seed
```

This creates test users for each role, 20+ products, sample orders, reviews, and default store policies.

### 5. Start the backend

```bash
npm run dev
# Next.js API server starts on http://localhost:3000
```

### 6. Install & start the frontend

```bash
cd Frontend
npm install
npm run dev
# Vite dev server starts on http://localhost:5173
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Supabase service role key (server-only) |

See [`.env.local.example`](.env.local.example) for the full template.

---

## Scripts

### Backend (`package.json`)

```bash
npm run dev       # Start Next.js development server
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
npm run seed      # Seed the database with sample data
```

### Frontend (`Frontend/package.json`)

```bash
npm run dev       # Start Vite development server
npm run build     # Production build
npm run preview   # Preview the production build locally
```
