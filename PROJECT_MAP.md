# PMTC Trading Portal — Complete Project Map
**Client:** Padma Mitra Trading Company (PMTC)
**Stack:** React + Vite + TailwindCSS + Supabase + Framer Motion

---

## 🗂 Folder Structure

```
pmtc-trading/
├── public/
│   └── logo.png                    ← PMTC company logo
├── src/
│   ├── main.jsx                    ← App entry point
│   ├── App.jsx                     ← Router setup
│   ├── styles/
│   │   └── globals.css             ← Tailwind + custom CSS vars
│   ├── lib/
│   │   ├── supabase.js             ← Supabase client init
│   │   └── utils.js                ← Currency formatter, date helpers
│   ├── data/
│   │   └── seed.sql                ← Sample data for Supabase
│   ├── hooks/
│   │   ├── useAuth.js              ← Auth context + login/logout
│   │   ├── useCart.js              ← Cart state (localStorage)
│   │   ├── useProducts.js          ← Product queries
│   │   └── useOrders.js            ← Orders CRUD
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Navbar.jsx          ← Customer navbar with cart icon
│   │   │   ├── Footer.jsx          ← Footer with contact info
│   │   │   ├── ProductCard.jsx     ← Reusable product card
│   │   │   ├── Badge.jsx           ← Status badge (in stock, etc.)
│   │   │   └── LoadingSpinner.jsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.jsx    ← Sidebar navigation
│   │   │   ├── AdminHeader.jsx     ← Top bar with admin name
│   │   │   ├── StatCard.jsx        ← Dashboard metric cards
│   │   │   └── DataTable.jsx       ← Reusable sortable table
│   │   └── customer/
│   │       ├── HeroSection.jsx     ← Homepage hero banner
│   │       ├── BrandStrip.jsx      ← Bosch, Makita, Ingco logos
│   │       └── CategoryGrid.jsx    ← Category cards
│   └── pages/
│       ├── customer/
│       │   ├── Home.jsx            ← Landing page
│       │   ├── Products.jsx        ← All products with filters
│       │   ├── ProductDetail.jsx   ← Single product view
│       │   ├── Categories.jsx      ← Browse by category
│       │   ├── Cart.jsx            ← Shopping cart
│       │   ├── Search.jsx          ← Search results
│       │   ├── Contact.jsx         ← Contact form
│       │   ├── Login.jsx           ← Customer login
│       │   ├── Register.jsx        ← Sign up
│       │   ├── Account.jsx         ← My account / orders
│       │   └── ForgotPassword.jsx
│       └── admin/
│           ├── AdminLogin.jsx      ← Separate admin login
│           ├── Dashboard.jsx       ← Overview metrics
│           ├── AdminProducts.jsx   ← CRUD products
│           ├── AdminOrders.jsx     ← View & update orders
│           ├── AdminCategories.jsx ← Manage categories
│           ├── AdminUsers.jsx      ← View customers
│           ├── AdminAnalytics.jsx  ← Charts & reports
│           ├── AdminNotifications.jsx
│           └── AdminSettings.jsx  ← Store config
├── .env.local                      ← Supabase keys (never commit!)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🗄 Database Schema (Supabase / PostgreSQL)

### Table: `users` (extends Supabase auth.users)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | from auth.users |
| full_name | text | |
| phone | text | |
| address | text | |
| city | text | |
| state | text | |
| is_admin | boolean | default false |
| created_at | timestamptz | |

### Table: `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | "Power Tools", "Hand Tools"… |
| slug | text | unique |
| image_url | text | |
| description | text | |

### Table: `brands`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | Bosch, Makita, Ingco… |
| logo_url | text | |

### Table: `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| slug | text | unique |
| description | text | |
| price | numeric(10,2) | |
| mrp | numeric(10,2) | original/MRP price |
| stock | integer | |
| sku | text | |
| category_id | uuid FK → categories | |
| brand_id | uuid FK → brands | |
| images | text[] | array of URLs |
| is_active | boolean | |
| is_featured | boolean | |
| created_at | timestamptz | |

### Table: `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_number | text | e.g. PMTC-2024-0001 |
| user_id | uuid FK → users | |
| status | text | pending/confirmed/shipped/delivered/cancelled |
| total_amount | numeric(10,2) | |
| shipping_address | jsonb | {name, phone, address, city, state, pincode} |
| payment_method | text | COD/UPI/Bank Transfer |
| payment_status | text | pending/paid/failed |
| notes | text | |
| created_at | timestamptz | |

### Table: `order_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| product_id | uuid FK → products | |
| quantity | integer | |
| unit_price | numeric(10,2) | price at time of order |
| total_price | numeric(10,2) | |

### Table: `notifications`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| message | text | |
| type | text | order/stock/system |
| is_read | boolean | |
| created_at | timestamptz | |

### Table: `settings`
| Column | Type | Notes |
|---|---|---|
| key | text PK | |
| value | text | |
| description | text | |

---

## 🔐 Auth Flow

```
Customer:
  /Login → Supabase email+password auth → redirect /
  /Register → create account + insert users row
  /ForgotPassword → Supabase resetPasswordForEmail

Admin:
  /admin-login → check is_admin = true → redirect /admin/Dashboard
  Protected by AdminRoute wrapper (checks is_admin)
```

---

## 📦 Key npm Packages

```json
{
  "react": "^18",
  "react-dom": "^18",
  "react-router-dom": "^6",
  "@supabase/supabase-js": "^2",
  "framer-motion": "^11",
  "recharts": "^2",
  "@tanstack/react-query": "^5",
  "react-hot-toast": "^2",
  "lucide-react": "^0.383",
  "tailwindcss": "^3",
  "@headlessui/react": "^2"
}
```

---

## 🌐 Pages & Routes

| Route | Component | Auth |
|---|---|---|
| `/` | Home | Public |
| `/products` | Products | Public |
| `/products/:slug` | ProductDetail | Public |
| `/categories` | Categories | Public |
| `/search` | Search | Public |
| `/contact` | Contact | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | ForgotPassword | Public |
| `/cart` | Cart | Public |
| `/account` | Account | Customer Auth |
| `/admin-login` | AdminLogin | Public |
| `/admin/dashboard` | Dashboard | Admin Auth |
| `/admin/products` | AdminProducts | Admin Auth |
| `/admin/orders` | AdminOrders | Admin Auth |
| `/admin/categories` | AdminCategories | Admin Auth |
| `/admin/users` | AdminUsers | Admin Auth |
| `/admin/analytics` | AdminAnalytics | Admin Auth |
| `/admin/notifications` | AdminNotifications | Admin Auth |
| `/admin/settings` | AdminSettings | Admin Auth |

---

## ⚙️ Environment Variables (.env.local)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local (fill in your Supabase credentials)
cp .env.example .env.local

# 3. Run database migrations
# → Go to Supabase Dashboard → SQL Editor → paste src/data/seed.sql

# 4. Start dev server
npm run dev

# 5. Build for production
npm run build
```

## 🎨 Design System

- **Primary Color:** #1E3A5F (Deep Navy)
- **Accent:** #F97316 (Orange — industrial energy)
- **Success:** #16A34A (Green)
- **Font:** Space Grotesk (headings) + Inter (body)
- **Border Radius:** 12px cards, 8px buttons
