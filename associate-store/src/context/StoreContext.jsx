import { createContext, useContext, useState, useEffect } from "react";
import { products as defaultProducts } from "../data/products";

const StoreContext = createContext(null);

const ORDERS_KEY        = "associate_store_orders";
const PRODUCTS_META_KEY = "associate_store_products_meta";   // products WITHOUT images
const PRODUCTS_IMG_KEY  = "associate_store_products_images"; // images only, keyed by product id
const COUPONS_KEY       = "associate_store_coupons";

// Safe localStorage set — never crashes the app if storage is full
function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`localStorage full — could not save "${key}". Try clearing old data.`);
    return false;
  }
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

// Split a product list into metadata (no images) and an image map
function splitProducts(products) {
  const meta = products.map(p => {
    const { image, variantImages, ...rest } = p;
    return rest;
  });
  const images = {};
  products.forEach(p => {
    if (p.image || p.variantImages) {
      images[p.id] = { image: p.image || "", variantImages: p.variantImages || {} };
    }
  });
  return { meta, images };
}

// Recombine metadata and images into full product objects
function mergeProducts(meta, images) {
  return meta.map(p => ({
    ...p,
    image: images[p.id]?.image || "",
    variantImages: images[p.id]?.variantImages || {},
  }));
}

export function StoreProvider({ children }) {
  // Load products by merging stored meta + stored images
  const [products, setProducts] = useState(() => {
    const meta   = load(PRODUCTS_META_KEY, null);
    const images = load(PRODUCTS_IMG_KEY, {});
    if (meta) return mergeProducts(meta, images);
    return defaultProducts.map(p => ({ ...p, image: p.image || "", variantImages: p.variantImages || {} }));
  });

  const [cart, setCart]       = useState([]);
  const [orders, setOrders]   = useState(() => load(ORDERS_KEY, []));
  const [coupons, setCoupons] = useState(() => load(COUPONS_KEY, [
    { id: "c1", code: "WELCOME10", type: "percent", value: 10, active: true, description: "10% off entire order" },
    { id: "c2", code: "SAVE5",     type: "fixed",   value: 5,  active: true, description: "$5 off entire order" },
  ]));
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Save orders and coupons normally — they contain no images
  useEffect(() => { safeSave(ORDERS_KEY,  orders);  }, [orders]);
  useEffect(() => { safeSave(COUPONS_KEY, coupons); }, [coupons]);

  // Save products split across two keys so images don't crowd out orders
  useEffect(() => {
    const { meta, images } = splitProducts(products);
    safeSave(PRODUCTS_META_KEY, meta);
    safeSave(PRODUCTS_IMG_KEY,  images);
  }, [products]);

  // ── Cart ──
  const addToCart = (product, variants, qty = 1) => {
    const key = `${product.id}-${JSON.stringify(variants)}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { key, product, variants, qty }];
    });
  };
  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };
  const clearCart = () => { setCart([]); setAppliedCoupon(null); };

  const cartSubtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? cartSubtotal * (appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, cartSubtotal)
    : 0;
  const cartTotal = Math.max(0, cartSubtotal - discount);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── Coupons ──
  const applyCoupon = (code) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (coupon) { setAppliedCoupon(coupon); return { success: true, coupon }; }
    return { success: false };
  };
  const removeCoupon = () => setAppliedCoupon(null);
  const addCoupon    = (c)        => { const n = { ...c, id: `c${Date.now()}` }; setCoupons(p => [...p, n]); return n; };
  const updateCoupon = (id, chg)  => setCoupons(p => p.map(c => c.id === id ? { ...c, ...chg } : c));
  const deleteCoupon = (id)       => setCoupons(p => p.filter(c => c.id !== id));

  // ── Orders ──
  const placeOrder = ({ name, email, department, paymentMethod, notes }) => {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      name, email, department, paymentMethod, notes,
      // Only store lightweight order line items — no image data
      items: cart.map(i => ({
        productId:   i.product.id,
        productName: i.product.name,
        variants:    i.variants,
        qty:         i.qty,
        price:       i.product.price,
        subtotal:    i.product.price * i.qty,
      })),
      subtotal:   cartSubtotal,
      discount,
      couponCode: appliedCoupon?.code || null,
      total:      cartTotal,
      status:     "pending",
      paid:       false,
    };
    setOrders(prev => [order, ...prev]);
    clearCart();
    return order;
  };
  const updateOrder = (id, chg) => setOrders(p => p.map(o => o.id === id ? { ...o, ...chg } : o));
  const deleteOrder = (id)      => setOrders(p => p.filter(o => o.id !== id));

  // ── Products ──
  const addProduct    = (p)        => { const n = { ...p, id: Date.now() }; setProducts(prev => [...prev, n]); return n; };
  const updateProduct = (id, chg)  => setProducts(p => p.map(x => x.id === id ? { ...x, ...chg } : x));
  const deleteProduct = (id)       => setProducts(p => p.filter(x => x.id !== id));

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartSubtotal, discount, cartTotal, cartCount,
      appliedCoupon, applyCoupon, removeCoupon,
      coupons, addCoupon, updateCoupon, deleteCoupon,
      orders, placeOrder, updateOrder, deleteOrder,
      products, addProduct, updateProduct, deleteProduct,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
