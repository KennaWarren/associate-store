import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext(null);

const ORDERS_KEY = "associate_store_orders";

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product, variants, qty = 1) => {
    const key = `${product.id}-${JSON.stringify(variants)}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { key, product, variants, qty }];
    });
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const placeOrder = ({ name, email, department, paymentMethod, notes }) => {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      name,
      email,
      department,
      paymentMethod,
      notes,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        variants: i.variants,
        qty: i.qty,
        price: i.product.price,
        subtotal: i.product.price * i.qty,
      })),
      total: cartTotal,
      status: "pending",
      paid: false,
    };
    setOrders(prev => [order, ...prev]);
    clearCart();
    return order;
  };

  const updateOrder = (id, changes) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...changes } : o));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartTotal, cartCount,
      orders, placeOrder, updateOrder, deleteOrder,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
