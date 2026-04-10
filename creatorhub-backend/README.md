# ⚡ CreatorHub — Backend API

A production-ready Node.js + Express + SQLite backend for the CreatorHub freelance marketplace.

---

## 📁 Project Structure

```
creatorhub-backend/
├── config/
│   ├── database.js       ← SQLite connection
│   └── initDB.js         ← Creates all tables (run once)
├── controllers/
│   ├── authController.js     ← signup, login, getMe
│   ├── userController.js     ← CRUD for users
│   ├── serviceController.js  ← CRUD for services/gigs
│   ├── orderController.js    ← place orders, reviews
│   └── categoryController.js ← list categories
├── middleware/
│   ├── auth.js           ← JWT verification (protect, restrictTo)
│   ├── errorHandler.js   ← Global error handling
│   └── validate.js       ← Input validation rules
├── models/
│   ├── User.js           ← All user DB queries
│   ├── Service.js        ← All service DB queries
│   ├── Order.js          ← All order DB queries
│   └── Review.js         ← All review DB queries
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── serviceRoutes.js
│   ├── orderRoutes.js
│   └── categoryRoutes.js
├── api.js                ← Frontend fetch helper (copy to frontend)
├── server.js             ← Entry point
├── package.json
├── .env.example          ← Copy to .env and fill in
└── .gitignore
```

---

## 🚀 Setup Instructions (Step by Step)

### Step 1 — Install Node.js

Download and install Node.js (v18 or higher) from https://nodejs.org  
Verify installation:
```bash
node --version    # should print v18.x.x or higher
npm --version
```

### Step 2 — Get the project files

If you have a ZIP file, extract it. Then open a terminal in the `creatorhub-backend` folder:
```bash
cd creatorhub-backend
```

### Step 3 — Install all packages

```bash
npm install
```
This reads `package.json` and downloads all dependencies into a `node_modules/` folder.

### Step 4 — Create your .env file

```bash
# On Mac/Linux:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env
```

Open `.env` in a text editor and change `JWT_SECRET` to any long random string:
```
JWT_SECRET=myVeryLongSecretKeyChangeThis123456789
```

### Step 5 — Initialise the database (run ONCE)

```bash
node config/initDB.js
```

You should see:
```
✅  Database initialised successfully!
   Tables created: users, categories, services, orders, reviews
   Default categories seeded.
```
This creates a `database.sqlite` file in the project root.

### Step 6 — Start the server

```bash
# For development (auto-restarts on file change):
npm run dev

# For production:
npm start
```

You should see:
```
  ⚡  CreatorHub API
  🚀  Running on    → http://localhost:5000
  🌍  Environment   → development
```

### Step 7 — Test it!

Open your browser and visit: **http://localhost:5000**  
You should see: `⚡ CreatorHub API is running!`

---

## 🔌 Connect Your Frontend

1. Copy `api.js` from this backend folder into your **frontend folder** (next to `index.html`)

2. Add this script tag to the `<head>` of `login.html`, `signup.html`, and `index.html`:
```html
<script src="api.js"></script>
```
Make sure it appears **before** `script.js`.

3. Replace the `handleSignup()` function in your `script.js`:
```javascript
async function handleSignup() {
  let valid = true;
  const nameGroup  = document.getElementById('sg-name');
  const emailGroup = document.getElementById('sg-email');
  const passGroup  = document.getElementById('sg-pass');

  const name  = nameGroup.querySelector('input').value.trim();
  const email = emailGroup.querySelector('input').value.trim();
  const pass  = passGroup.querySelector('input').value;
  const role  = document.querySelector('input[name="role"]:checked')?.value || 'client';

  // Frontend validation
  if (!name)  { nameGroup.classList.add('error');  valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailGroup.classList.add('error'); valid = false;
  }
  if (pass.length < 8) { passGroup.classList.add('error'); valid = false; }
  if (!valid) return;

  try {
    await Auth.signup({ name, email, password: pass, role });
    alert('Account created successfully! Welcome to CreatorHub 🎉');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Error: ' + err.message);
  }
}
```

4. Replace the `handleLogin()` function:
```javascript
async function handleLogin() {
  let valid = true;
  const emailGroup = document.getElementById('lg-email');
  const passGroup  = document.getElementById('lg-pass');

  const email = emailGroup.querySelector('input').value.trim();
  const pass  = passGroup.querySelector('input').value;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailGroup.classList.add('error'); valid = false;
  }
  if (!pass) { passGroup.classList.add('error'); valid = false; }
  if (!valid) return;

  try {
    await Auth.login({ email, password: pass });
    alert('Logged in successfully! Welcome back 👋');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Error: ' + err.message);
  }
}
```

---

## 📡 API Endpoints Reference

### Auth

| Method | Endpoint                  | Auth Required | Description              |
|--------|---------------------------|---------------|--------------------------|
| POST   | `/api/auth/signup`        | ❌            | Register new user        |
| POST   | `/api/auth/login`         | ❌            | Login, returns JWT token |
| GET    | `/api/auth/me`            | ✅            | Get logged-in user       |
| PUT    | `/api/auth/change-password` | ✅          | Change password          |

### Users

| Method | Endpoint       | Auth | Description             |
|--------|----------------|------|-------------------------|
| GET    | `/api/users`   | ❌   | List all users          |
| GET    | `/api/users/:id` | ❌ | Get user + their services |
| PUT    | `/api/users/me` | ✅  | Update my profile       |
| DELETE | `/api/users/me` | ✅  | Deactivate my account   |

### Services

| Method | Endpoint           | Auth          | Description             |
|--------|--------------------|---------------|-------------------------|
| GET    | `/api/services`    | ❌            | List all services       |
| GET    | `/api/services/:id` | ❌           | Get single service      |
| POST   | `/api/services`    | ✅ (creator)  | Create new service      |
| PUT    | `/api/services/:id` | ✅ (owner)   | Update service          |
| DELETE | `/api/services/:id` | ✅ (owner)   | Delete service          |

**Query filters for GET /api/services:**
- `?search=logo` — keyword search
- `?category_id=1` — filter by category
- `?limit=10&offset=20` — pagination

### Orders

| Method | Endpoint                  | Auth | Description             |
|--------|---------------------------|------|-------------------------|
| GET    | `/api/orders`             | ✅   | My orders (`?role=client` or `?role=creator`) |
| POST   | `/api/orders`             | ✅   | Place an order          |
| GET    | `/api/orders/:id`         | ✅   | Get order details       |
| PATCH  | `/api/orders/:id/status`  | ✅   | Update order status     |
| POST   | `/api/orders/:id/review`  | ✅   | Leave a review          |

### Categories

| Method | Endpoint          | Auth | Description      |
|--------|-------------------|------|------------------|
| GET    | `/api/categories` | ❌   | List categories  |

---

## 📝 Example Request & Response

### POST /api/auth/signup
**Request body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "mypassword123",
  "role": "creator"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "role": "creator",
    "created_at": "2025-01-01T10:00:00"
  }
}
```

### POST /api/auth/login
**Request body:**
```json
{
  "email": "priya@example.com",
  "password": "mypassword123"
}
```

### POST /api/services (requires Bearer token)
**Request header:** `Authorization: Bearer <your_token>`  
**Request body:**
```json
{
  "title": "I will design a professional logo",
  "description": "High-quality logo design with unlimited revisions and source files included.",
  "price": 999,
  "delivery_days": 3,
  "category_id": 1,
  "tags": "logo,branding,design"
}
```

### POST /api/orders
```json
{
  "service_id": 1,
  "notes": "Please make the logo minimalist with blue colors."
}
```

### PATCH /api/orders/1/status
```json
{ "status": "completed" }
```

### POST /api/orders/1/review
```json
{
  "rating": 5,
  "comment": "Excellent work! Delivered on time."
}
```

---

## 🗃️ SQL Schema Summary

```sql
users       (id, name, email, password, role, avatar, bio, location, is_verified, is_active, created_at)
categories  (id, name, slug, icon, created_at)
services    (id, creator_id, category_id, title, description, price, delivery_days, image, tags, is_active, created_at)
orders      (id, service_id, client_id, creator_id, status, price, notes, created_at)
reviews     (id, order_id, service_id, client_id, rating, comment, created_at)
```

---

## 📦 Create a ZIP of the Project

### On Mac/Linux:
```bash
cd ..
zip -r creatorhub-backend.zip creatorhub-backend/ --exclude "*/node_modules/*" --exclude "*/.env" --exclude "*/database.sqlite"
```

### On Windows (PowerShell):
```powershell
Compress-Archive -Path creatorhub-backend -DestinationPath creatorhub-backend.zip
```
*(manually delete node_modules from the zip if it got included)*

---

## 🔒 Security Features

- **JWT tokens** — stateless authentication, expire after 7 days
- **bcrypt hashing** — passwords hashed with 12 salt rounds (never stored as plain text)
- **Helmet.js** — sets secure HTTP headers
- **Rate limiting** — 100 req/15min globally, 20 req/15min on auth endpoints
- **Input validation** — all inputs validated and sanitised before DB queries
- **Parameterised queries** — all SQL uses `?` placeholders (prevents SQL injection)
- **Soft deletes** — users/services are deactivated, not permanently deleted

---

## 🛠️ Tech Stack

| Package           | Purpose                          |
|-------------------|----------------------------------|
| Express.js        | Web framework                    |
| better-sqlite3    | SQLite database (zero config)    |
| bcryptjs          | Password hashing                 |
| jsonwebtoken      | JWT authentication               |
| express-validator | Input validation                 |
| helmet            | Security headers                 |
| cors              | Cross-origin resource sharing    |
| express-rate-limit | Brute-force protection          |
| morgan            | HTTP request logging             |
| nodemon           | Auto-restart in development      |
"# Creators-hub" 
