import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { categoryColors, categoryEmoji, formatCurrency } from "../data/utils";

export default function ProductDetailPage({ product, onBack, setPage }) {
  const { addToCart } = useStore();
  const [selected, setSelected] = useState({});
  const [qty, setQty]           = useState(1);
  const [added, setAdded]       = useState(false);

  const variantKeys = Object.keys(product.variants || {});
  const allSelected = variantKeys.every(k => selected[k]);
  const canAdd      = variantKeys.length === 0 || allSelected;
  const colors      = categoryColors[product.category] || { bg:"#1a1a1a", accent:"#A22325" };
  const emoji       = categoryEmoji[product.category]  || "📦";

  const handleAdd = () => {
    if (!canAdd) return;
    addToCart(product, selected, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div style={{ background:"#f7f7f7", minHeight:"100vh" }}>
      {/* Breadcrumb */}
      <div style={{ background:"#fff", borderBottom:"1px solid #eee", padding:"12px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#A22325", cursor:"pointer", fontSize:13, fontWeight:600, letterSpacing:"0.04em", padding:0 }}>
            ← Back to Shop
          </button>
          <span style={{ color:"#ccc", margin:"0 10px" }}>/</span>
          <span style={{ fontSize:13, color:"#888" }}>{product.category}</span>
          <span style={{ color:"#ccc", margin:"0 10px" }}>/</span>
          <span style={{ fontSize:13, color:"#333" }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>

          {/* ── Left: Image ── */}
          <div>
            <div style={{
              background: colors.bg,
              borderRadius:14,
              aspectRatio:"1/1",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              position:"relative",
              overflow:"hidden",
            }}>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              ) : (
                <span style={{ fontSize:100 }}>{emoji}</span>
              )}
              <span style={{
                position:"absolute", top:16, left:16,
                background:"#A22325", color:"#fff",
                fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                padding:"4px 10px", borderRadius:4,
              }}>{product.category}</span>
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div>
            <h1 style={{ fontFamily:"'Georgia', serif", fontSize:32, fontWeight:700, color:"#111", marginBottom:10, lineHeight:1.2 }}>
              {product.name}
            </h1>
            <p style={{ fontSize:28, fontWeight:700, color:"#A22325", marginBottom:20 }}>
              {formatCurrency(product.price)}
            </p>
            <p style={{ fontSize:15, color:"#555", lineHeight:1.7, marginBottom:28 }}>
              {product.description}
            </p>

            {/* Variants */}
            {variantKeys.map(key => (
              <div key={key} style={{ marginBottom:24 }}>
                <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#333", marginBottom:10 }}>
                  {key}
                  {selected[key] && <span style={{ color:"#A22325", marginLeft:8, fontWeight:400, letterSpacing:0, textTransform:"none" }}>— {selected[key]}</span>}
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {(product.variants[key] || []).map(opt => (
                    <button key={opt} onClick={() => setSelected(s => ({ ...s, [key]: opt }))} style={{
                      padding:"9px 18px",
                      border:"1.5px solid",
                      borderColor: selected[key]===opt ? "#A22325" : "#ddd",
                      borderRadius:8,
                      background: selected[key]===opt ? "#A22325" : "#fff",
                      color: selected[key]===opt ? "#fff" : "#333",
                      fontSize:14, fontWeight:500, cursor:"pointer",
                      transition:"all 0.15s",
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#333", marginBottom:10 }}>Quantity</p>
              <div style={{ display:"flex", alignItems:"center", border:"1.5px solid #ddd", borderRadius:8, width:"fit-content", overflow:"hidden" }}>
                <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ background:"#f5f5f5", border:"none", width:44, height:44, cursor:"pointer", fontSize:20, color:"#333" }}>−</button>
                <span style={{ padding:"0 24px", fontWeight:600, fontSize:16, color:"#111" }}>{qty}</span>
                <button onClick={() => setQty(q => q+1)} style={{ background:"#f5f5f5", border:"none", width:44, height:44, cursor:"pointer", fontSize:20, color:"#333" }}>+</button>
              </div>
            </div>

            {/* CTA */}
            {!canAdd && variantKeys.length > 0 && (
              <p style={{ fontSize:13, color:"#A22325", marginBottom:10 }}>
                Please select {variantKeys.filter(k => !selected[k]).join(" and ")} to continue.
              </p>
            )}
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={handleAdd} disabled={!canAdd} style={{
                flex:1,
                background: added ? "#2d7a2d" : canAdd ? "#A22325" : "#ccc",
                color:"#fff", border:"none", borderRadius:8,
                padding:"15px 24px", fontSize:15, fontWeight:700,
                letterSpacing:"0.06em", textTransform:"uppercase",
                cursor: canAdd ? "pointer" : "not-allowed",
                transition:"background 0.2s",
              }}>
                {added ? "✓ Added to Cart!" : `Add to Cart — ${formatCurrency(product.price * qty)}`}
              </button>
              <button onClick={() => { handleAdd(); if(canAdd) setPage("cart"); }} disabled={!canAdd} style={{
                background:"#111", color:"#fff", border:"none", borderRadius:8,
                padding:"15px 20px", fontSize:14, fontWeight:600, cursor: canAdd ? "pointer" : "not-allowed",
                opacity: canAdd ? 1 : 0.4,
              }}>
                Buy Now
              </button>
            </div>

            {/* Meta */}
            <div style={{ marginTop:28, paddingTop:24, borderTop:"1px solid #eee" }}>
              <p style={{ fontSize:12, color:"#aaa", lineHeight:1.8 }}>
                🔒 Secure internal store &nbsp;·&nbsp; Associate pricing &nbsp;·&nbsp; Questions? Contact HR
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
