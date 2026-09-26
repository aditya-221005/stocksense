# StockSense

StockSense is a modern inventory management and stock tracking system built for the Odoo Hackathon 2026.

## Architecture

StockSense is structured as a clean 3-folder architecture:

```
StockSense/
├── frontend/     → React + Vite + TypeScript + Tailwind CSS
├── backend/      → Node.js + Express + TypeScript
├── database/     → Prisma ORM + PostgreSQL
├── PROJECT_CONTEXT.md
└── README.md
```

## Features

- **Dashboard:** Key metrics, inventory valuation, pending stock operations, and low-stock alerts.
- **Product Catalog:** Manage SKUs, categories, units of measure, unit costs, and initial inventory load.
- **Warehouses & Locations:** Multi-warehouse management with sub-locations (racks, shelves).
- **Stock Balances:** Real-time visibility into on-hand and reserved inventory across facilities.
- **Stock Receipts (IN):** Record incoming vendor shipments and validate stock increases.
- **Delivery Orders (OUT):** Record customer shipments and validate stock deductions.
- **Internal Transfers:** Move inventory between warehouses and locations.
- **Stock Adjustments:** Physical inventory count reconciliation with automated difference logging.
- **Stock Ledger:** Audit history of all inventory movements.
- **Authentication:** Role-based access control (Admin, Manager, Staff) and OTP password reset.

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- PostgreSQL database

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd stocksense
   ```

2. **Database Setup:**
   Configure your PostgreSQL connection string in `backend/.env` or `database/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stocksense"
   ```

3. **Install Dependencies & Generate Database Client:**
   ```bash
   # Database package
   cd database
   npm install
   npm run prisma:generate
   npm run prisma:seed

   # Backend package
   cd ../backend
   npm install

   # Frontend package
   cd ../frontend
   npm install
   ```

## Running the Application

### Development Mode

Run the Backend server:
```bash
cd backend
npm run dev
# Server listening on http://localhost:5000
```

Run the Frontend Vite dev server:
```bash
cd frontend
npm run dev
# Application running at http://localhost:3000
```

Default Credentials (Seeded):
- **Admin:** `admin@stocksense.com` / `admin123`
- **Manager:** `manager@stocksense.com` / `manager123`

## Production Build

```bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd frontend
npm run build
```

## Documentation

For a detailed explanation of the architecture, database models, API endpoints, and business rules, refer to [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).
