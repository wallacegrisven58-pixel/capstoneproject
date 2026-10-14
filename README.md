# ShopEZ: One-Stop Shop for Online Purchases

A MERN e-commerce project: shoppers browse a catalog, add to cart, check out and track orders; a seller dashboard manages orders, products and the storefront.

- **Client**: React (Vite), React Router, Axios
- **Server**: Node.js, Express, Mongoose (MVC), JWT login
- **Database**: MongoDB (collections: users, products, carts, orders, admins)

## Folder layout

```
shopez-mern/
  client/                 React app (port 5173)
    src/pages/            Home, ProductDetail, Auth, Cart, Checkout, OrderDetail, Profile
    src/pages/admin/      Dashboard, AllOrders, AllProducts, ProductForm, Storefront
    src/components/       Navbar, ProductCard, ProductArt, OrderBody
    src/context/          AuthContext (login session, cart count, toasts)
  server/                 Express API (port 8000)
    models/               User, Product, Cart, Orders, Admin   (Model layer)
    controllers/          auth, product, cart, order, admin      (Controller layer)
    routes/               one router per resource                (View/routing layer)
    middleware/           auth (JWT, admin check), error handling
    seed.js               admin account + sample products
```

## Requirements

Node.js 18 or newer, npm, and MongoDB (local with MongoDB Compass, or a free MongoDB Atlas cluster).

## Run it

**1. Server**

```bash
cd server
npm install
cp .env.example .env        # on Windows: copy .env.example .env
# edit .env if your MongoDB is not at mongodb://localhost:27017/shopez
npm run seed                # creates the seller account and 16 sample products
npm run dev                 # nodemon index.js  ->  http://localhost:8000
```

**2. Client** (in a second terminal)

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

The client forwards `/api` requests to port 8000 (see `client/vite.config.js`). To point it at another server, set `VITE_API_URL` before building.

## Accounts

| Role   | Email               | Password  |
|--------|---------------------|-----------|
| Seller | admin@shopez.demo   | admin123  |
| Buyer  | create one on the Log in page (Create account) |

## API summary

| Method | Path | Who | What |
|--------|------|-----|------|
| POST | /api/auth/register, /api/auth/login | anyone | create account, log in (returns JWT) |
| GET | /api/auth/me | user | current user |
| GET | /api/products | anyone | list; query: category, q, maxPrice, sort |
| GET | /api/products/:id | anyone | one product |
| POST/PUT/DELETE | /api/products, /api/products/:id | admin | manage products |
| POST | /api/products/:id/reviews | user | add a review |
| GET/POST/PUT/DELETE | /api/cart, /api/cart/:id | user | cart lines |
| POST | /api/orders | user | place an order (from cart, or a single "Shop Now" item) |
| GET | /api/orders/mine, /api/orders/:id | user | own orders |
| GET | /api/orders | admin | all orders; query: status |
| PUT | /api/orders/:id/status | admin | Placed, Packed, Shipped, Delivered |
| GET | /api/admin/settings | anyone | banner and categories |
| PUT | /api/admin/settings | admin | change banner and categories |
| GET | /api/admin/stats | admin | dashboard numbers |

## Notes

- Prices, shipping and totals are always recalculated on the server when an order is placed.
- Shipping is free from $75, otherwise $6.
- Payments are not processed. The chosen method is only recorded on the order.
- No emails are sent. The order confirmation is the confirmation page.
- Passwords are hashed with bcrypt. Change `JWT_SECRET` in `.env` before any real use.
"# capstoneproject" 
