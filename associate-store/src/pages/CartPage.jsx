import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { paymentMethods } from "../data/products";
import { formatCurrency } from "../data/utils";

export default function CartPage({ setPage }) {
  const { cart, removeFromCart, updateQty, cartTotal, placeOrder } = useStore();
  const [step, setStep]             = useState("cart"); // cart | checkout | confirm
  const [lastOrder, setLastOrder]   = useState(null);
  const [form, setForm]             = useState({
    name: "", email: "", storenumber: "", paymentMethod: "venmo", notes: "",
  });
  const [errors, setErrors]         = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name    = "Name is required";
    if (!form.email.trim())  e.email   = "Email is required";
    if (!form.storenumber.trim()) e.storenumber = "Store Number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
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
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#111", marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: "#888", marginBottom: 24 }}>Head to the shop to find something great.</p>
        <button onClick={() => setPage("shop")} style={btnStyle("#A22325")}>Browse Products</button>
      </div>
    );
  }

  if (step === "confirm" && lastOrder) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 26, color: "#111", marginBottom: 8 }}>Order Submitted!</h2>
        <p style={{ color: "#666", marginBottom: 4 }}>Order ID: <strong>{lastOrder.id}</strong></p>
        <p style={{ color: "#666", marginBottom: 28 }}>We'll confirm your order by email shortly.</p>

        {/* Payment instructions */}
        <div style={{
          background: "#fff8f0",
          border: "1.5px solid #f0d0a0",
          borderRadius: 10,
          padding: 24,
          marginBottom: 28,
          textAlign: "left",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A22325", marginBottom: 12 }}>
            💳 Payment Instructions
          </p>
          <p style={{ fontSize: 14, color: "#333", marginBottom: 8 }}>
            Please send <strong>{formatCurrency(lastOrder.total)}</strong> via <strong>{selectedPayment?.label}</strong>
          </p>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
            {selectedPayment?.id === "payroll"
              ? `Submit: ${selectedPayment.handle}. Include your order ID: ${lastOrder.id}`
              : `Send to: ${selectedPayment?.handle}`
            }
          </p>
          {selectedPayment?.link && (
            <a
              href={selectedPayment.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 8,
                background: "#A22325",
                color: "#fff",
                padding: "9px 20px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >Open {selectedPayment.label} →</a>
          )}
          <p style={{ fontSize: 12, color: "#999", marginTop: 12 }}>
            Include your order ID <strong>{lastOrder.id}</strong> in the payment note.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => { setStep("cart"); setLastOrder(null); setPage("shop"); }} style={btnStyle("#111")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 26, color: "#111", marginBottom: 28 }}>
        {step === "cart" ? "Your Cart" : "Checkout"}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
        {/* Left */}
        <div>
          {step === "cart" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cart.map(item => (
                <div key={item.key} style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: "#111", marginBottom: 4 }}>{item.product.name}</p>
                    {Object.entries(item.variants).length > 0 && (
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                        {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                    <p style={{ fontSize: 13, color: "#A22325", fontWeight: 600 }}>
                      {formatCurrency(item.product.price)} each
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #eee", borderRadius: 6, overflow: "hidden" }}>
                    <button onClick={() => updateQty(item.key, item.qty - 1)} style={{ background: "#f5f5f5", border: "none", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>−</button>
                    <span style={{ padding: "0 14px", fontSize: 14, fontWeight: 600 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)} style={{ background: "#f5f5f5", border: "none", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>+</button>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 70 }}>
                    <p style={{ fontWeight: 700, color: "#111", fontSize: 15 }}>{formatCurrency(item.product.price * item.qty)}</p>
                    <button onClick={() => removeFromCart(item.key)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 12, marginTop: 4 }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === "checkout" && (
            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 20 }}>Your Information</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <Field label="Full Name *" error={errors.name}>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle(errors.name)} placeholder="Jane Smith" />
                </Field>
                <Field label="Work Email *" error={errors.email}>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle(errors.email)} placeholder="jane@yourcompany.com" type="email" />
                </Field>
                <Field label="Department *" error={errors.department}>
                  <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={inputStyle(errors.department)} placeholder="Marketing, Engineering, etc." />
                </Field>

                <Field label="Payment Method">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {paymentMethods.map(pm => (
                      <label key={pm.id} style={{
                        border: "1.5px solid",
                        borderColor: form.paymentMethod === pm.id ? "#A22325" : "#ddd",
                        borderRadius: 8,
                        padding: "10px 14px",
                        cursor: "pointer",
                        background: form.paymentMethod === pm.id ? "#fff8f8" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.15s",
                      }}>
                        <input
                          type="radio"
                          name="payment"
                          value={pm.id}
                          checked={form.paymentMethod === pm.id}
                          onChange={() => setForm(f => ({ ...f, paymentMethod: pm.id }))}
                          style={{ accentColor: "#A22325" }}
                        />
                        <span style={{ fontSize: 13, fontWeight: form.paymentMethod === pm.id ? 600 : 400, color: "#111" }}>{pm.label}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Notes (optional)">
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Delivery instructions, special requests..."
                    style={{ ...inputStyle(), resize: "vertical" }}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Right — Order Summary */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 24, position: "sticky", top: 84 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 16 }}>Order Summary</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {cart.map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555" }}>
                <span>{item.product.name} × {item.qty}</span>
                <span>{formatCurrency(item.product.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #eee", paddingTop: 14, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, color: "#111" }}>
              <span>Total</span>
              <span style={{ color: "#A22325" }}>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {step === "cart" && (
            <button onClick={() => setStep("checkout")} style={btnStyle("#A22325")}>
              Proceed to Checkout →
            </button>
          )}
          {step === "checkout" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={handleSubmit} style={btnStyle("#A22325")}>Place Order</button>
              <button onClick={() => setStep("cart")} style={btnStyle("#111")}>← Back to Cart</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#444", marginBottom: 7 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: "#A22325", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%",
    padding: "10px 14px",
    border: `1.5px solid ${hasError ? "#A22325" : "#ddd"}`,
    borderRadius: 8,
    fontSize: 14,
    color: "#111",
    outline: "none",
    background: "#fafafa",
    boxSizing: "border-box",
  };
}

function btnStyle(bg) {
  return {
    width: "100%",
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "13px",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    textTransform: "uppercase",
  };
}
