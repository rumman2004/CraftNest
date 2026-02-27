<div align="center">

<img src="https://img.shields.io/badge/CraftNest-Handmade%20E--Commerce-d4b26a?style=for-the-badge&logoColor=white" alt="CraftNest" />

<br />
<br />

# 🧵 CraftNest

### A full-stack handmade crafts e-commerce platform where artisans showcase their work and buyers discover unique, handcrafted products from around the world.

<br />

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br />

[🌐 Live Demo](https://craftnest-six.vercel.app/) &nbsp;·&nbsp;
[🐛 Report Bug](https://github.com/rumman2004/craftnest/issues) &nbsp;·&nbsp;
[✨ Request Feature](https://github.com/rumman2004/craftnest/issues)

<br />

<!-- Replace with your actual screenshot -->
![CraftNest Banner](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169130/portfolio/1772169129922-Screenshot%202026-02-27%20104146.png?text=CraftNest+—+Handmade+Crafts+Marketplace)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About the Project

**CraftNest** is a production-ready MERN stack e-commerce application built for handmade crafts. It features a complete shopping experience for users and a powerful management dashboard for admins — all wrapped in a polished, fully responsive UI with smooth Framer Motion animations.

The standout first impression is the **multilingual welcome splash** — cycling "Welcome" through **18 languages** with 3D letter-flip animations, animated background orbs, and a progress tracker — making every login feel genuinely special.

> Built entirely from scratch — every screen, animation, and API endpoint.

---

## ✨ Features

### 👤 User Side

| Feature | Description |
|---|---|
| 🌍 Welcome Splash | Multilingual animation across 18 languages with 3D flip transitions |
| 🔐 Authentication | Secure JWT-based register / login / logout |
| 🛍️ Product Browsing | Filter by category, search by name, sort by price |
| 🛒 Cart Management | Add, remove, update quantity with free shipping progress bar |
| 📦 Multi-step Checkout | Shipping → Payment → Review → Confirmation |
| 📬 Order Tracking | Animated progress timeline (Placed → Confirmed → Shipped → Delivered) |
| 👤 Profile Management | Update personal info — auto-fills on checkout |
| 📱 Fully Responsive | Mobile-first design — compact layouts for every screen size |

### 🔧 Admin Side

| Feature | Description |
|---|---|
| 📊 Dashboard | Sales analytics, revenue overview, recent orders |
| 📦 Product Management | Create, edit, delete products with Cloudinary image upload |
| 🧾 Order Management | View all orders, update order status |
| 👥 User Management | View and manage registered users |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React.js](https://reactjs.org/) | UI component library |
| [React Router DOM](https://reactrouter.com/) | Client-side routing |
| [Framer Motion](https://www.framer.com/motion/) | Animations & transitions |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Icon system |
| [Axios](https://axios-http.com/) | HTTP client |
| [React Hot Toast](https://react-hot-toast.com/) | Toast notifications |
| [Context API](https://reactjs.org/docs/context.html) | Auth, Cart, global state |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime environment |
| [Express.js](https://expressjs.com/) | REST API framework |
| [MongoDB](https://www.mongodb.com/) | NoSQL database |
| [Mongoose](https://mongoosejs.com/) | MongoDB object modeling |
| [JSON Web Token](https://jwt.io/) | Authentication |
| [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [Cloudinary](https://cloudinary.com/) | Image storage & optimization |
| [Multer](https://github.com/expressjs/multer) | File upload middleware |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variables |
| [CORS](https://github.com/expressjs/cors) | Cross-origin resource sharing |

### Deployment

| Service | Usage |
|---|---|
| [Vercel](https://vercel.com/) | Frontend + serverless backend |
| [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Cloud database |
| [Cloudinary](https://cloudinary.com/) | Media CDN |

---

## 📁 Project Structure
```Folders
craftnest/
│
├── client/                          # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/              # Shared UI — Spinner, Navbar, Footer
│       │   ├── sections/            # FeaturedProducts, Hero, etc.
│       │   └── admin/               # Admin-only components
│       │
│       ├── context/
│       │   ├── AuthContext.jsx      # Authentication state
│       │   └── CartContext.jsx      # Cart state + actions
│       │
│       ├── pages/
│       │   ├── user/
│       │   │   ├── UserHome.jsx     # Dashboard + welcome splash
│       │   │   ├── Cart.jsx         # Cart page
│       │   │   ├── Checkout.jsx     # Multi-step checkout
│       │   │   ├── OrderDetail.jsx  # Single order detail
│       │   │   ├── Orders.jsx       # All orders list
│       │   │   └── Profile.jsx      # User profile
│       │   │
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── ManageProducts.jsx
│       │   │   ├── ManageOrders.jsx
│       │   │   └── ManageUsers.jsx
│       │   │
│       │   ├── Home.jsx             # Landing page
│       │   ├── Shop.jsx             # Product listing
│       │   ├── ProductDetail.jsx    # Single product
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       │
│       ├── services/
│       │   └── api.js               # All Axios API calls
│       │
│       └── App.jsx                  # Routes + providers
│
├── server/                          # Express backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── cloudinary.js            # Cloudinary config
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verify + role guard
│   │   └── uploadMiddleware.js      # Multer + Cloudinary
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   │
│   └── index.js                     # Entry point
│
├── .env.example
├── .gitignore
└── README.md
```
---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **npm** v9+ or **yarn**
- **MongoDB** — local or [Atlas cloud](https://www.mongodb.com/cloud/atlas)
- **Cloudinary account** — [Sign up free](https://cloudinary.com/)
- **Git** — [Download](https://git-scm.com/)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/craftnest.git
cd craftnest
```

**2. Install backend dependencies**

```bash
cd server
npm install
```

**3. Install frontend dependencies**

```bash
cd ../client
npm install
```

---

### Environment Variables

#### Backend — `server/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/craftnest

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

#### Frontend — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env` files. An `.env.example` is provided for reference.

---

### Running Locally

**Start the backend server**

```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Start the frontend dev server** (new terminal)

```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

**Seed the database** *(optional — adds sample products)*

```bash
cd server
npm run seed
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login + get JWT | Public |
| `GET` | `/api/auth/me` | Get current user | Private |
| `PUT` | `/api/auth/profile` | Update profile | Private |

### Products

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/products` | Get all products | Public |
| `GET` | `/api/products/:id` | Get single product | Public |
| `GET` | `/api/products/featured` | Get featured products | Public |
| `POST` | `/api/products` | Create product | Admin |
| `PUT` | `/api/products/:id` | Update product | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

### Orders

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Create new order | Private |
| `GET` | `/api/orders/my` | Get my orders | Private |
| `GET` | `/api/orders/:id` | Get order by ID | Private |
| `GET` | `/api/orders` | Get all orders | Admin |
| `PUT` | `/api/orders/:id/status` | Update order status | Admin |

### Users *(Admin)*

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/users` | Get all users | Admin |
| `GET` | `/api/users/:id` | Get user by ID | Admin |
| `DELETE` | `/api/users/:id` | Delete user | Admin |

---

## 📸 Screenshots

<div align="center">

| Welcome Splash | Home Dashboard |
|---|---|
| ![Splash](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169522/Screenshot_2026-02-27_103933_prtwqx.png?text=Welcome+Splash) | ![Home](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169521/Screenshot_2026-02-27_104545_fndbax.png?text=User+Home) |

| Shop Page | Cart |
|---|---|
| ![Shop](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169521/Screenshot_2026-02-27_104529_xjzha5.png?text=Shop+Page) | ![Cart](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169520/Screenshot_2026-02-27_104637_gs7ufk.png?text=Cart+Page) |

| Checkout | Order Detail |
|---|---|
| ![Checkout](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169520/Screenshot_2026-02-27_104726_lujvd6.png?text=Checkout) | ![Order](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169520/Screenshot_2026-02-27_104746_fstaer.png?text=Order+Detail) |

| Admin Dashboard | Manage Products |
|---|---|
| ![Admin](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169520/Screenshot_2026-02-27_104811_wjfkpw.png?text=Admin+Dashboard) | ![Products](https://res.cloudinary.com/dtbytfxzs/image/upload/v1772169520/Screenshot_2026-02-27_104823_dglcac.png?text=Manage+Products) |

</div>

---

## 🌐 Deployment

### Frontend + Backend on Vercel

**1. Push your code to GitHub**

```bash
git add .
git commit -m "initial commit"
git push origin main
```

**2. Deploy backend**

- Go to [vercel.com](https://vercel.com) → New Project → Import `server/`
- Add all environment variables from `server/.env`
- Set **Output Directory** to `.` and **Root Directory** to `server`
- Add a `vercel.json` in `/server`:

```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.js" }]
}
```

**3. Deploy frontend**

- New Project → Import `client/`
- Set `VITE_API_URL` to your deployed backend URL
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

---

## 🗺 Roadmap

- [x] User authentication (JWT)
- [x] Product listing & filtering
- [x] Cart & checkout flow
- [x] Order tracking
- [x] Admin dashboard
- [x] Cloudinary image uploads
- [x] Fully responsive UI
- [x] Multilingual welcome splash
- [ ] Razorpay / Stripe payment integration
- [ ] Product reviews & ratings
- [ ] Wishlist / favourites
- [ ] Email order confirmation (Nodemailer)
- [ ] SMS notifications (Twilio)
- [ ] PWA support
- [ ] Advanced analytics for admins
- [ ] Coupon & discount codes

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place. Any contributions you make are **greatly appreciated**.

```bash
# 1. Fork the project
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m "Add AmazingFeature"

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

Please make sure to:
- Follow the existing code style
- Update documentation if needed
- Test your changes before submitting a PR

---

## 📄 License

Distributed under the **MIT License**.


MIT License — feel free to use this project for personal or commercial purposes.
Attribution appreciated but not required.

See [`LICENSE`](./LICENSE) for full text.

---

## 📬 Contact

**Your Name**
- LinkedIn: [linkedin.com/in/rummanahmed04](https://linkedin.com/in/rummanahmed04)
- GitHub: [@rumman2004](https://github.com/rumman2004)
- Email: your.email@example.com

**Project Link:** [https://github.com/rummanahmed04/CraftNest](https://github.com/rummanahmed04/CraftNest)

---

<div align="center">

Made with ❤️ and a lot of ☕

⭐ **Star this repo if you found it helpful!** ⭐

<img src="https://img.shields.io/badge/Built%20with-MERN%20Stack-d4b26a?style=for-the-badge" />
<img src="https://img.shields.io/badge/Design-Mobile%20First-13213c?style=for-the-badge" />
<img src="https://img.shields.io/badge/Animations-Framer%20Motion-264670?style=for-the-badge" />

</div>
