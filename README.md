# SmartStock — Smart Inventory & Stock Intelligence System

> **Full-Stack Inventory Management & Demand Forecasting System**  
> *Built for NT Tech Innovation — Full Stack Developer Practical Assessment*  
> **Technology Stack**: MERN + TypeScript  
> **Version**: 1.0  
> **Submission Deadline**: 19 October 2026  

---

## 1. Project Title
**SmartStock — Smart Inventory & Stock Intelligence System**

## 2. Problem Statement
Small retailers and online businesses often track inventory through manual spreadsheets, physical notebooks, or fragmented tools. This causes critical business bottlenecks:
- Frequent stockouts and lost sales revenue.
- Excess capital locked up in overstocked, slow-moving items.
- Inaccurate stock quantities resulting from untracked manual corrections.
- Zero auditability or visibility into who changed inventory and why.
- Lack of proactive data-driven restocking intelligence.

SmartStock solves these pain points by offering transactional inventory tracking, multi-tenant workspace isolation, live point-of-sale (POS) checkout, automated low-stock alerts, and moving-average demand forecasting with Reorder Point ($ROP$) recommendations.

---

## 3. Main Features

### Core Inventory & Management (P0)
- **Multi-Tenant Workspace & Authentication**: Secure registration, login, and JWT access/refresh token rotation. Every user is isolated into their dedicated inventory workspace.
- **Product Catalog (CRUD)**: Manage products with SKU, Cost Price, Selling Price, Category, Supplier, Lead Time, and Safety Stock. Supports soft archival (`isArchived: true`) so historical sales remain untampered.
- **Category & Supplier Management**: Full relational tracking with safety checks preventing deletion of active in-use categories and suppliers.
- **Stock Movement Ledger**: Every stock change produces an immutable audit record (`IN`, `OUT`, `ADJUSTMENT`, `SALE`, `SALE_REVERSAL`) recording actor, timestamp, previous balance, new balance, and reason.
- **Point of Sale (POS) & Sales History**: Real-time multi-item sales processing with atomic database transactions preventing negative stock or partial commits.
- **Printable Invoices & Receipts**: Instant receipt modal with print-to-PDF formatting and sales reversal/cancellation support.
- **Smart Stock Intelligence & Demand Forecasting**:
  - Reorder Point ($ROP$): $\lceil \hat{d} \cdot L \rceil + SS$
  - Suggested Order Quantity ($Q$): $\max(0, \lceil \hat{d} \cdot (L + H) \rceil + SS - S)$
  - Moving-average daily sales demand ($\hat{d}$).
- **Interactive Dashboard**: Real-time sales metrics, gross profit, inventory value at cost, 7-day sales trend charts, and low-stock alerts table with direct "+ Restock" action.

### Advanced Capabilities (P1)
- **Advanced Filtering & Sorting**: Filter products by Category, Stock Status (In Stock, Low Stock, Out of Stock), and multi-criteria sorting (Name, Stock, Price).
- **CSV Data Export**: One-click product catalogue and inventory export to CSV.
- **Sales Cancellation / Return**: Restore stock quantities atomically with `SALE_REVERSAL` audit logging.

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **State Management & Data Fetching**: Redux Toolkit & RTK Query
- **Styling**: Tailwind CSS
- **Charts & Visualization**: Recharts
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database & ODM**: MongoDB Atlas + Mongoose
- **Validation**: Zod (strict schema validation for all endpoints)
- **Security**: Helmet, CORS, bcryptjs, JSON Web Tokens (JWT)
- **Testing**: Vitest, Supertest

---

## 5. Architecture Overview
SmartStock follows a clean, modular architecture separating routes, controllers, services, database models, and validation schemas:

```
SmartStock/
├── client/                     # Vite + React + RTK Query Frontend
│   ├── src/
│   │   ├── components/         # Shared layouts, guards (ProtectedRoute, AppLayout)
│   │   ├── features/           # Modular domain features
│   │   │   ├── auth/           # Login, Register, User session
│   │   │   ├── dashboard/      # Overview metrics & Summary Cards
│   │   │   ├── products/       # Product list, filters, modals, low stock
│   │   │   ├── categories/     # Category management
│   │   │   ├── suppliers/      # Supplier directory
│   │   │   ├── sales/          # POS checkout, sales history, invoice modal
│   │   │   ├── stock-movements/# Stock in/out/adjust modal & history ledger
│   │   │   └── analytics/      # Demand forecast table & sales charts
│   │   └── services/           # RTK Query base API with automatic token re-auth
│   └── package.json
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # DB connection, env schema parsing
│   │   ├── middleware/         # Auth guard, request validation, error handler
│   │   ├── modules/            # Domain-driven backend modules
│   │   │   ├── auth/           # Token generation, bcrypt hashing
│   │   │   ├── users/          # User profiles
│   │   │   ├── workspaces/     # Multi-tenant workspace management
│   │   │   ├── products/       # Product catalog & soft-delete logic
│   │   │   ├── categories/     # Categories CRUD
│   │   │   ├── suppliers/      # Suppliers CRUD
│   │   │   ├── sales/          # Sales transactions & analytics
│   │   │   └── stock-movements/# Ledger transactions & compare-and-set guards
│   │   ├── app.ts              # Express application setup & route mounting
│   │   └── server.ts           # Server bootstrap
│   ├── tests/                  # Automated Vitest integration test suite
│   └── package.json
├── .env.example                # Unified environment templates
└── README.md
```

---

## 6. Installation Instructions

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)
- MongoDB Atlas connection string or local MongoDB instance

### Clone & Install
```bash
# Clone the repository
git clone https://github.com/codewithToufikul/SmartStock.git
cd SmartStock

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## 7. Environment-Variable Setup

### Backend Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartstock?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_access_token_key_change_in_production
JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_key_change_in_production
CLIENT_URL=http://localhost:5173
```

### Frontend Configuration (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 8. Frontend and Backend Startup Commands

Run the backend and frontend in separate terminals:

```bash
# Terminal 1: Start Backend Server (runs on http://localhost:3000)
cd server
npm run dev

# Terminal 2: Start Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 9. Database Setup
- The application uses **MongoDB Atlas** via Mongoose.
- Schemas automatically configure indexes:
  - Unique compound index on `{ workspace: 1, sku: 1 }`
  - Normalized unique email index on `{ email: 1 }`
  - Workspace indexing on all transactional collections (`Sales`, `StockMovements`, `Products`, `Categories`, `Suppliers`).
- Collections are initialized upon the first user registration.

---

## 10. API Overview (Base Path: `/api/v1`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Healthcheck endpoint (`{ status: "ok" }`) | No |
| `POST` | `/auth/register` | Register new owner & initialize workspace | No |
| `POST` | `/auth/login` | Authenticate user & return JWT tokens | No |
| `POST` | `/auth/refresh` | Refresh access token using refresh token | No |
| `POST` | `/auth/logout` | Invalidate client session | Yes |
| `GET` | `/auth/me` | Fetch currently logged-in user profile | Yes |
| `GET` | `/dashboard/summary`| Metrics: revenue, cost, profit, low stock | Yes |
| `GET` | `/products` | List & search products (category/status) | Yes |
| `POST` | `/products` | Create new product with unique SKU | Yes |
| `PATCH`| `/products/:id` | Update product details | Yes |
| `DELETE`| `/products/:id` | Soft-delete / archive product (`isArchived: true`) | Yes |
| `GET` | `/categories` | List workspace categories | Yes |
| `POST` | `/categories` | Create new product category | Yes |
| `GET` | `/suppliers` | List workspace suppliers | Yes |
| `POST` | `/suppliers` | Create new supplier | Yes |
| `POST` | `/stock-movements` | Record Stock In, Stock Out, or Audit Adjustment | Yes |
| `GET` | `/stock-movements/:productId/history` | Get product movement ledger timeline | Yes |
| `GET` | `/sales` | List past sales transactions | Yes |
| `POST` | `/sales` | Process POS sale with atomic stock deduction | Yes |
| `POST` | `/sales/:saleId/cancel` | Cancel sale & reverse inventory (`SALE_REVERSAL`) | Yes |
| `GET` | `/sales/analytics/summary` | Aggregate revenue, unit cost, gross profit | Yes |
| `GET` | `/sales/analytics/daily` | 7-day daily sales trend | Yes |
| `GET` | `/sales/analytics/forecast` | Moving-average demand forecast & $ROP$ | Yes |

---

## 11. Test Commands and Results

### Run Automated Vitest Suite (SRS Section 12.6)
```bash
cd server
npm test
```

### Verified Test Results
```
 ✓ tests/inventory-sales.test.ts (3 tests) 5689ms
   ✓ Core Inventory & Sales Workflow (SRS Section 12.6) (3)
     ✓ Section 12.6: Given a product with 10 units, when a valid sale removes 3 units, the resulting stock must be 7 and the movement history must record a delta of -3
     ✓ Section 12.6: Insufficient stock prevents the sale and preserves inventory
     ✓ Section 12.4: Multi-item sale is atomic and does not partially commit if one item has insufficient stock

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  6.27s
```

---

## 12. Demo URL
- **Local URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000/api/v1`
- **Healthcheck**: `http://localhost:3000/api/v1/health`

---

## 13. Demo Credentials
To test the application locally, you can register a new account on the `/register` page or use the demo credentials below:
- **Email**: `owner@smartstock.local`
- **Password**: `Password123!`
- **Role**: `OWNER`

---

## 14. AI / ML Methodology (Demand Forecasting)
SmartStock implements a baseline moving-average forecasting model configured for small-business inventory cycles:

1. **Daily Demand Estimation ($\hat{d}$)**:
   $$\hat{d} = \frac{\sum_{i=1}^{n} d_i}{n}$$
   Where $d_i$ represents units sold on day $i$, and $n$ is the historical observation horizon (default: 30 days).

2. **Reorder Point ($ROP$)**:
   $$ROP = \lceil \hat{d} \cdot L \rceil + SS$$
   Where $L$ is the supplier lead time in days and $SS$ is safety stock.

3. **Suggested Order Quantity ($Q$)**:
   $$Q = \max(0, \lceil \hat{d} \cdot (L + H) \rceil + SS - S)$$
   Where $H$ is the forecast horizon in days and $S$ is current stock.

---

## 15. Forecast Assumptions and Limitations
- Assumes historical sales rate reflects future demand without abrupt external anomalies.
- Moving-average models do not model seasonal demand surges, promotional spikes, or supplier supply-chain halts.
- Products with no historical sales indicate insufficient data rather than zero true market demand.

---

## 16. Known Limitations
- Single-warehouse inventory management (multi-warehouse is planned for v2.0).
- Barcode scanning via camera is outside the current MVP scope.
- Automated email notifications are replaced with real-time UI alerts and dashboard notifications.

---

## 17. Live Demonstration Flow (SRS Section 18)
When presenting SmartStock in an evaluation or technical interview:
1. **Login**: Authenticate at `/login`.
2. **Dashboard Overview**: Review total active products, low-stock alerts, and 7-day sales charts.
3. **Category & Supplier**: Add a category and supplier.
4. **Create Product**: Add a product with initial stock (e.g. 10 units, threshold 5).
5. **Stock-In**: Restock product via the Stock Movement modal.
6. **Point of Sale (POS)**: Add items to cart and complete checkout; inspect generated receipt.
7. **Verify Inventory & Ledger**: Observe stock drop and inspect the audit trail in the Movement History tab.
8. **Automated Test Demonstration**: Run `npm test` in `server/` to demonstrate the Section 12.6 core inventory and atomicity test suite.
