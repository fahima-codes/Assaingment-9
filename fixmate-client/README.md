# FixMate — Smart Device & Home Appliance Repair Service Platform

**FixMate** is a full-stack, role-based repair booking platform connecting
customers with verified repair technicians for smartphones, laptops, ACs,
refrigerators, TVs, washing machines, and electrical setups. Built with a
**pay-after-service** escrow model, customers only pay after the job is
successfully delivered and verified.

---

## 🚀 Live Site & Credentials

- **Live Application URL:** `http://localhost:3000`
- **Backend API URL:** `http://localhost:5000`

### 🔑 Test Accounts for Instant Evaluation

| Role             | Email               | Password       | Access & Capabilities                                                                   |
| :--------------- | :------------------ | :------------- | :-------------------------------------------------------------------------------------- |
| **Admin**        | `admin@fixmate.com` | `Admin123!`    | Moderate services, manage user roles, audit bookings, and track Stripe revenue          |
| **Technician 1** | `rahim@fixmate.com` | `Tech123!`     | Smartphone & Electrical expert — manage incoming requests, complete jobs, CRUD services |
| **Technician 2** | `karim@fixmate.com` | `Tech123!`     | HVAC & Refrigerator specialist — accept/reject, mark in-progress, input final amount    |
| **Customer**     | `sakib@fixmate.com` | `Customer123!` | Book repairs, track milestones, cancel requested jobs, pay completed jobs with Stripe   |

---

## 🛠️ Key Features

1. **Role-Based Access Control (RBAC):**
   - Distinct, protected dashboards for **Customer**, **Technician**, and
     **Admin**.
   - Strict server-enforced route guards preventing role crossing or
     unauthorized data access.

2. **Job Status Pipeline (Challenge 3):**
   - `requested` → `accepted` or `rejected` (technician) / `cancelled`
     (customer)
   - `accepted` → `in-progress` (technician starts work)
   - `in-progress` → `completed` (technician finalizes bill with `finalAmount`)
   - `completed` & `unpaid` → Stripe Checkout `paid` (customer payment gate)

3. **Server-Side Search, Filter, Sort & Pagination (Challenge 1):**
   - Live MongoDB search by service title and category.
   - Filtering by category (Smartphone, Laptop & PC, AC, Refrigerator, TV,
     Washing Machine, Electrical) and mode (Home Visit / Shop Drop-off).
   - Server-side sorting: Newest, Price: Low to High, Price: High to Low.
   - Persistent query params across reload and category links.

4. **Stripe Test Mode Payment & Webhook:**
   - Pay-after-service model: Pay Now button only appears when
     `status === 'completed'` and `paymentStatus === 'unpaid'`.
   - Stripe Checkout Session creation with verified database amount.
   - Double-save prevention via Stripe Webhook and verification endpoints.

5. **Service Moderation Center:**
   - Newly submitted services stay `pending` until Admin approval.
   - Any edits by technician automatically revert approval status to `pending`.

6. **Image Upload Integration:**
   - Direct file uploads for technician service banners and user profile photos
     via ImgBB API.

---

## 📦 NPM Packages Used

### Client (`fixmate-client`):

- `next`: ^14.2.5 (App Router, Server Components & Dynamic Routing)
- `react` & `react-dom`: ^18.2.0
- `better-auth`: MongoDB adapter authentication
- `lucide-react`: Modern icon set
- `sonner`: Toast notification system
- `tailwindcss`: Utility-first CSS styling
- `class-variance-authority` & `tailwind-merge`: UI utility styling

### Server (`fixmate-server`):

- `express`: REST API web framework
- `mongoose`: MongoDB ODM for data modeling
- `cors`: Cross-Origin Resource Sharing
- `jsonwebtoken`: Secure JWT token creation and verification middlewares
- `stripe`: Stripe Checkout & Webhook SDK
- `dotenv`: Environment configuration

---

## 🏃 Getting Started

### 1. Server Setup

```bash
cd Assaingment-9-server
npm install
node seed.js    # Seeds 14+ services, admin, technicians, customer, and sample bookings
npm start       # Runs on port 5000
```

### 2. Client Setup

```bash
cd fixmate-client
npm install
npm run dev     # Runs Next.js on port 3000
```

## live link:

https://assaingment-9.vercel.app/

## server link :

https://assaingment-9-server.vercel.app/
