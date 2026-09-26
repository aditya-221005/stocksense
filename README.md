# 📦 StockSense — Smart Inventory & Supply Chain Management

StockSense is an enterprise-grade, multi-warehouse inventory management and stock tracking platform built for modern supply chains. It provides real-time visibility into multi-facility stock valuation, atomic transactional movements, automated reorder alerts, and audit logging.

---

## 🌟 Key Features

- **📊 Executive Dashboard:** Real-time visibility into active product counts, total units, low-stock warnings, and combined inventory asset valuation in ₹.
- **📦 Product Catalog Management:** SKU creation, categories, units of measure (UOM), unit cost tracking, and initial stock onboarding.
- **🏢 Multi-Warehouse & Location Hierarchy:** Support for multiple physical warehouses with nested sub-locations (racks, shelves, aisles).
- **📥 Stock Receipts (Stock In):** Inbound supplier shipments with atomic validation, balance updates, and cost logging.
- **📤 Delivery Orders (Stock Out):** Outbound customer shipments with stock-guard validation to prevent negative inventory balances.
- **🔄 Internal Stock Transfers:** Move stock between physical locations with instant transactional reconciliation.
- **⚖️ Inventory Adjustments:** Physical stock reconciliation for damage, loss, or cycle counts with difference logging.
- **📜 Immutable Stock Ledger:** Full audit history tracking every movement (type, quantity, balance before/after, user, timestamp).
- **🔔 Automated Reorder Rules:** Min/Max stock threshold rules with automatic dashboard low-stock notifications.
- **🔐 Role-Based Access Control (RBAC):** Access control enforcing permissions across `ADMIN`, `INVENTORY_MANAGER`, and `WAREHOUSE_STAFF` roles.
- **🔑 OTP Password Reset:** Secure OTP-based workflow for user password recovery.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Zod, JWT |
| **Database** | PostgreSQL, Prisma ORM |
| **Infrastructure** | Docker, Docker Compose, Nginx (Reverse Proxy) |

---

## 📁 Repository Structure

```
stocksense/
├── backend/          → Express API server, Controllers, Routes, Services
│   ├── prisma/       → Database schema and seed script
│   └── src/          → TypeScript source code
├── database/         → Shared Prisma schema & configurations
├── frontend/         → React + Vite SPA, Tailwind CSS UI components
│   ├── public/       → Logos, assets, icons
│   └── src/          → Components, Pages, Services, Layouts
└── docker-compose.yml → Containerized orchestration setup
```

---

## 🚀 Quick Start with Docker (Recommended)

The entire StockSense stack (Frontend, Backend, and PostgreSQL) can be brought up in a single command using Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/aditya-221005/stocksense.git
cd stocksense

# 2. Launch the entire containerized stack
docker compose up --build
```

- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 💻 Local Development Setup

If you wish to run the backend and frontend locally without Docker:

### Prerequisites
- **Node.js:** v18+
- **PostgreSQL:** Running instance (e.g. `localhost:5432`)

### 1. Database Setup
```bash
cd backend
npm install

# Push Prisma schema to PostgreSQL & Seed initial data
npx prisma db push --schema=./prisma/schema.prisma
npx prisma db seed
```

### 2. Run Backend API
```bash
cd backend
npm run dev
# Express API starts on http://localhost:5000
```

### 3. Run Frontend App
```bash
cd frontend
npm install
npm run dev
# Vite dev server starts on http://localhost:3000
```

---

## 🔑 Default Login Credentials (Seeded)

The database automatically populates initial demo accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@stocksense.com` | `admin123` |
| **Inventory Manager** | `manager@stocksense.com` | `manager123` |
| **Warehouse Staff** | `staff@stocksense.com` | `staff123` |

---

## 🛡️ License

Built for Odoo Hackathon 2026. Distributed under the MIT License.
