import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { paymentMethods } from "../data/products";
import { formatCurrency } from "../data/utils";

export default function CartPage({ setPage }) {
  const { cart, removeFromCart, updateQty, cartSubtotal, discount, cartTotal,
          appliedCoupon, applyCoupon, removeCoupon, placeOrder } = useStore();

  const [step, setStep]               = useState("cart");
  const [lastOrder, setLastOrder]     = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg]     = useState(null);
  const [form, setForm]               = useState({ name:"", email:"", department:"", paymentMethod:"venmo", notes:"" });
  const [errors, setErrors]           = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = "Required";
    if (!form.email.trim())      e.email      = "Required";
    if (!form.department.trim()) e.department = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput.trim());
    setCouponMsg(result.success
      ? { type: "success", text: `✓ ${result.coupon.description}` }
      : { type: "error",   text: "Invalid or inactive coupon code." }
    );
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const order = placeOrder(form);
    setLastOrder(order);
    setStep("confirm");
  };

  const selectedPayment = paymentMethods.find(m => m.id === form.paymentMethod);

  if (cart.length === 0 && step === "cart") {
    return (
      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, background: "#f9f9f9" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 24, color: "#0a0a0a", marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: "#aaa", marginBottom: 28, fontSize: 15 }}>Head to the shop to find something great.</p>
        <button onClick={() => setPage("shop")} style={primaryBtn}>Browse Products</button>
      </div>
    );
  }

  if (step === "confirm" && lastOrder) {
    const pm = paymentMethods.find(m => m.id === lastOrder.paymentMethod);
    return (
      <div style={{ background: "#f9f9f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 520, width: "100%", textAlign: "center", border: "1px solid #f0f0f0" }}>
          <div style={{ width: 64, height: 64, background: "#f0faf0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>🎉</div>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 26, color: "#0a0a0a", marginBottom: 6 }}>Thank You, {lastOrder.name.split(" ")[0]}!</h2>
          <p style={{ color: "#aaa", fontSize: 14, marginBottom: 4 }}>Your order has been submitted.</p>
          <p style={{ fontSize: 12, color: "#ccc", marginBottom: 32, fontFamily: "monospace", letterSpacing: "0.08em" }}>{lastOrder.id}</p>

          {/* Summary */}
          <div style={{ background: "#f9f9f9", borderRadius: 12, padding: "20px 24px", marginBottom: 20, textAlign: "left" }}>
            {lastOrder.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 8 }}>
                <span>
                  {item.productName}
                  {Object.keys(item.variants).length > 0 && <span style={{ color: "#bbb" }}> ({Object.entries(item.variants).map(([k,v]) => `${v}`).join(", ")})</span>}
                  <span style={{ color: "#ccc" }}> ×{item.qty}</span>
                </span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            {lastOrder.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2d7a2d", paddingTop: 10, marginTop: 4, borderTop: "1px solid #eee" }}>
                <span>Discount ({lastOrder.couponCode})</span>
                <span>−{formatCurrency(lastOrder.discount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, color: "#0a0a0a", marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <span>Total</span><span style={{ color: "#A22325" }}>{formatCurrency(lastOrder.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: "#fffbf5", border: "1px solid #f5e0c0", borderRadius: 12, padding: "18px 24px", marginBottom: 28, textAlign: "left" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A22325", marginBottom: 10 }}>💳 Payment Instructions</p>
            <p style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>Send <strong>{formatCurrency(lastOrder.total)}</strong> via <strong>{pm?.label}</strong></p>
            <p style={{ fontSize: 13, color: "#777", marginBottom: pm?.link ? 14 : 0 }}>
              {pm?.id === "payroll" ? `${pm.handle} — Order ID: ${lastOrder.id}` : `To: ${pm?.handle}`}
            </p>
            {pm?.link && (
              <a href={pm.link} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block", background: "#A22325", color: "#fff",
                padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}>Open {pm.label} →</a>
            )}
            <p style={{ fontSize: 11, color: "#ccc", marginTop: 12 }}>Reference: <strong style={{ color: "#aaa" }}>{lastOrder.id}</strong></p>
          </div>

          <button onClick={() => { setStep("cart"); setLastOrder(null); setPage("shop"); }} style={primaryBtn}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: "#0a0a0a", marginBottom: 32 }}>
          {step === "cart" ? "Your Cart" : "Checkout"}
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
          {/* Left */}
          <div>
            {step === "cart" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cart.map(item => (
                    <div key={item.key} style={{
                      background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14,
                      padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 15, color: "#0a0a0a", marginBottom: 4 }}>{item.product.name}</p>
                        {Object.entries(item.variants).length > 0 && (
                          <p style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
                            {Object.entries(item.variants).map(([k,v]) => v).join(" · ")}
                          </p>
                        )}
                        <p style={{ fontSize: 13, color: "#A22325", fontWeight: 700 }}>{formatCurrency(item.product.price)}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", background: "#f9f9f9", borderRadius: 10, overflow: "hidden", border: "1px solid #f0f0f0" }}>
                        <button onClick={() => updateQty(item.key, item.qty-1)} style={{ background: "none", border: "none", width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#555" }}>−</button>
                        <span style={{ padding: "0 14px", fontSize: 14, fontWeight: 700, color: "#0a0a0a" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.key, item.qty+1)} style={{ background: "none", border: "none", width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#555" }}>+</button>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 72 }}>
                        <p style={{ fontWeight: 800, color: "#0a0a0a", fontSize: 15 }}>{formatCurrency(item.product.price * item.qty)}</p>
                        <button onClick={() => removeFromCart(item.key)} style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: 12, marginTop: 4 }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "18px 20px", marginTop: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>Coupon Code</p>
                  {appliedCoupon ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0faf0", border: "1px solid #b0d8b0", borderRadius: 10, padding: "10px 16px" }}>
                      <span style={{ fontSize: 13, color: "#1a5c1a", fontWeight: 600 }}>✓ {appliedCoupon.code} — {appliedCoupon.description}</span>
                      <button onClick={() => { removeCoupon(); setCouponMsg(null); }} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13 }}>Remove</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={couponInput} onChange={e => { setCouponInput(e.target.value); setCouponMsg(null); }}
                        onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Enter code..." style={{
                          flex: 1, padding: "10px 14px",
                          border: `1.5px solid ${couponMsg?.type === "error" ? "#A22325" : "#f0f0f0"}`,
                          borderRadius: 10, fontSize: 13, outline: "none", background: "#f9f9f9",
                        }} />
                      <button onClick={handleApplyCoupon} style={{
                        background: "#0a0a0a", color: "#fff", border: "none",
                        borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>Apply</button>
                    </div>
                  )}
                  {couponMsg && !appliedCoupon && (
                    <p style={{ fontSize: 12, color: couponMsg.type === "error" ? "#A22325" : "#2d7a2d", marginTop: 8 }}>{couponMsg.text}</p>
                  )}
                </div>
              </>
            )}

            {step === "checkout" && (
              <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "28px 28px" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a", marginBottom: 24, letterSpacing: "-0.01em" }}>Your Information</h2>
                <div style={{ display: "grid", gap: 18 }}>
                  <Field label="Full Name" error={errors.name}>
                    <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} style={inp(errors.name)} placeholder="Jane Smith" />
                  </Field>
                  <Field label="Work Email" error={errors.email}>
                    <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} style={inp(errors.email)} placeholder="jane@company.com" type="email" />
                  </Field>
                  <Field label="Department" error={errors.department}>
                    <input value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))} style={inp(errors.department)} placeholder="Marketing, Engineering, etc." />
                  </Field>
                  <Field label="Payment Method">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {paymentMethods.map(pm => (
                        <label key={pm.id} style={{
                          border: "1.5px solid", borderColor: form.paymentMethod===pm.id ? "#0a0a0a" : "#f0f0f0",
                          borderRadius: 10, padding: "11px 14px", cursor: "pointer",
                          background: form.paymentMethod===pm.id ? "#0a0a0a" : "#fff",
                          display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                        }}>
                          <input type="radio" name="payment" value={pm.id} checked={form.paymentMethod===pm.id}
                            onChange={() => setForm(f=>({...f,paymentMethod:pm.id}))} style={{ accentColor: "#A22325" }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: form.paymentMethod===pm.id ? "#fff" : "#333" }}>{pm.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Notes">
                    <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={3}
                      placeholder="Any special requests..." style={{ ...inp(), resize: "vertical" }} />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "22px 24px", position: "sticky", top: 84 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 16 }}>Order Summary</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {cart.map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#777" }}>
                  <span>{item.product.name} ×{item.qty}</span>
                  <span style={{ fontWeight: 600, color: "#0a0a0a" }}>{formatCurrency(item.product.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#aaa", marginBottom: 8 }}>
                <span>Subtotal</span><span style={{ color: "#555" }}>{formatCurrency(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2d7a2d", marginBottom: 8 }}>
                  <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                  <span>−{formatCurrency(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, color: "#0a0a0a", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                <span>Total</span>
                <span style={{ color: "#A22325" }}>{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {step === "cart" && (
                <button onClick={() => setStep("checkout")} style={primaryBtn}>Checkout →</button>
              )}
              {step === "checkout" && (
                <>
                  <button onClick={handleSubmit} style={primaryBtn}>Place Order</button>
                  <button onClick={() => setStep("cart")} style={secondaryBtn}>← Back to Cart</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: "#A22325", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

const inp = (err) => ({
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${err ? "#A22325" : "#f0f0f0"}`,
  borderRadius: 10, fontSize: 14, color: "#0a0a0a",
  outline: "none", background: "#f9f9f9", boxSizing: "border-box",
});
const primaryBtn = {
  width: "100%", background: "#A22325", color: "#fff",
  border: "none", borderRadius: 10, padding: "14px",
  fontSize: 14, fontWeight: 700, letterSpacing: "0.06em",
  cursor: "pointer", textTransform: "uppercase",
};
const secondaryBtn = {
  width: "100%", background: "#f9f9f9", color: "#555",
  border: "1px solid #f0f0f0", borderRadius: 10, padding: "13px",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
};
