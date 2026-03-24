import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { paymentMethods } from "../data/products";
import { formatCurrency } from "../data/utils";

export default function CartPage({ setPage }) {
  const { cart, removeFromCart, updateQty, cartSubtotal, discount, cartTotal,
          appliedCoupon, applyCoupon, removeCoupon, placeOrder } = useStore();

  const [step, setStep]           = useState("cart");
  const [lastOrder, setLastOrder] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg]     = useState(null);
  const [form, setForm]           = useState({ name:"", email:"", department:"", paymentMethod:"venmo", notes:"" });
  const [errors, setErrors]       = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = "Name is required";
    if (!form.email.trim())      e.email      = "Email is required";
    if (!form.department.trim()) e.department = "Department is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput.trim());
    if (result.success) {
      setCouponMsg({ type: "success", text: `Coupon applied: ${result.coupon.description}` });
    } else {
      setCouponMsg({ type: "error", text: "Invalid or inactive coupon code." });
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const order = placeOrder(form);
    setLastOrder(order);
    setStep("confirm");
  };

  const selectedPayment = paymentMethods.find(m => m.id === form.paymentMethod);

  // ── Empty cart ──
  if (cart.length === 0 && step === "cart") {
    return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40 }}>
        <p style={{ fontSize:48, marginBottom:16 }}>🛒</p>
        <h2 style={{ fontFamily:"'Georgia', serif", fontSize:22, color:"#111", marginBottom:8 }}>Your cart is empty</h2>
        <p style={{ color:"#888", marginBottom:24 }}>Head to the shop to find something great.</p>
        <button onClick={() => setPage("shop")} style={btnStyle("#A22325")}>Browse Products</button>
      </div>
    );
  }

  // ── Order confirmation ──
  if (step === "confirm" && lastOrder) {
    return (
      <div style={{ maxWidth:580, margin:"60px auto", padding:"0 24px" }}>
        <div style={{
          background:"#fff", border:"1px solid #e0e0e0", borderRadius:14,
          padding:"48px 40px", textAlign:"center",
        }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:28, color:"#111", marginBottom:8 }}>
            Thank You, {lastOrder.name.split(" ")[0]}!
          </h2>
          <p style={{ color:"#666", fontSize:15, marginBottom:4 }}>Your order has been received.</p>
          <p style={{ color:"#aaa", fontSize:13, marginBottom:32 }}>Order ID: <strong style={{ color:"#111" }}>{lastOrder.id}</strong></p>

          {/* Order summary */}
          <div style={{ background:"#f8f8f8", borderRadius:10, padding:"20px 24px", marginBottom:24, textAlign:"left" }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#999", marginBottom:12 }}>Order Summary</p>
            {lastOrder.items.map((item, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555", marginBottom:6 }}>
                <span>
                  {item.productName}
                  {Object.keys(item.variants).length > 0 &&
                    <span style={{ color:"#aaa" }}> ({Object.entries(item.variants).map(([k,v])=>`${k}: ${v}`).join(", ")})</span>
                  }
                  {" "}× {item.qty}
                </span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            {lastOrder.discount > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#2d7a2d", marginTop:8, paddingTop:8, borderTop:"1px solid #eee" }}>
                <span>Discount ({lastOrder.couponCode})</span>
                <span>−{formatCurrency(lastOrder.discount)}</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:16, color:"#111", marginTop:10, paddingTop:10, borderTop:"1px solid #e0e0e0" }}>
              <span>Total</span>
              <span style={{ color:"#A22325" }}>{formatCurrency(lastOrder.total)}</span>
            </div>
          </div>

          {/* Payment instructions */}
          <div style={{ background:"#fff8f0", border:"1.5px solid #f0d0a0", borderRadius:10, padding:"20px 24px", marginBottom:28, textAlign:"left" }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#A22325", marginBottom:10 }}>
              💳 How to Pay
            </p>
            <p style={{ fontSize:14, color:"#333", marginBottom:6 }}>
              Send <strong>{formatCurrency(lastOrder.total)}</strong> via <strong>{selectedPayment?.label}</strong>
            </p>
            <p style={{ fontSize:13, color:"#666", marginBottom: selectedPayment?.link ? 12 : 0 }}>
              {selectedPayment?.id === "payroll"
                ? `${selectedPayment.handle} — include order ID: ${lastOrder.id}`
                : `To: ${selectedPayment?.handle}`}
            </p>
            {selectedPayment?.link && (
              <a href={selectedPayment.link} target="_blank" rel="noopener noreferrer" style={{
                display:"inline-block", background:"#A22325", color:"#fff",
                padding:"9px 20px", borderRadius:6, fontSize:13, fontWeight:600, textDecoration:"none",
              }}>Open {selectedPayment.label} →</a>
            )}
            <p style={{ fontSize:11, color:"#bbb", marginTop:10 }}>
              Include order ID <strong>{lastOrder.id}</strong> in your payment note.
            </p>
          </div>

          <button onClick={() => { setStep("cart"); setLastOrder(null); setPage("shop"); }} style={btnStyle("#111")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── Cart & Checkout ──
  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"40px 24px" }}>
      <h1 style={{ fontFamily:"'Georgia', serif", fontSize:26, color:"#111", marginBottom:28 }}>
        {step === "cart" ? "Your Cart" : "Checkout"}
      </h1>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:32, alignItems:"start" }}>
        {/* ── Left ── */}
        <div>
          {step === "cart" && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {cart.map(item => (
                  <div key={item.key} style={{
                    background:"#fff", border:"1px solid #eee", borderRadius:10,
                    padding:"16px 20px", display:"flex", alignItems:"center", gap:16,
                  }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:15, color:"#111", marginBottom:4 }}>{item.product.name}</p>
                      {Object.entries(item.variants).length > 0 && (
                        <p style={{ fontSize:12, color:"#888", marginBottom:4 }}>
                          {Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                      <p style={{ fontSize:13, color:"#A22325", fontWeight:600 }}>{formatCurrency(item.product.price)} each</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", border:"1.5px solid #eee", borderRadius:6, overflow:"hidden" }}>
                      <button onClick={() => updateQty(item.key, item.qty-1)} style={qtyBtn}>−</button>
                      <span style={{ padding:"0 14px", fontSize:14, fontWeight:600 }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, item.qty+1)} style={qtyBtn}>+</button>
                    </div>
                    <div style={{ textAlign:"right", minWidth:70 }}>
                      <p style={{ fontWeight:700, color:"#111", fontSize:15 }}>{formatCurrency(item.product.price * item.qty)}</p>
                      <button onClick={() => removeFromCart(item.key)} style={{ background:"none", border:"none", color:"#ccc", cursor:"pointer", fontSize:12, marginTop:4 }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:10, padding:"18px 20px", marginTop:16 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#333", marginBottom:10 }}>Have a coupon code?</p>
                {appliedCoupon ? (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#e8f5e8", border:"1.5px solid #b0d8b0", borderRadius:8, padding:"10px 14px" }}>
                    <span style={{ fontSize:13, color:"#1a5c1a", fontWeight:600 }}>✓ {appliedCoupon.code} — {appliedCoupon.description}</span>
                    <button onClick={() => { removeCoupon(); setCouponMsg(null); }} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:13 }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:8 }}>
                    <input
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value); setCouponMsg(null); }}
                      onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter code..."
                      style={{ flex:1, padding:"9px 14px", border:`1.5px solid ${couponMsg?.type==="error" ? "#A22325" : "#ddd"}`, borderRadius:8, fontSize:13, outline:"none" }}
                    />
                    <button onClick={handleApplyCoupon} style={{ background:"#111", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                      Apply
                    </button>
                  </div>
                )}
                {couponMsg && !appliedCoupon && (
                  <p style={{ fontSize:12, color: couponMsg.type==="error" ? "#A22325" : "#2d7a2d", marginTop:8 }}>{couponMsg.text}</p>
                )}
              </div>
            </>
          )}

          {step === "checkout" && (
            <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:10, padding:28 }}>
              <h2 style={{ fontSize:16, fontWeight:600, color:"#111", marginBottom:20 }}>Your Information</h2>
              <div style={{ display:"grid", gap:16 }}>
                <Field label="Full Name *" error={errors.name}>
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} style={inputStyle(errors.name)} placeholder="Jane Smith" />
                </Field>
                <Field label="Work Email *" error={errors.email}>
                  <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} style={inputStyle(errors.email)} placeholder="jane@yourcompany.com" type="email" />
                </Field>
                <Field label="Department *" error={errors.department}>
                  <input value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))} style={inputStyle(errors.department)} placeholder="Marketing, Engineering, etc." />
                </Field>
                <Field label="Payment Method">
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {paymentMethods.map(pm => (
                      <label key={pm.id} style={{
                        border:"1.5px solid", borderColor: form.paymentMethod===pm.id ? "#A22325" : "#ddd",
                        borderRadius:8, padding:"10px 14px", cursor:"pointer",
                        background: form.paymentMethod===pm.id ? "#fff8f8" : "#fff",
                        display:"flex", alignItems:"center", gap:8, transition:"all 0.15s",
                      }}>
                        <input type="radio" name="payment" value={pm.id} checked={form.paymentMethod===pm.id}
                          onChange={() => setForm(f=>({...f,paymentMethod:pm.id}))} style={{ accentColor:"#A22325" }} />
                        <span style={{ fontSize:13, fontWeight: form.paymentMethod===pm.id ? 600 : 400, color:"#111" }}>{pm.label}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Notes (optional)">
                  <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={3}
                    placeholder="Delivery instructions, special requests..."
                    style={{ ...inputStyle(), resize:"vertical" }} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ── */}
        <div style={{ background:"#fff", border:"1px solid #eee", borderRadius:10, padding:24, position:"sticky", top:84 }}>
          <h2 style={{ fontSize:15, fontWeight:600, color:"#111", marginBottom:16 }}>Order Summary</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {cart.map(item => (
              <div key={item.key} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555" }}>
                <span>{item.product.name} × {item.qty}</span>
                <span>{formatCurrency(item.product.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid #eee", paddingTop:12, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, color:"#555", marginBottom:6 }}>
              <span>Subtotal</span><span>{formatCurrency(cartSubtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#2d7a2d", marginBottom:6 }}>
                <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                <span>−{formatCurrency(discount)}</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:17, color:"#111", marginTop:10, paddingTop:10, borderTop:"1px solid #eee" }}>
              <span>Total</span>
              <span style={{ color:"#A22325" }}>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {step === "cart" && (
            <button onClick={() => setStep("checkout")} style={{ ...btnStyle("#A22325"), marginTop:12 }}>
              Proceed to Checkout →
            </button>
          )}
          {step === "checkout" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:12 }}>
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
      <label style={{ display:"block", fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"#444", marginBottom:7 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize:12, color:"#A22325", marginTop:4 }}>{error}</p>}
    </div>
  );
}
const inputStyle = (hasError) => ({
  width:"100%", padding:"10px 14px",
  border:`1.5px solid ${hasError ? "#A22325" : "#ddd"}`,
  borderRadius:8, fontSize:14, color:"#111", outline:"none",
  background:"#fafafa", boxSizing:"border-box",
});
const btnStyle = (bg) => ({
  width:"100%", background:bg, color:"#fff", border:"none",
  borderRadius:8, padding:"13px", fontSize:14, fontWeight:700,
  letterSpacing:"0.06em", cursor:"pointer", textTransform:"uppercase",
});
const qtyBtn = { background:"#f5f5f5", border:"none", width:32, height:32, cursor:"pointer", fontSize:16 };
