# 🛍️ Ecommerce Web App

A full-stack ecommerce application with a React storefront, an Express API, and a PostgreSQL database. The main customer shopping flow is connected, with more features actively being developed.

## ✨ Technology

- **Frontend:** ⚛️ React 19 · 🟨 JavaScript (ES modules) · ⚡ Vite 8 · 🧭 React Router 7 · 🎨 CSS
- **Backend:** 🟢 Node.js · 🚂 Express 5 · 📦 CommonJS
- **Database:** 🐘 PostgreSQL · 🔌 `pg` · 🗃️ SQL migrations and seeds
- **Validation:** ✅ Zod
- **Authentication:** 🔐 JWT (RS256) · 🍪 HttpOnly session cookie · 🔒 `bcryptjs`
- **Cross-origin requests:** 🌐 `cors` with credentialed requests for the local frontend

### 🧰 Development tools

- 📦 npm for installing dependencies and running project scripts
- 🛠️ Vite for the frontend development server and production builds
- 🐘 PostgreSQL tools for applying database migrations and seeds

## 🗂️ Project layout

```text
backend/                 Express API and feature modules
database/migrations/     PostgreSQL schema migrations
database/seeds/          Initial database data
frontend/src/features/   React pages and feature components
```

The backend mounts its feature routes under `/api`. The frontend route composition is in `frontend/src/App.jsx`; React providers are initialized in `frontend/src/main.jsx`.

## 🚀 Current implementation

### ✅ Connected customer flows

- **Authentication:** registration and login call the API; the auth context checks the session with `/api/me` and supports logout.
- **Shop (`/shop`):** loads products, categories, brands, and product images. Catalog failures show an error and retry action.
- **Product details (`/products/:id`):** loads the product, its images, category, brand, and related products. Main product-load failures have a retry state.
- **Cart:** signed-in users load and modify their cart through authenticated API routes. Guests use browser `localStorage`; a warning is shown if guest-cart storage is unavailable. Cart operations and sync failures have UI feedback.
- **Checkout (`/checkout`):** loads saved addresses, can add an address, and submits an order from the signed-in user's cart. The backend creates order/payment records, updates stock, and clears the cart.
- **Account (`/account`):** shows the authenticated user's profile and role, can update profile details, and displays the user's orders and saved addresses. Request failures have visible messages and retry actions for the order/address lists.

### 🛠️ Work in progress

- **Payment integration:** checkout currently records the selected method as pending. Card and PayPal processing will be added when payment-provider integration is implemented.
- **Wishlist persistence:** shop and product-detail heart controls currently update local UI state; connecting them to the backend wishlist is planned.
- **Address management:** checkout can add an address, and the account page displays saved addresses. Editing and deleting addresses in the account experience remain future work.
- **Additional customer and operations features:** reviews, notifications, and delivery/admin workflows can be surfaced in the frontend as those flows are developed.
- **Deployment configuration:** the backend currently allows the local frontend origin, and some auth requests still use the local API URL directly. Production origins and environment-based URLs should be configured as deployment is prepared.
- **Automated tests:** the backend test script is still a placeholder; test coverage can be added as the features settle.
- **API consistency and security:** standardize response formats and continue strengthening API security as backend features grow.
- **Database performance:** review query patterns and add indexes where they improve product browsing, cart, order, and account queries.
- **Traffic handling:** explore queue-based load leveling for work that may need to handle traffic spikes as the store scales.
- **Storefront design:** continue refining the shopping experience across the shop, product details, cart, checkout, and account pages.


## 🧑‍💻 Local development

### Requirements

- Node.js and npm
- PostgreSQL

### 🗄️ Configure the database

1. Create a PostgreSQL database.
2. Copy `backend/.env.example` to `backend/.env` and set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` for your local database.
3. Apply the SQL files in `database/migrations/` in numeric order (`01_...` through `18_...`).
4. Apply `database/seeds/seeds_data_initial.sql` if you want the initial sample data.

Do not commit `backend/.env` or put real credentials in this README.

### ⚙️ Start the backend

```powershell
cd backend
npm install
npm start
```

The API listens on `http://localhost:8080`.

### 🎨 Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. The frontend defaults to the local API URL. Set `VITE_API_BASE_URL` in the frontend environment when using a different API origin. The backend CORS configuration must also allow the frontend origin and credentials.

## 🔍 Validation commands

From `frontend/`:

```powershell
npm run lint
npm run build
```

The backend currently has no implemented automated test suite.
