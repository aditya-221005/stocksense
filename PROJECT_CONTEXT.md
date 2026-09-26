# StockSense Project Context

## 1. Project Overview

StockSense is an intelligent inventory and stock management system developed for the Odoo Hackathon 2026. The application empowers businesses to manage products, monitor physical stock levels across multi-warehouse location hierarchies, automate stock receipts, delivery orders, internal transfers, and physical inventory count adjustments, and maintain an audit log of stock movements.

## 2. Architecture

StockSense follows a 3-folder architecture separating Frontend, Backend, and Database layers:

```
React + Vite (Frontend)
        ↓  (HTTP API / JSON via Bearer Auth)
Node.js + Express + TypeScript (Backend)
        ↓  (Prisma ORM Client)
PostgreSQL Database
```

## 3. Repository Structure

```
StockSense/
│
├── frontend/             # React 18 + Vite + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/   # UI components (Header, Sidebar, StatCard, StatusBadge, Modal)
│   │   ├── pages/        # Application view pages (Dashboard, Products, Stock, Receipts, Deliveries, etc.)
│   │   ├── layouts/      # MainLayout (Auth wrapper), AuthLayout
│   │   ├── hooks/        # Custom React hooks (useAuth)
│   │   ├── services/     # API service layer (auth, product, warehouse, inventory, dashboard)
│   │   ├── types/        # TypeScript domain model types
│   │   ├── App.tsx       # React Router setup
│   │   └── main.tsx      # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/              # Node.js + Express + TypeScript Backend API
│   ├── src/
│   │   ├── config/       # Database (Prisma) and Environment configuration
│   │   ├── controllers/  # Express request handlers (Auth, Product, Warehouse, Inventory, Dashboard)
│   │   ├── routes/       # Express route modules (/api/auth, /api/products, /api/receipts, etc.)
│   │   ├── services/     # Core business logic services & database transactions
│   │   ├── middleware/   # JWT authentication & global error handling
│   │   ├── utils/        # JWT, password hashing, async handler helpers
│   │   ├── app.ts        # Express application setup
│   │   └── server.ts     # HTTP server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── database/             # Prisma ORM & Database Layer
│   ├── prisma/
│   │   ├── schema.prisma # Complete StockSense domain model
│   │   └── seed.ts       # Database seed script
│   ├── package.json
│   └── tsconfig.json
│
├── PROJECT_CONTEXT.md    # Comprehensive architectural specification
├── README.md             # Developer setup and instructions
├── .env.example          # Environment variable template
└── package.json          # Root orchestration package scripts
```

## 4. Frontend

- **Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + Custom Glassmorphism Theme
- **Routing:** `react-router-dom`
- **State Management:** React Context (`AuthProvider`) & custom hooks
- **API Client:** Service layer located in `frontend/src/services/` using `fetch` with automatic JWT Bearer authorization headers.

## 5. Backend

- **Framework:** Node.js + Express + TypeScript
- **Pattern:** Controller-Service-Repository (Prisma) architecture
- **Security:** JWT authentication middleware, bcrypt password hashing, input validation.
- **Transactions:** Atomic Prisma `$transaction` blocks for all inventory movements.

## 6. Database

- **ORM:** Prisma ORM
- **Database Engine:** PostgreSQL
- **Schema Models:**
  - `User`, `OtpToken` (Auth & Password Reset)
  - `Warehouse`, `Location` (Hierarchical locations: Warehouse -> Rack -> Shelf)
  - `ProductCategory`, `UnitOfMeasure`, `Product`
  - `StockBalance` (Current on-hand and reserved quantity per product & location)
  - `InventoryDocument`, `InventoryDocumentLine` (Parent document for Receipts, Deliveries, Transfers, Adjustments)
  - `Receipt`, `Delivery`, `Transfer`, `Adjustment`
  - `Supplier`, `Customer`, `ReorderRule`
  - `StockLedger` (Immutable audit trail of stock changes)

## 7. Authentication

- **Signup & Login:** Email and password with JWT token response.
- **OTP Password Reset:** Generates a 6-digit numeric OTP token, stored with expiry in `OtpToken`, verified before allowing password update.
- **Session:** Bearer token stored in `localStorage`, validated via `/api/auth/me`.

## 8. Inventory Concepts

- **Product:** Item defined by name, unique SKU, category, UOM, and unit cost.
- **Warehouse:** Physical facility or building (`WH-MAIN`, `WH-SEC`).
- **Location:** Specific rack, shelf, or bin inside a warehouse.
- **Stock Balance:** Current stock quantity held for a product at a specific location.
- **Stock Ledger:** Permanent record of every quantity addition, deduction, or transfer.

## 9. Inventory Business Rules

1. **Receipt (Stock IN):**
   - Increases `StockBalance.onHand` at the destination location.
   - Records a `RECEIPT` ledger entry (`+quantity`).
   - Marks document status as `DONE`.
2. **Delivery (Stock OUT):**
   - Decreases `StockBalance.onHand` at the source location.
   - Validates that sufficient stock exists before deduction.
   - Records a `DELIVERY` ledger entry (`-quantity`).
   - Marks document status as `DONE`.
3. **Internal Transfer:**
   - Decreases `StockBalance.onHand` at source location (`TRANSFER_OUT`).
   - Increases `StockBalance.onHand` at destination location (`TRANSFER_IN`).
   - Records 2 ledger entries for audit trace.
   - Marks document status as `DONE`.
4. **Stock Adjustment (Physical Count):**
   - Reconciles recorded on-hand quantity with physical counted quantity.
   - Updates `StockBalance.onHand` to match counted quantity.
   - Records `ADJUSTMENT` ledger entry with the exact difference (`countedQty - onHand`).
   - Marks document status as `DONE`.

## 10. API Endpoints

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current session
- `POST /api/auth/forgot-password` - Request OTP code
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/products` - List products
- `POST /api/products` - Create product (with optional initial stock)
- `GET /api/products/:id` - Get product details
- `GET /api/warehouses` - List warehouses
- `POST /api/warehouses` - Create warehouse
- `GET /api/locations` - List stock locations
- `POST /api/locations` - Create stock location
- `GET /api/stock` - Query stock balances
- `GET /api/receipts` - List stock receipts
- `POST /api/receipts` - Create stock receipt
- `POST /api/receipts/:id/validate` - Validate & execute stock receipt
- `GET /api/deliveries` - List delivery orders
- `POST /api/deliveries` - Create delivery order
- `POST /api/deliveries/:id/validate` - Validate & execute delivery
- `GET /api/transfers` - List internal transfers
- `POST /api/transfers` - Create internal transfer
- `POST /api/transfers/:id/validate` - Validate & execute transfer
- `GET /api/adjustments` - List stock adjustments
- `POST /api/adjustments` - Create stock adjustment
- `POST /api/adjustments/:id/validate` - Validate & execute adjustment
- `GET /api/ledger` - Query stock ledger history
- `GET /api/dashboard` - Get analytics & KPI summary

## 11. Environment Variables

- `PORT`: Backend HTTP port (default `5000`)
- `DATABASE_URL`: PostgreSQL connection URI
- `JWT_SECRET`: Secret key for JWT signing
- `VITE_API_URL`: Frontend API target URL (default `/api`)

## 12. Development Commands

From root directory:
- `npm run dev:frontend` - Start Vite frontend dev server (http://localhost:3000)
- `npm run dev:backend` - Start Express backend dev server (http://localhost:5000)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:seed` - Seed database with sample data

## 13. Current Implementation Status

- [x] Clean 3-folder architecture (`frontend`, `backend`, `database`)
- [x] User Authentication & OTP Password Reset
- [x] Product Catalog & SKU Management
- [x] Multi-Warehouse & Hierarchical Location Management
- [x] Real-time Stock Balance Tracking
- [x] Receipts (Stock IN) & Validation
- [x] Deliveries (Stock OUT) & Validation
- [x] Internal Transfers & Validation
- [x] Inventory Count Adjustments & Validation
- [x] Audit Ledger Trail
- [x] Dashboard KPIs & Low-Stock Alerts
- [x] Supplier & Customer Directories
- [x] Reorder Rules & Thresholds

## 14. Important Decisions

- Separated frontend and backend into independent npm modules.
- Database access and Prisma Client instantiation are confined strictly to backend/database packages.
- All stock mutations enforce database transactions to prevent inventory desynchronization.
