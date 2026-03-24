import { createContext, useContext, useState, useEffect } from "react";
import { products as defaultProducts } from "../data/products";

const StoreContext = createContext(null);

const ORDERS_KEY   = "associate_store_orders";
const PRODUCTS_KEY = "associate_store_products";
const COUPONS_KEY  = "associate_store_coupons";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

export function StoreProvider({ children }) {
  const [cart, setCart]         = useState([]);
  const [orders, setOrders]     = useState(() => load(ORDERS_KEY, []));
  const [products, setProducts] = useState(() => load(PRODUCTS_KEY, defaultProducts));
  const [coupons, setCoupons]   = useState(() => load(COUPONS_KEY, [
    { id: "c1", code: "WELCOME10", type: "percent", value: 10, active: true, description: "10% off entire order" },
    { id: "c2", code: "SAVE5",     type: "fixed",   value: 5,  active: true, description: "$5 off entire order" },
  ]));
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => { localStorage.setItem(ORDERS_KEY,   JSON.stringify(orders));   }, [orders]);
  useEffect(() => { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(COUPONS_KEY,  JSON.stringify(coupons));  }, [coupons]);

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

  const applyCoupon = (code) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (coupon) { setAppliedCoupon(coupon); return { success: true, coupon }; }
    return { success: false };
  };
  const removeCoupon = () => setAppliedCoupon(null);
  const addCoupon    = (coupon) => { const n = { ...coupon, id: `c${Date.now()}` }; setCoupons(p => [...p, n]); return n; };
  const updateCoupon = (id, changes) => setCoupons(p => p.map(c => c.id === id ? { ...c, ...changes } : c));
  const deleteCoupon = (id) => setCoupons(p => p.filter(c => c.id !== id));

  const placeOrder = ({ name, email, department, paymentMethod, notes }) => {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      name, email, department, paymentMethod, notes,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        variants: i.variants,
        qty: i.qty,
        price: i.product.price,
        subtotal: i.product.price * i.qty,
      })),
      subtotal: cartSubtotal,
      discount,
      couponCode: appliedCoupon?.code || null,
      total: cartTotal,
      status: "pending",
      paid: false,
    };
    setOrders(prev => [order, ...prev]);
    clearCart();
    return order;
  };
  const updateOrder = (id, changes) => setOrders(p => p.map(o => o.id === id ? { ...o, ...changes } : o));
  const deleteOrder = (id) => setOrders(p => p.filter(o => o.id !== id));

  const addProduct    = (product) => { const n = { ...product, id: Date.now() }; setProducts(p => [...p, n]); return n; };
  const updateProduct = (id, changes) => setProducts(p => p.map(x => x.id === id ? { ...x, ...changes } : x));
  const deleteProduct = (id) => setProducts(p => p.filter(x => x.id !== id));

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
