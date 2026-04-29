import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { paymentMethods } from "../data/products";
import { formatCurrency } from "../data/utils";

export default function CartPage({ setPage }) {
  const { cart, removeFromCart, updateQty, cartSubtotal, discount, cartTotal,
          appliedCoupon, applyCoupon, removeCoupon, placeOrder } = useStore();

  // steps: "cart" | "checkout" | "payroll_agree" | "payment" | "confirm"
  const [step, setStep]               = useState("cart");
  const [lastOrder, setLastOrder]     = useState(null);
  const [savedTotal, setSavedTotal]   = useState(0);   // ← locked in before cart clears
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg]     = useState(null);
  const [payrollAgreed, setPayrollAgreed] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", department:"", paymentMethod:"venmo", notes:"" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name       = "Required";
    if (!form.email.trim())       e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Please enter a valid email address";
    if (!form.department.trim())  e.department = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput.trim());
    setCouponMsg(result.success
      ? { type:"success", text:`✓ ${result.coupon.description}` }
      : { type:"error",   text:"Invalid or inactive coupon code." }
    );
  };

  const doPlaceOrder = async () => {
    // Lock in the total BEFORE placing order (cart will clear after)
    const totalSnapshot = cartTotal;
    setSavedTotal(totalSnapshot);
    setSubmitting(true); setSubmitError(null);
    try {
      const order = await placeOrder(form);
      setLastOrder(order);
      return { order, total: totalSnapshot };
    } catch (e) {
      setSubmitError("Something went wrong. Please try again.");
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // "Place Order" clicked on checkout step
  const handleCheckoutSubmit = async () => {
    if (!validate()) return;
    if (form.paymentMethod === "payroll") {
      setStep("payroll_agree");
    } else {
      const result = await doPlaceOrder();
      if (result) setStep("payment");
    }
  };

  // Payroll agreement confirmed
  const handlePayrollConfirm = async () => {
    const result = await doPlaceOrder();
    if (result) setStep("confirm");
  };

  // Employee confirms they sent payment
  const handlePaymentDone = () => {
    setStep("confirm");
  };

  const pm = paymentMethods.find(m => m.id === form.paymentMethod);

  // ── Empty cart ──
  if (cart.length === 0 && step === "cart") {
    return (
      <div style={{ minHeight:"70vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, background:"#F7F7F7" }}>
        <div style={{ fontSize:56, marginBottom:20 }}>🛒</div>
        <h2 style={{ fontFamily:"'Georgia', serif", fontSize:24, color:"#1a1a1a", marginBottom:8 }}>Your cart is empty</h2>
        <p style={{ color:"#aaa", marginBottom:28, fontSize:15 }}>Head to the shop to find something great.</p>
        <button onClick={() => setPage("shop")} style={primaryBtn}>Browse Products</button>
      </div>
    );
  }

  // ── Payroll Agreement Screen ──
  if (step === "payroll_agree") {
    return (
      <div style={{ background:"#F7F7F7", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"#fff", borderRadius:20, padding:"44px 40px", maxWidth:520, width:"100%", border:"1px solid #EAEAEA", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ width:56, height:56, background:"#FFF0F0", border:"2px solid rgba(162,35,37,0.15)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:24 }}>📋</div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:22, color:"#1a1a1a", marginBottom:12, textAlign:"center" }}>Payroll Deduction Authorization</h2>

          <div style={{ background:"#F7F7F7", border:"1px solid #EAEAEA", borderRadius:12, padding:"18px 20px", marginBottom:24, fontSize:14, color:"#444", lineHeight:1.75 }}>
            <p style={{ marginBottom:10 }}>
              By authorizing a payroll deduction, I understand and agree that a deduction of{" "}
              <strong style={{ color:"#A22325" }}>{formatCurrency(cartTotal)}</strong> will be taken from my paycheck.
              This authorization covers both <strong>voluntary store purchases</strong> and{" "}
              <strong>overpayment corrections</strong> on payroll checks.
            </p>
            <p style={{ marginBottom:10 }}>I understand that:</p>
            <ul style={{ paddingLeft:20, marginBottom:10 }}>
              <li style={{ marginBottom:6 }}>This deduction will appear on my next available pay period</li>
              <li style={{ marginBottom:6 }}>Overpayment deductions may be initiated by the Payroll department directly and do not always require prior HR approval</li>
              <li style={{ marginBottom:6 }}>For questions about overpayments, contact <strong>Payroll</strong> directly</li>
              <li style={{ marginBottom:6 }}>This purchase authorization is for this transaction only</li>
              <li>I may request a copy of this authorization at any time</li>
            </ul>
          </div>

          <label style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", marginBottom:24 }}>
            <input type="checkbox" checked={payrollAgreed} onChange={e => setPayrollAgreed(e.target.checked)}
              style={{ accentColor:"#A22325", width:18, height:18, marginTop:2, flexShrink:0 }} />
            <span style={{ fontSize:14, color:"#333", lineHeight:1.6 }}>
              I authorize the deduction of <strong>{formatCurrency(cartTotal)}</strong> from my paycheck as described above.
            </span>
          </label>

          {submitError && <p style={{ fontSize:13, color:"#A22325", marginBottom:12 }}>{submitError}</p>}

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={handlePayrollConfirm} disabled={!payrollAgreed || submitting} style={{
              flex:1, background: payrollAgreed && !submitting ? "#A22325" : "#EAEAEA",
              color: payrollAgreed && !submitting ? "#fff" : "#aaa",
              border:"none", borderRadius:12, padding:"14px",
              fontSize:14, fontWeight:700,
              cursor: payrollAgreed && !submitting ? "pointer" : "not-allowed",
              boxShadow: payrollAgreed ? "0 4px 16px rgba(162,35,37,0.3)" : "none",
              transition:"all 0.2s",
            }}>
              {submitting ? "Submitting…" : "Agree & Place Order"}
            </button>
            <button onClick={() => setStep("checkout")} style={{ flex:1, background:"#F7F7F7", color:"#666", border:"1.5px solid #EAEAEA", borderRadius:12, padding:"14px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Step (Venmo / PayPal) ──
  if (step === "payment" && lastOrder) {
    const payLink = pm?.link
      ? `${pm.link}?amount=${savedTotal.toFixed(2)}&note=${encodeURIComponent(`Associate Store Order ${lastOrder.id}`)}`
      : pm?.link;

    return (
      <div style={{ background:"#F7F7F7", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"#fff", borderRadius:20, padding:"48px 40px", maxWidth:520, width:"100%", textAlign:"center", border:"1px solid #EAEAEA", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>

          {/* Warning banner */}
          <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A", borderRadius:12, padding:"14px 18px", marginBottom:28 }}>
            <p style={{ fontSize:14, color:"#92400E", fontWeight:700, marginBottom:4 }}>⚠️ Action Required — Payment Not Yet Sent</p>
            <p style={{ fontSize:13, color:"#92400E" }}>Your order has been placed but <strong>payment has not been received</strong>. You must complete payment to finalize your order.</p>
          </div>

          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:24, color:"#1a1a1a", marginBottom:8 }}>Complete Your Payment</h2>
          <p style={{ fontSize:15, color:"#555", marginBottom:6 }}>Order <span style={{ fontFamily:"monospace", color:"#A22325", fontWeight:700 }}>{lastOrder.id}</span></p>
          <p style={{ fontSize:28, fontWeight:800, color:"#A22325", marginBottom:28 }}>{formatCurrency(savedTotal)}</p>

          <div style={{ background:"#F7F7F7", borderRadius:14, padding:"20px 24px", marginBottom:24, textAlign:"left" }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#bbb", marginBottom:12 }}>Send payment to</p>
            <p style={{ fontSize:16, fontWeight:700, color:"#1a1a1a", marginBottom:4 }}>{pm?.label}</p>
            <p style={{ fontSize:14, color:"#555", marginBottom:4 }}>{pm?.handle}</p>
            <p style={{ fontSize:13, color:"#888" }}>
              Include in your payment note: <strong style={{ color:"#1a1a1a" }}>{lastOrder.id}</strong>
            </p>
          </div>

          {/* Open payment app button */}
          {pm?.link && (
            <a href={payLink} target="_blank" rel="noopener noreferrer" style={{
              display:"block", background:"#1a1a1a", color:"#fff",
              borderRadius:12, padding:"15px", fontSize:15, fontWeight:700,
              textDecoration:"none", marginBottom:16, letterSpacing:"0.04em",
              boxShadow:"0 4px 16px rgba(0,0,0,0.15)",
            }}>
              Open {pm.label} to Pay →
            </a>
          )}

          {/* Confirmation checkbox */}
          <label style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", background:"#F0FDF4", border:"1.5px solid #BBF7D0", borderRadius:12, padding:"14px 16px", marginBottom:16, textAlign:"left" }}>
            <input type="checkbox" checked={paymentConfirmed} onChange={e => setPaymentConfirmed(e.target.checked)}
              style={{ accentColor:"#166534", width:18, height:18, flexShrink:0 }} />
            <span style={{ fontSize:14, color:"#166634", fontWeight:600, lineHeight:1.5 }}>
              I have sent {formatCurrency(savedTotal)} via {pm?.label} with reference {lastOrder.id}
            </span>
          </label>

          <button onClick={handlePaymentDone} disabled={!paymentConfirmed} style={{
            width:"100%",
            background: paymentConfirmed ? "#2d7a2d" : "#EAEAEA",
            color: paymentConfirmed ? "#fff" : "#aaa",
            border:"none", borderRadius:12, padding:"15px",
            fontSize:14, fontWeight:700,
            cursor: paymentConfirmed ? "pointer" : "not-allowed",
            boxShadow: paymentConfirmed ? "0 4px 16px rgba(45,122,45,0.3)" : "none",
            transition:"all 0.2s",
          }}>
            ✓ Payment Sent — View Confirmation
          </button>

          <p style={{ fontSize:12, color:"#ccc", marginTop:14 }}>
            If you have trouble paying, contact your store manager.
          </p>
        </div>
      </div>
    );
  }

  // ── Confirmation Screen ──
  if (step === "confirm" && lastOrder) {
    const isPayroll = lastOrder.paymentMethod === "payroll";
    return (
      <div style={{ background:"#F7F7F7", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"#fff", borderRadius:20, padding:"52px 44px", maxWidth:520, width:"100%", textAlign:"center", border:"1px solid #EAEAEA", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ width:68, height:68, background: isPayroll ? "#F0FDF4" : "linear-gradient(135deg, #FFF0F0, #FFE0E0)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:30, border:`2px solid ${isPayroll ? "#BBF7D0" : "rgba(162,35,37,0.15)"}` }}>
            {isPayroll ? "✅" : "🎉"}
          </div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:28, color:"#1a1a1a", marginBottom:8 }}>
            {isPayroll ? "Order Complete!" : `Thank You, ${lastOrder.name.split(" ")[0]}!`}
          </h2>
          <p style={{ color:"#aaa", fontSize:15, marginBottom:6 }}>
            {isPayroll ? "Your payroll deduction has been authorized." : "Your order and payment have been received."}
          </p>
          <p style={{ display:"inline-block", fontSize:12, color:"#A22325", fontWeight:700, letterSpacing:"0.08em", fontFamily:"monospace", background:"#FFF0F0", padding:"5px 14px", borderRadius:8, marginBottom:32, border:"1px solid rgba(162,35,37,0.15)" }}>
            {lastOrder.id}
          </p>

          {/* Order summary */}
          <div style={{ background:"#F7F7F7", borderRadius:14, padding:"20px 24px", marginBottom:20, textAlign:"left" }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#bbb", marginBottom:14 }}>Order Summary</p>
            {lastOrder.items.map((item,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555", marginBottom:8 }}>
                <span>
                  {item.productName}
                  {Object.keys(item.variants).length>0 && <span style={{color:"#bbb"}}> ({Object.entries(item.variants).map(([,v])=>v).join(", ")})</span>}
                  <span style={{color:"#ccc"}}> ×{item.qty}</span>
                </span>
                <span style={{ fontWeight:600, color:"#1a1a1a" }}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
            {lastOrder.discount > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#2d7a2d", paddingTop:8, marginTop:4, borderTop:"1px solid #EAEAEA" }}>
                <span>Discount ({lastOrder.couponCode})</span>
                <span>−{formatCurrency(lastOrder.discount)}</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:17, color:"#1a1a1a", marginTop:12, paddingTop:12, borderTop:"1px solid #EAEAEA" }}>
              <span>Total</span>
              <span style={{ color:"#A22325" }}>{formatCurrency(lastOrder.total)}</span>
            </div>
          </div>

          <button onClick={() => { setStep("cart"); setLastOrder(null); setPayrollAgreed(false); setPaymentConfirmed(false); setPage("shop"); }} style={primaryBtn}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── Cart & Checkout ──
  return (
    <div style={{ background:"#F7F7F7", minHeight:"100vh", padding:"48px 24px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"'Georgia', serif", fontSize:30, color:"#1a1a1a", marginBottom:36, letterSpacing:"-0.01em" }}>
          {step==="cart" ? "Your Cart" : "Checkout"}
        </h1>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:28, alignItems:"start" }}>
          {/* Left */}
          <div>
            {step === "cart" && (
              <>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {cart.map(item => (
                    <div key={item.key} style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:16, padding:"20px 22px", display:"flex", alignItems:"center", gap:18, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:600, fontSize:15, color:"#1a1a1a", marginBottom:4 }}>{item.product.name}</p>
                        {Object.entries(item.variants).length>0 && (
                          <p style={{ fontSize:12, color:"#bbb", marginBottom:4 }}>{Object.entries(item.variants).map(([,v])=>v).join(" · ")}</p>
                        )}
                        <p style={{ fontSize:14, color:"#A22325", fontWeight:700 }}>{formatCurrency(item.product.price)}</p>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", background:"#F7F7F7", borderRadius:10, border:"1px solid #EAEAEA", overflow:"hidden" }}>
                        <button onClick={() => updateQty(item.key, item.qty-1)} style={{ background:"none", border:"none", width:36, height:36, cursor:"pointer", fontSize:16, color:"#555" }}>−</button>
                        <span style={{ padding:"0 14px", fontSize:14, fontWeight:700, color:"#1a1a1a" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.key, item.qty+1)} style={{ background:"none", border:"none", width:36, height:36, cursor:"pointer", fontSize:16, color:"#555" }}>+</button>
                      </div>
                      <div style={{ textAlign:"right", minWidth:72 }}>
                        <p style={{ fontWeight:800, color:"#1a1a1a", fontSize:15 }}>{formatCurrency(item.product.price * item.qty)}</p>
                        <button onClick={() => removeFromCart(item.key)} style={{ background:"none", border:"none", color:"#ddd", cursor:"pointer", fontSize:12, marginTop:4 }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:14, padding:"18px 20px", marginTop:12, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#bbb", marginBottom:12 }}>Coupon Code</p>
                  {appliedCoupon ? (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#F0FDF4", border:"1px solid #B0D8B0", borderRadius:10, padding:"10px 16px" }}>
                      <span style={{ fontSize:13, color:"#1a5c1a", fontWeight:600 }}>✓ {appliedCoupon.code} — {appliedCoupon.description}</span>
                      <button onClick={() => { removeCoupon(); setCouponMsg(null); }} style={{ background:"none", border:"none", color:"#aaa", cursor:"pointer", fontSize:13 }}>Remove</button>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:8 }}>
                      <input value={couponInput} onChange={e => { setCouponInput(e.target.value); setCouponMsg(null); }}
                        onKeyDown={e => e.key==="Enter" && handleApplyCoupon()}
                        placeholder="Enter code..."
                        style={{ flex:1, padding:"11px 14px", border:`1.5px solid ${couponMsg?.type==="error"?"#A22325":"#EAEAEA"}`, borderRadius:10, fontSize:13, outline:"none", background:"#F7F7F7", color:"#1a1a1a" }} />
                      <button onClick={handleApplyCoupon} style={{ background:"#1a1a1a", color:"#fff", border:"none", borderRadius:10, padding:"11px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Apply</button>
                    </div>
                  )}
                  {couponMsg && !appliedCoupon && (
                    <p style={{ fontSize:12, color:couponMsg.type==="error"?"#A22325":"#2d7a2d", marginTop:9 }}>{couponMsg.text}</p>
                  )}
                </div>
              </>
            )}

            {step === "checkout" && (
              <div style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:16, padding:"32px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <h2 style={{ fontSize:17, fontWeight:700, color:"#1a1a1a", marginBottom:28 }}>Your Information</h2>
                <div style={{ display:"grid", gap:20 }}>
                  <Field label="Full Name *" error={errors.name}>
                    <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} style={inp(errors.name)} placeholder="Jane Smith" />
                  </Field>
                  <Field label="Work Email *" error={errors.email}>
                    <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} style={inp(errors.email)} placeholder="jane@company.com" type="email" />
                  </Field>
                  <Field label="Store Number *" error={errors.department}>
                    <input value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))} style={inp(errors.department)} placeholder="e.g. Store #42" />
                  </Field>
                  <Field label="Payment Method">
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                      {paymentMethods.map(pm => (
                        <label key={pm.id} style={{
                          border:"1.5px solid", borderColor:form.paymentMethod===pm.id?"#A22325":"#EAEAEA",
                          borderRadius:12, padding:"12px 14px", cursor:"pointer",
                          background:form.paymentMethod===pm.id?"#FFF0F0":"#fff",
                          display:"flex", alignItems:"center", gap:8, transition:"all 0.15s",
                          boxShadow:form.paymentMethod===pm.id?"0 2px 8px rgba(162,35,37,0.12)":"none",
                        }}>
                          <input type="radio" name="payment" value={pm.id} checked={form.paymentMethod===pm.id}
                            onChange={() => setForm(f=>({...f,paymentMethod:pm.id}))} style={{ accentColor:"#A22325" }} />
                          <span style={{ fontSize:13, fontWeight:600, color:form.paymentMethod===pm.id?"#A22325":"#555" }}>{pm.label}</span>
                        </label>
                      ))}
                    </div>
                    {form.paymentMethod !== "payroll" && (
                      <p style={{ fontSize:12, color:"#A22325", marginTop:10, fontWeight:600, background:"#FFF0F0", padding:"8px 12px", borderRadius:8 }}>
                        ⚠️ After placing your order you will be directed to {paymentMethods.find(p=>p.id===form.paymentMethod)?.label} to complete payment.
                      </p>
                    )}
                  </Field>
                  <Field label="Notes (optional)">
                    <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={3}
                      placeholder="Any special requests..." style={{ ...inp(), resize:"vertical" }} />
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:16, padding:"24px", position:"sticky", top:84, boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#bbb", marginBottom:18 }}>Order Summary</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              {cart.map(item => (
                <div key={item.key} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#777" }}>
                  <span>{item.product.name} ×{item.qty}</span>
                  <span style={{ fontWeight:600, color:"#1a1a1a" }}>{formatCurrency(item.product.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop:"1px solid #EAEAEA", paddingTop:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#aaa", marginBottom:8 }}>
                <span>Subtotal</span><span style={{ color:"#555" }}>{formatCurrency(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#2d7a2d", marginBottom:8 }}>
                  <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                  <span>−{formatCurrency(discount)}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:19, color:"#1a1a1a", marginTop:14, paddingTop:14, borderTop:"1px solid #EAEAEA" }}>
                <span>Total</span>
                <span style={{ color:"#A22325" }}>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            <div style={{ marginTop:22, display:"flex", flexDirection:"column", gap:10 }}>
              {step === "cart" && (
                <button onClick={() => setStep("checkout")} style={primaryBtn}>Checkout →</button>
              )}
              {step === "checkout" && (
                <>
                  {submitError && <p style={{ fontSize:13, color:"#A22325", textAlign:"center" }}>{submitError}</p>}
                  <button onClick={handleCheckoutSubmit} disabled={submitting} style={{ ...primaryBtn, opacity:submitting?0.7:1, cursor:submitting?"not-allowed":"pointer" }}>
                    {submitting ? "Placing Order…" : "Place Order →"}
                  </button>
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
      <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#aaa", marginBottom:8 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize:12, color:"#A22325", marginTop:5 }}>{error}</p>}
    </div>
  );
}
const inp = (err) => ({ width:"100%", padding:"12px 14px", border:`1.5px solid ${err?"#A22325":"#EAEAEA"}`, borderRadius:10, fontSize:14, color:"#1a1a1a", outline:"none", background:"#F7F7F7", boxSizing:"border-box" });
const primaryBtn   = { width:"100%", background:"#A22325", color:"#fff", border:"none", borderRadius:12, padding:"15px", fontSize:14, fontWeight:700, letterSpacing:"0.04em", cursor:"pointer", textTransform:"uppercase", boxShadow:"0 4px 16px rgba(162,35,37,0.3)" };
const secondaryBtn = { width:"100%", background:"#F7F7F7", color:"#666", border:"1.5px solid #EAEAEA", borderRadius:12, padding:"14px", fontSize:13, fontWeight:600, cursor:"pointer" };
