import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { products as defaultProducts } from "../data/products";
import {
  fetchOrders   as atFetchOrders,
  createOrder   as atCreateOrder,
  updateOrder   as atUpdateOrder,
  deleteOrder   as atDeleteOrder,
  fetchProducts as atFetchProducts,
  createProduct as atCreateProduct,
  updateProduct as atUpdateProduct,
  deleteProduct as atDeleteProduct,
} from "../data/airtable";

const StoreContext = createContext(null);

const COUPONS_KEY = "associate_store_coupons";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function StoreProvider({ children }) {
  const [cart, setCart]             = useState([]);
  const [orders, setOrders]         = useState([]);
  const [products, setProducts]     = useState([]);
  const [coupons, setCoupons]       = useState(() => load(COUPONS_KEY, [
    { id: "c1", code: "WELCOME10", type: "percent", value: 10, active: true, description: "10% off entire order" },
    { id: "c2", code: "SAVE5",     type: "fixed",   value: 5,  active: true, description: "$5 off entire order" },
  ]));
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [ordersLoading,  setOrdersLoading]  = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState(null);
  const [productsError, setProductsError] = useState(null);

  // Persist coupons locally — they're admin-configured and lightweight
  useEffect(() => {
    try { localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons)); } catch {}
  }, [coupons]);

  // ── Load products from Airtable on mount ──
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await atFetchProducts();
      // If no products in Airtable yet, seed with defaults (no images)
      if (data.length === 0) {
        const seeds = defaultProducts.map(p => ({ ...p, image: "", variantImages: {} }));
        // Create them all in Airtable
        await Promise.all(seeds.map(p => atCreateProduct(p)));
        const fresh = await atFetchProducts();
        setProducts(fresh);
      } else {
        setProducts(data);
      }
    } catch (e) {
      setProductsError(e.message);
      // Fall back to defaults so the shop still renders
      setProducts(defaultProducts.map(p => ({ ...p, image: "", variantImages: {} })));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // ── Load orders from Airtable on mount ──
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await atFetchOrders();
      setOrders(data);
    } catch (e) {
      setOrdersError(e.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadOrders();   }, [loadOrders]);

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
  const applyCoupon  = (code) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (coupon) { setAppliedCoupon(coupon); return { success: true, coupon }; }
    return { success: false };
  };
  const removeCoupon = () => setAppliedCoupon(null);
  const addCoupon    = (c)       => { const n = { ...c, id: `c${Date.now()}` }; setCoupons(p => [...p, n]); return n; };
  const updateCoupon = (id, chg) => setCoupons(p => p.map(c => c.id === id ? { ...c, ...chg } : c));
  const deleteCoupon = (id)      => setCoupons(p => p.filter(c => c.id !== id));

  // ── Orders ──
  const placeOrder = async ({ name, email, department, paymentMethod, notes }) => {
    const order = {
      id:            `ORD-${Date.now()}`,
      date:          new Date().toISOString(),
      name, email, department, paymentMethod,
      notes:         notes || "",
      items:         cart.map(i => ({
        productId:   i.product.id,
        productName: i.product.name,
        variants:    i.variants,
        qty:         i.qty,
        price:       i.product.price,
        subtotal:    i.product.price * i.qty,
      })),
      subtotal:      cartSubtotal,
      discount,
      couponCode:    appliedCoupon?.code || null,
      total:         cartTotal,
      status:        "pending",
      paid:          false,
    };
    // Save to Airtable
    const created = await atCreateOrder(order);
    const withRecord = { ...order, _recordId: created.id };
    setOrders(prev => [withRecord, ...prev]);
    clearCart();
    return withRecord;
  };

  const updateOrder = async (id, changes) => {
    const order = orders.find(o => o.id === id);
    if (!order?._recordId) return;
    await atUpdateOrder(order._recordId, changes);
    setOrders(p => p.map(o => o.id === id ? { ...o, ...changes } : o));
  };

  const deleteOrder = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order?._recordId) return;
    await atDeleteOrder(order._recordId);
    setOrders(p => p.filter(o => o.id !== id));
  };

  // ── Products ──
  const addProduct = async (product) => {
    const newProduct = { ...product, id: Date.now() };
    const created    = await atCreateProduct(newProduct);
    const withRecord = { ...newProduct, _recordId: created.id };
    setProducts(p => [...p, withRecord]);
    return withRecord;
  };

  const updateProduct = async (id, changes) => {
    const product = products.find(p => p.id === id);
    if (!product?._recordId) return;
    await atUpdateProduct(product._recordId, changes);
    setProducts(p => p.map(x => x.id === id ? { ...x, ...changes } : x));
  };

  const deleteProduct = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product?._recordId) return;
    await atDeleteProduct(product._recordId);
    setProducts(p => p.filter(x => x.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartSubtotal, discount, cartTotal, cartCount,
      appliedCoupon, applyCoupon, removeCoupon,
      coupons, addCoupon, updateCoupon, deleteCoupon,
      orders, ordersLoading, ordersError, loadOrders, placeOrder, updateOrder, deleteOrder,
      products, productsLoading, productsError, loadProducts, addProduct, updateProduct, deleteProduct,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
