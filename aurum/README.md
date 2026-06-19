# AURUM — Luxury Perfume Store
### React + Node.js + MySQL

---

## 📁 Project Structure

```
aurum/
├── database.sql          ← Import this into phpMyAdmin (XAMPP)
├── server/               ← Node.js Express API (backend)
│   ├── index.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
└── client/               ← React app (frontend)
    ├── public/
    └── src/
```

---

## 🗄️ Step 1 — Database (XAMPP)

1. Open **XAMPP** → Start **Apache** and **MySQL**
2. Open **phpMyAdmin** → `http://localhost/phpmyadmin`
3. Click **Import** → Choose `database.sql` → Click **Go**
4. Database `aurum_db` will be created with all tables and data ✅

---

## ⚙️ Step 2 — Backend (Node.js)

```bash
cd server
npm install
node index.js
```

Server runs on → **http://localhost:5000**

> **Default DB credentials** (edit `server/db.js` if needed):
> - Host: `localhost`
> - User: `root`
> - Password: *(empty)*
> - Database: `aurum_db`

---

## 💻 Step 3 — Frontend (React)

Open a **new terminal**:

```bash
cd client
npm install
npm start
```

React app runs on → **http://localhost:3001**

---

## 🔐 Admin Login

| Email             | Password  |
|-------------------|-----------|
| admin@aurum.com   | admin123  |

- Store: `http://localhost:3001`
- Admin: `http://localhost:3001/admin`

---

## ✅ Features

| Feature           | Description                                 |
|-------------------|---------------------------------------------|
| 🏪 Store          | Hero, product grid, brand browser, contact  |
| 🛒 Cart           | Persistent cart with size selection         |
| 💳 Checkout       | Full checkout → saved to DB as order        |
| 🔐 Auth           | JWT login/register, admin-protected routes  |
| 📊 Admin          | Dashboard, products, brands, orders, users  |
| ✉️ Messages       | Contact form → admin inbox with read/delete |
| 💳 Payments       | Toggle payment methods on/off from admin    |

---

## 🛠️ Requirements

- Node.js v18+
- XAMPP (Apache + MySQL)
- npm