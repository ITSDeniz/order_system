# order-system

A food ordering web app. Users browse restaurants, add items to a cart, and place orders. Admins manage menus and update order statuses through a dashboard.

Built with React on the frontend, Express/Node on the backend, and MySQL for storage.

## Stack

- **Frontend** — React + Vite, React Router
- **Backend** — Node.js, Express
- **Database** — MySQL (mysql2)
- **Auth** — JWT (jsonwebtoken) + bcryptjs

## Setup

**Requirements:** Node.js 18+, MySQL

### 1. Database

Import `init.sql` to create and seed the database:

```sh
mysql -u root -p < init.sql
```

### 2. Backend

Create `backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=order_db
JWT_SECRET=change_this_to_something_random
```

```sh
cd backend
npm install
node server.js
# runs on localhost:5000
```

### 3. Frontend

```sh
cd frontend
npm install
npm run dev
# runs on localhost:5173
```

## Demo

Admin login: `admin@order.com` / `admin123`

## Notes

- Users can only see and cancel their own orders
- Order cancellation is only allowed while status is `Pending`
- Routes requiring admin access return 403 for regular users
