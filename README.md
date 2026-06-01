# Online Fees Management System — MERN Stack

**Pandit S. N. Shukla University, Shahdol (M.P.)**

A full-stack MERN application for managing student fee collection. Deployed on Vercel (frontend + serverless API) with MongoDB Atlas as the database.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Bootstrap 5 |
| API | Vercel Serverless Functions (Node.js 20) |
| Database | MongoDB Atlas (free M0) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Routing | React Router v6 |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/online-fees-mern.git
cd online-fees-mern
npm install
```

### 2. Set up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up free
2. Create a **free M0 cluster** (any region)
3. In **Database Access** → Add user: `feesadmin` / choose a strong password
4. In **Network Access** → Add IP: `0.0.0.0/0` (allow all, needed for Vercel)
5. Click **Connect** → **Drivers** → copy the connection string

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://feesadmin:<password>@cluster0.xxxxx.mongodb.net/fees_db?retryWrites=true&w=majority
JWT_SECRET=pick_a_long_random_string_here_min_32_chars
NODE_ENV=development
```

### 4. Seed the database

```bash
node scripts/seed.js
```

This creates:
- **Admin**: `admin@fees.com` / `admin123`
- **Staff**: `priya@fees.com` / `staff123`
- **Student**: `rahul@student.com` / `student123` (and 4 more)
- 5 fee items for M.Sc. CS Semester 4

### 5. Run locally

```bash
npm run dev
```

Opens at `http://localhost:5173`. API requests proxy to Vercel dev server automatically.

For full serverless simulation locally:
```bash
npm install -g vercel
vercel dev
```

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial MERN fees management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/online-fees-mern.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. Add environment variables:
   - `MONGODB_URI` → your Atlas connection string
   - `JWT_SECRET` → your secret key
   - `NODE_ENV` → `production`
5. Click **Deploy**

### 3. Done!

Vercel gives you a URL like `https://online-fees-mern.vercel.app`.

---

## Project Structure

```
online-fees-mern/
├── api/                    # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.js        # POST /api/auth/login
│   │   └── me.js           # GET  /api/auth/me
│   ├── admin/
│   │   ├── dashboard.js    # GET  /api/admin/dashboard
│   │   ├── students.js     # CRUD /api/admin/students
│   │   ├── fees.js         # CRUD /api/admin/fees
│   │   ├── reports.js      # GET  /api/admin/reports
│   │   └── reminders.js    # GET/POST /api/admin/reminders
│   ├── staff/
│   │   ├── dashboard.js    # GET  /api/staff/dashboard
│   │   └── payments.js     # GET/POST /api/staff/payments
│   └── student/
│       ├── dashboard.js    # GET  /api/student/dashboard
│       ├── fees.js         # GET  /api/student/fees
│       ├── payments.js     # GET/POST /api/student/payments
│       ├── receipt.js      # GET  /api/student/receipt
│       └── profile.js      # GET/PUT /api/student/profile
├── lib/
│   ├── db.js               # MongoDB singleton (serverless-safe)
│   └── auth.js             # JWT verify helpers
├── models/
│   ├── Student.js
│   ├── AdminUser.js
│   ├── FeeStructure.js
│   ├── PaymentTransaction.js
│   └── FeeReminder.js
├── scripts/
│   └── seed.js             # Database seeder
├── src/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── admin/          # Dashboard, Students, Fees, Reports, Reminders
│   │   ├── staff/          # Dashboard, ViewPayments, ProcessPayment
│   │   └── student/        # Dashboard, FeeDetails, PaymentHistory, MakePayment, Receipt, Profile
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
└── .env.example
```

---

## Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@fees.com | admin123 |
| Staff | priya@fees.com | staff123 |
| Student | rahul@student.com | student123 |
| Student | anjali@student.com | student123 |
| Student | shivani@student.com | student123 |

> **Change these immediately in production!**

---

## Features

- **Admin**: Full student & fee management, reports with date filter, bulk fee reminders
- **Staff**: Process cash/DD/NEFT payments, view all transactions
- **Student**: View fees, pay online (simulated), download receipts, edit profile
- **Auth**: JWT with role-based access control (3 roles)
- **Security**: Passwords hashed with bcrypt (10 rounds), tokens expire in 8h

---

## License

MIT — Free to use for educational purposes.
