# Associate Store

A complete internal company merchandise store built with React + Vite.
Deployable to Netlify or Vercel for free.

---

## Features

- **Storefront** — 15 placeholder products with category filtering and search
- **Product variants** — size, color, etc. with selector UI
- **Cart** — add, remove, update quantities
- **Checkout** — collects name, email, department, payment method, notes
- **Payment support** — Venmo, PayPal.me, Zelle, Payroll Deduction
- **Order confirmation** — shows payment instructions with deep link
- **Admin dashboard** — view all orders, mark paid/unpaid, change status, export CSV
- **Persistent storage** — orders saved to localStorage (survive page refresh)

---

## Quick Start (local development)

```bash
cd associate-store
npm install
npm run dev
```

Open http://localhost:5173

---

## Deploy to Netlify (free)

### Option A — Netlify Drop (no account needed, instant)
1. Run: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag and drop the `dist/` folder
4. You get a live URL immediately (e.g. `https://random-name.netlify.app`)

### Option B — Netlify + GitHub (auto-deploys on every push)
1. Push this folder to a GitHub repo
2. Go to https://netlify.com → "Add new site" → "Import from Git"
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Click Deploy — done!

### Option C — Vercel
1. Push to GitHub
2. Go to https://vercel.com → "New Project" → import repo
3. Framework preset: **Vite**
4. Click Deploy

---

## Customization Checklist

### 1. Update company info
Edit `src/components/Header.jsx`:
- Change "YOUR COMPANY" to your company name
- Change "Associate Store" tagline if desired

### 2. Update your products
Edit `src/data/products.js`:
- Replace placeholder products with your real merchandise
- Add/remove variants (size, color, etc.) per product
- Set real prices

### 3. Update payment handles
Edit `src/data/products.js` → `paymentMethods` array:
```js
{ id: "venmo",   handle: "@YourCompany-Store", link: "https://venmo.com/YourCompany-Store" },
{ id: "paypal",  handle: "paypal.me/YourCompanyStore", link: "https://paypal.me/YourCompanyStore" },
{ id: "zelle",   handle: "store@yourcompany.com", link: null },
{ id: "payroll", handle: "Submit HR form #47",    link: null },
```

### 4. Add real product images (optional)
In `src/data/products.js`, set `image: "/images/product-name.jpg"` for each product.
Place images in the `public/images/` folder.

Then in `src/components/ProductCard.jsx`, replace the emoji placeholder block with:
```jsx
{product.image
  ? <img src={product.image} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
  : <span style={{ fontSize: 56 }}>{emoji}</span>
}
```

### 5. Change brand color
Find `#A22325` across all files and replace with your brand color.

---

## Admin Dashboard

Navigate to the **Admin** tab in the header.

Features:
- Stats: total orders, revenue, collected, outstanding
- Filter by status and paid/unpaid
- Search by name, email, or order ID
- Click any row to expand full order details
- Toggle "Paid" checkbox per order
- Change order status (Pending → Processing → Fulfilled → Cancelled)
- Export all orders to CSV

> **Note:** Orders are stored in the browser's localStorage. This means:
> - Orders persist across page refreshes
> - Orders are per-browser (admin and employee see different data if on different devices)
>
> For a shared backend, see the "Upgrading to a shared backend" section below.

---

## Upgrading to a shared backend (optional, later)

If you want all admins to see the same orders across devices, the easiest free option is:

**Airtable** (free tier) as a database:
1. Create an Airtable base with an Orders table
2. Use their REST API to POST new orders and GET order lists
3. Replace the localStorage logic in `src/context/StoreContext.jsx`

This takes about 2 hours and keeps hosting free.
