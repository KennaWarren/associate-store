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
  const [form, setForm]               = useState({ name:"", email:"", storeNumber:"", paymentMethod:"venmo", notes:"" });
  const [errors, setErrors]           = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = "Required";
    if (!form.email.trim())      e.email      = "Required";
    if (!form.phone.trim())      e.phone      = "Required";
    if (!form.storeNumber.trim()) e.storeNumber = "Required";
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

  // Empty cart
  if (cart.length === 0 && step === "cart") {
    return (
      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, background: "#F7F7F7" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 24, color: "#1a1a1a", marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: "#aaa", marginBottom: 28, fontSize: 15 }}>Head to the shop to find something great.</p>
        <button onClick={() => setPage("shop")} style={primaryBtn}>Browse Products</button>
      </div>
    );
  }

  // Confirmation
  if (step === "confirm" && lastOrder) {
    const pm = paymentMethods.find(m => m.id === lastOrder.paymentMethod);
    return (
      <div style={{ background: "#F7F7F7", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "52px 44px",
          maxWidth: 520, width: "100%", textAlign: "center",
          border: "1px solid #EAEAEA",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        }}>
          <div style={{
            width: 68, height: 68,
            background: "linear-gradient(135deg, #FFF0F0, #FFE0E0)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: 30,
            border: "2px solid rgba(162,35,37,0.15)",
          }}>🎉</div>

          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: "#1a1a1a", marginBottom: 8 }}>
            Thank You, {lastOrder.name.split(" ")[0]}!
          </h2>
          <p style={{ color: "#aaa", fontSize: 15, marginBottom: 6 }}>Your order has been submitted successfully.</p>
          <p style={{
            display: "inline-block",
            fontSize: 12, color: "#A22325", fontWeight: 700,
            letterSpacing: "0.08em", fontFamily: "monospace",
            background: "#FFF0F0", padding: "5px 14px", borderRadius: 8,
            marginBottom: 32, border: "1px solid rgba(162,35,37,0.15)",
          }}>{lastOrder.id}</p>

          {/* Summary */}
          <div style={{ background: "#F7F7F7", borderRadius: 14, padding: "20px 24px", marginBottom: 20, textAlign: "left" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 14 }}>Order Summary</p>
            {lastOrder.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 8 }}>
                <span>
                  {item.productName}
                  {Object.keys(item.variants).length > 0 && (
                    <span style={{ color: "#bbb" }}> ({Object.entries(item.variants).map(([,v]) => v).join(", ")})</span>
                  )}
                  <span style={{ color: "#ccc" }}> ×{item.qty}</span>
                </span>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            {lastOrder.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2d7a2d", paddingTop: 10, marginTop: 6, borderTop: "1px solid #EAEAEA" }}>
                <span>Discount ({lastOrder.couponCode})</span>
                <span>−{formatCurrency(lastOrder.discount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, color: "#1a1a1a", marginTop: 12, paddingTop: 12, borderTop: "1px solid #EAEAEA" }}>
              <span>Total</span>
              <span style={{ color: "#A22325" }}>{formatCurrency(lastOrder.total)}</span>
            </div>
          </div>

          {/* Payment instructions */}
          <div style={{
            background: "#FFFBF5", border: "1px solid #F5E0C0",
            borderRadius: 14, padding: "20px 24px", marginBottom: 28, textAlign: "left",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A22325", marginBottom: 12 }}>
              💳 How to Pay
            </p>
            <p style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>
              Send <strong>{formatCurrency(lastOrder.total)}</strong> via <strong>{pm?.label}</strong>
            </p>
            <p style={{ fontSize: 13, color: "#777", marginBottom: pm?.link ? 14 : 0 }}>
              {pm?.id === "payroll" ? `${pm.handle} — Order ID: ${lastOrder.id}` : `To: ${pm?.handle}`}
            </p>
            {pm?.link && (
              <a href={pm.link} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block", background: "#A22325", color: "#fff",
                padding: "10px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                textDecoration: "none", boxShadow: "0 2px 10px rgba(162,35,37,0.3)",
              }}>Open {pm.label} →</a>
            )}
            <p style={{ fontSize: 11, color: "#ccc", marginTop: 12 }}>
              Include reference: <strong style={{ color: "#aaa" }}>{lastOrder.id}</strong>
            </p>
          </div>

          <button onClick={() => { setStep("cart"); setLastOrder(null); setPage("shop"); }} style={primaryBtn}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F7F7F7", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 30, color: "#1a1a1a", marginBottom: 36, letterSpacing: "-0.01em" }}>
          {step === "cart" ? "Your Cart" : "Checkout"}
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>

          {/* Left column */}
          <div>
            {step === "cart" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cart.map(item => (
                    <div key={item.key} style={{
                      background: "#fff", border: "1px solid #EAEAEA",
                      borderRadius: 16, padding: "20px 22px",
                      display: "flex", alignItems: "center", gap: 18,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>{item.product.name}</p>
                        {Object.entries(item.variants).length > 0 && (
                          <p style={{ fontSize: 12, color: "#bbb", marginBottom: 4 }}>
                            {Object.entries(item.variants).map(([,v]) => v).join(" · ")}
                          </p>
                        )}
                        <p style={{ fontSize: 14, color: "#A22325", fontWeight: 700 }}>{formatCurrency(item.product.price)}</p>
                      </div>

                      <div style={{
                        display: "flex", alignItems: "center",
                        background: "#F7F7F7", borderRadius: 10,
                        border: "1px solid #EAEAEA", overflow: "hidden",
                      }}>
                        <button onClick={() => updateQty(item.key, item.qty - 1)}
                          style={{ background: "none", border: "none", width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#555" }}>−</button>
                        <span style={{ padding: "0 14px", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.key, item.qty + 1)}
                          style={{ background: "none", border: "none", width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#555" }}>+</button>
                      </div>

                      <div style={{ textAlign: "right", minWidth: 72 }}>
                        <p style={{ fontWeight: 800, color: "#1a1a1a", fontSize: 15 }}>{formatCurrency(item.product.price * item.qty)}</p>
                        <button onClick={() => removeFromCart(item.key)}
                          style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: 12, marginTop: 4 }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div style={{
                  background: "#fff", border: "1px solid #EAEAEA",
                  borderRadius: 16, padding: "20px 22px", marginTop: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>
                    Coupon Code
                  </p>
                  {appliedCoupon ? (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "#F0FFF4", border: "1px solid #B0D8B0",
                      borderRadius: 10, padding: "11px 16px",
                    }}>
                      <span style={{ fontSize: 13, color: "#1a5c1a", fontWeight: 600 }}>✓ {appliedCoupon.code} — {appliedCoupon.description}</span>
                      <button onClick={() => { removeCoupon(); setCouponMsg(null); }}
                        style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13 }}>Remove</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value); setCouponMsg(null); }}
                        onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Enter code..."
                        style={{
                          flex: 1, padding: "11px 14px",
                          border: `1.5px solid ${couponMsg?.type === "error" ? "#A22325" : "#EAEAEA"}`,
                          borderRadius: 10, fontSize: 13, outline: "none",
                          background: "#F7F7F7", color: "#1a1a1a",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.target.style.borderColor = "#A22325"}
                        onBlur={e => e.target.style.borderColor = couponMsg?.type === "error" ? "#A22325" : "#EAEAEA"}
                      />
                      <button onClick={handleApplyCoupon} style={{
                        background: "#1a1a1a", color: "#fff", border: "none",
                        borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>Apply</button>
                    </div>
                  )}
                  {couponMsg && !appliedCoupon && (
                    <p style={{ fontSize: 12, color: couponMsg.type === "error" ? "#A22325" : "#2d7a2d", marginTop: 9 }}>{couponMsg.text}</p>
                  )}
                </div>
              </>
            )}

            {step === "checkout" && (
              <div style={{
                background: "#fff", border: "1px solid #EAEAEA",
                borderRadius: 16, padding: "32px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", marginBottom: 28, letterSpacing: "-0.01em" }}>Your Information</h2>
                <div style={{ display: "grid", gap: 20 }}>
                  <Field label="Full Name" error={errors.name}>
                    <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={inp(errors.name)} placeholder="Jane Smith" />
                  </Field>
                  <Field label="Work Email" error={errors.email}>
                    <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} style={inp(errors.email)} placeholder="jane@company.com" type="email" />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <input value={form.phone} onChange={e => setForm(f => ({...f, email: e.target.value}))} style={inp(errors.email)} placeholder="999-999-9999" type="phone" />
                  </Field>
                  <Field label="Store Number" error={errors.storeNumber}>
                    <input value={form.storeNumber} onChange={e => setForm(f => ({...f, storeNumber: e.target.value}))} style={inp(errors.storeNumber)} placeholder="Marketing, Engineering, etc." />
                  </Field>
                  <Field label="Payment Method">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {paymentMethods.map(pm => (
                        <label key={pm.id} style={{
                          border: "1.5px solid",
                          borderColor: form.paymentMethod === pm.id ? "#A22325" : "#EAEAEA",
                          borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                          background: form.paymentMethod === pm.id ? "#FFF0F0" : "#fff",
                          display: "flex", alignItems: "center", gap: 8,
                          transition: "all 0.15s",
                          boxShadow: form.paymentMethod === pm.id ? "0 2px 8px rgba(162,35,37,0.12)" : "none",
                        }}>
                          <input type="radio" name="payment" value={pm.id}
                            checked={form.paymentMethod === pm.id}
                            onChange={() => setForm(f => ({...f, paymentMethod: pm.id}))}
                            style={{ accentColor: "#A22325" }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: form.paymentMethod === pm.id ? "#A22325" : "#555" }}>{pm.label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Notes (optional)">
                    <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={3}
                      placeholder="Any special requests..." style={{ ...inp(), resize: "vertical" }} />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div style={{
            background: "#fff", border: "1px solid #EAEAEA",
            borderRadius: 16, padding: "24px",
            position: "sticky", top: 84,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 18 }}>
              Order Summary
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {cart.map(item => (
                <div key={item.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#777" }}>
                  <span>{item.product.name} ×{item.qty}</span>
                  <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{formatCurrency(item.product.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #EAEAEA", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#aaa", marginBottom: 8 }}>
                <span>Subtotal</span>
                <span style={{ color: "#555" }}>{formatCurrency(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2d7a2d", marginBottom: 8 }}>
                  <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                  <span>−{formatCurrency(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 19, color: "#1a1a1a", marginTop: 14, paddingTop: 14, borderTop: "1px solid #EAEAEA" }}>
                <span>Total</span>
                <span style={{ color: "#A22325" }}>{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
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
  width: "100%", padding: "12px 14px",
  border: `1.5px solid ${err ? "#A22325" : "#EAEAEA"}`,
  borderRadius: 10, fontSize: 14, color: "#1a1a1a",
  outline: "none", background: "#F7F7F7", boxSizing: "border-box",
  transition: "border-color 0.2s",
});

const primaryBtn = {
  width: "100%", background: "#A22325", color: "#fff",
  border: "none", borderRadius: 12, padding: "15px",
  fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer", textTransform: "uppercase",
  boxShadow: "0 4px 16px rgba(162,35,37,0.3)",
  transition: "background 0.15s",
};

const secondaryBtn = {
  width: "100%", background: "#F7F7F7", color: "#666",
  border: "1.5px solid #EAEAEA", borderRadius: 12, padding: "14px",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
};
