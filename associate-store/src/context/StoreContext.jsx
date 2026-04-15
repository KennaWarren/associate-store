import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { products as defaultProducts } from "../data/products";
import {
  fetchOrders      as atFetchOrders,
  createOrder      as atCreateOrder,
  updateOrder      as atUpdateOrder,
  deleteOrder      as atDeleteOrder,
  fetchProducts    as atFetchProducts,
  createProduct    as atCreateProduct,
  updateProduct    as atUpdateProduct,
  deleteProduct    as atDeleteProduct,
  fetchSuggestions as atFetchSuggestions,
  createSuggestion as atCreateSuggestion,
  updateSuggestion as atUpdateSuggestion,
  deleteSuggestion as atDeleteSuggestion,
  sendPayrollEmail,
} from "../data/airtable";

const StoreContext = createContext(null);
const COUPONS_KEY  = "associate_store_coupons";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function StoreProvider({ children }) {
  const [cart, setCart]               = useState([]);
  const [orders, setOrders]           = useState([]);
  const [products, setProducts]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [coupons, setCoupons]         = useState(() => load(COUPONS_KEY, [
    { id:"c1", code:"WELCOME10", type:"percent", value:10, active:true, description:"10% off entire order" },
    { id:"c2", code:"SAVE5",     type:"fixed",   value:5,  active:true, description:"$5 off entire order" },
  ]));
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [ordersLoading,      setOrdersLoading]      = useState(true);
  const [productsLoading,    setProductsLoading]     = useState(true);
  const [suggestionsLoading, setSuggestionsLoading]  = useState(true);
  const [ordersError,        setOrdersError]         = useState(null);
  const [productsError,      setProductsError]       = useState(null);

  useEffect(() => {
    try { localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons)); } catch {}
  }, [coupons]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true); setProductsError(null);
    try {
      const data = await atFetchProducts();
      if (data.length === 0) {
        const seeds = defaultProducts.map(p => ({ ...p, image:"", variantImages:{} }));
        await Promise.all(seeds.map(p => atCreateProduct(p)));
        const fresh = await atFetchProducts();
        setProducts(fresh);
      } else {
        setProducts(data);
      }
    } catch (e) {
      setProductsError(e.message);
      setProducts(defaultProducts.map(p => ({ ...p, image:"", variantImages:{} })));
    } finally { setProductsLoading(false); }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true); setOrdersError(null);
    try { const data = await atFetchOrders(); setOrders(data); }
    catch (e) { setOrdersError(e.message); }
    finally { setOrdersLoading(false); }
  }, []);

  const loadSuggestions = useCallback(async () => {
    setSuggestionsLoading(true);
    try { const data = await atFetchSuggestions(); setSuggestions(data); }
    catch (e) { console.warn("Suggestions load failed:", e.message); }
    finally { setSuggestionsLoading(false); }
  }, []);

  useEffect(() => { loadProducts();    }, [loadProducts]);
  useEffect(() => { loadOrders();      }, [loadOrders]);
  useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

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
    if (coupon) { setAppliedCoupon(coupon); return { success:true, coupon }; }
    return { success:false };
  };
  const removeCoupon = () => setAppliedCoupon(null);
  const addCoupon    = (c)       => { const n = {...c, id:`c${Date.now()}`}; setCoupons(p=>[...p,n]); return n; };
  const updateCoupon = (id, chg) => setCoupons(p => p.map(c => c.id===id ? {...c,...chg} : c));
  const deleteCoupon = (id)      => setCoupons(p => p.filter(c => c.id!==id));

  // ── Orders ──
  const placeOrder = async ({ name, email, department, paymentMethod, notes }) => {
    const isPayroll = paymentMethod === "payroll";
    const order = {
      id:            `ORD-${Date.now()}`,
      date:          new Date().toISOString(),
      name, email, department, paymentMethod,
      notes:         notes || "",
      items:         cart.map(i => ({
        productId:   i.product.id,   productName: i.product.name,
        variants:    i.variants,     qty:         i.qty,
        price:       i.product.price, subtotal:   i.product.price * i.qty,
      })),
      subtotal:      cartSubtotal,
      discount,
      couponCode:    appliedCoupon?.code || null,
      total:         cartTotal,
      status:        "pending",
      paid:          true, // payroll deduction = auto-paid
    };
    const created     = await atCreateOrder(order);
    const withRecord  = { ...order, _recordId: created.id };
    setOrders(prev => [withRecord, ...prev]);
    // Send email notification for payroll deduction
    if (isPayroll) {
      sendPayrollEmail({
        name, storeNumber: department, email,
        total: cartTotal, orderId: order.id,
      });
    }
    clearCart();
    return withRecord;
  };

  const updateOrder = async (id, changes) => {
    const order = orders.find(o => o.id === id);
    if (!order?._recordId) return;
    await atUpdateOrder(order._recordId, changes);
    setOrders(p => p.map(o => o.id===id ? {...o,...changes} : o));
  };
  const deleteOrder = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order?._recordId) return;
    await atDeleteOrder(order._recordId);
    setOrders(p => p.filter(o => o.id!==id));
  };

  // ── Products ──
  const addProduct    = async (p)       => { const n = {...p, id:Date.now()}; const c = await atCreateProduct(n); const w = {...n, _recordId:c.id}; setProducts(prev=>[...prev,w]); return w; };
  const updateProduct = async (id, chg) => { const p = products.find(x=>x.id===id); if (!p?._recordId) return; await atUpdateProduct(p._recordId, chg); setProducts(prev=>prev.map(x=>x.id===id?{...x,...chg}:x)); };
  const deleteProduct = async (id)      => { const p = products.find(x=>x.id===id); if (!p?._recordId) return; await atDeleteProduct(p._recordId); setProducts(prev=>prev.filter(x=>x.id!==id)); };

  // ── Suggestions ──
  const submitSuggestion = async ({ name, storeNumber, suggestion, question }) => {
    const s = { id:`SUG-${Date.now()}`, date:new Date().toISOString(), name, storeNumber, suggestion, question:question||"" };
    const created    = await atCreateSuggestion(s);
    const withRecord = { ...s, _recordId: created.id };
    setSuggestions(prev => [withRecord, ...prev]);
    return withRecord;
  };
  const markSuggestionReviewed = async (id, reviewed) => {
    const s = suggestions.find(x => x.id === id);
    if (!s?._recordId) return;
    await atUpdateSuggestion(s._recordId, { reviewed });
    setSuggestions(prev => prev.map(x => x.id===id ? {...x, reviewed} : x));
  };
  const deleteSuggestion = async (id) => {
    const s = suggestions.find(x => x.id === id);
    if (!s?._recordId) return;
    await atDeleteSuggestion(s._recordId);
    setSuggestions(prev => prev.filter(x => x.id!==id));
  };

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartSubtotal, discount, cartTotal, cartCount,
      appliedCoupon, applyCoupon, removeCoupon,
      coupons, addCoupon, updateCoupon, deleteCoupon,
      orders, ordersLoading, ordersError, loadOrders, placeOrder, updateOrder, deleteOrder,
      products, productsLoading, productsError, loadProducts, addProduct, updateProduct, deleteProduct,
      suggestions, suggestionsLoading, loadSuggestions, submitSuggestion, markSuggestionReviewed, deleteSuggestion,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
