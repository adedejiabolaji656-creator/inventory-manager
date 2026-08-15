# InventoryPro — Inventory Management System

A full-stack inventory management system.

**Tech Stack:** React + Tailwind CSS + Vite | Node.js + Express + MongoDB + Socket.io + JWT

## Features

- 🔐 **User Roles** — Admin / Manager / Staff with JWT authentication
- 📦 **Products** — Add, edit, and delete products with categories & SKUs
- ↔️ **Stock In / Stock Out** — Track inventory movements with reasons
- ⚠️ **Low-Stock Alerts** — Automatic stock status (in / low / out of stock)
- 🏢 **Suppliers** — Manage supplier CRUD
- 💰 **Sales Records** — Create sales, auto-decrement stock, invoice numbers
- 📊 **Dashboard** — Charts for sales trends, stock status, top products
- 📄 **Export Reports** — Download CSV reports for products, suppliers, sales, stock
- 🔔 **Real-time updates** — Socket.io broadcasts stock & sale changes

## Project Structure

```
inventory-system/
├── backend/          # Node.js + Express + MongoDB + Socket.io
│   ├── controllers/
│   ├── models/       # User, Product, Supplier, Sale, StockMovement
│   ├── routes/
│   ├── middleware/   # JWT auth, role authorization
│   ├── utils/        # Socket.io, JWT
│   ├── seed.js       # Seed demo data
│   └── server.js
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── components/
        ├── context/  # AuthContext
        ├── pages/    # Dashboard, Products, Stock, Suppliers, Sales, Reports
        └── services/ # API client, Socket.io
```

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally on `mongodb://localhost:27017`)

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
# configure .env if needed (see .env.example)
npm run seed    # seed demo data (optional)
npm run dev     # starts server on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:5173
```

Then open **http://localhost:5173**.

## Demo Accounts

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@inventory.com       | admin123     |
| Manager | manager@inventory.com     | manager123   |
| Staff   | staff@inventory.com       | staff123     |

## Role Permissions

- **Admin** — Full access (manage users, delete everything)
- **Manager** — Create/edit products, suppliers, stock, sales
- **Staff** — Record stock in/out and sales

## API Endpoints

| Method | Endpoint                  | Description                |
|--------|---------------------------|----------------------------|
| POST   | /api/auth/login           | Login                       |
| POST   | /api/auth/register        | Register (admin only)       |
| GET    | /api/auth/me              | Get current user            |
| GET/POST | /api/products           | List / create products      |
| GET/PUT/DELETE | /api/products/:id | Product details / update / delete |
| GET    | /api/products/categories  | List categories             |
| GET/POST | /api/stock             | Movements / list           |
| POST   | /api/stock/in             | Stock in                    |
| POST   | /api/stock/out            | Stock out                   |
| GET/POST | /api/suppliers         | List / create suppliers     |
| GET/PUT/DELETE | /api/suppliers/:id | Supplier details / update / delete |
| GET/POST | /api/sales             | List / create sales         |
| GET    | /api/dashboard            | Dashboard stats             |
| GET    | /api/dashboard/charts     | Chart data                  |
