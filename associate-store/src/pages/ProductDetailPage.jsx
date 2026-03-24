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
  const colors      = categoryColors[product.category] || { bg: "#111", accent: "#A22325" };
  const emoji       = categoryEmoji[product.category] || "📦";

  const handleAdd = (andGo = false) => {
    if (!canAdd) return;
    addToCart(product, selected, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    if (andGo) setPage("cart");
  };

  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "14px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "#A22325",
            cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Shop
          </button>
          <span style={{ color: "#ddd" }}>/</span>
          <span style={{ fontSize: 13, color: "#bbb" }}>{product.category}</span>
          <span style={{ color: "#ddd" }}>/</span>
          <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Image */}
          <div style={{
            background: colors.bg,
            borderRadius: 20,
            aspectRatio: "1/1",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", position: "relative",
          }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 110, opacity: 0.9 }}>{emoji}</span>
            )}
            <div style={{
              position: "absolute", top: 16, left: 16,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              color: "#fff", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "5px 12px", borderRadius: 20,
            }}>{product.category}</div>
          </div>

          {/* Details */}
          <div>
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: 34, fontWeight: 700, color: "#0a0a0a",
              margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-0.01em",
            }}>{product.name}</h1>

            <p style={{ fontSize: 30, fontWeight: 800, color: "#0a0a0a", margin: "0 0 24px" }}>
              {formatCurrency(product.price)}
            </p>

            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.75, marginBottom: 32 }}>
              {product.description}
            </p>

            <div style={{ width: 40, height: 2, background: "#f0f0f0", marginBottom: 32 }} />

            {/* Variants */}
            {variantKeys.map(key => (
              <div key={key} style={{ marginBottom: 28 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#aaa", marginBottom: 12,
                }}>
                  {key}
                  {selected[key] && <span style={{ color: "#0a0a0a", marginLeft: 8, fontWeight: 600 }}>— {selected[key]}</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(product.variants[key] || []).map(opt => (
                    <button key={opt} onClick={() => setSelected(s => ({ ...s, [key]: opt }))} style={{
                      padding: "9px 20px",
                      border: "1.5px solid",
                      borderColor: selected[key] === opt ? "#0a0a0a" : "#e8e8e8",
                      borderRadius: 10,
                      background: selected[key] === opt ? "#0a0a0a" : "#fff",
                      color: selected[key] === opt ? "#fff" : "#444",
                      fontSize: 13, fontWeight: 500, cursor: "pointer",
                      transition: "all 0.15s",
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}

            {/* Qty */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>Quantity</p>
              <div style={{
                display: "inline-flex", alignItems: "center",
                border: "1.5px solid #e8e8e8", borderRadius: 12, overflow: "hidden",
              }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ background: "#f9f9f9", border: "none", width: 44, height: 44, cursor: "pointer", fontSize: 18, color: "#444" }}>−</button>
                <span style={{ padding: "0 24px", fontSize: 15, fontWeight: 700, color: "#0a0a0a" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  style={{ background: "#f9f9f9", border: "none", width: 44, height: 44, cursor: "pointer", fontSize: 18, color: "#444" }}>+</button>
              </div>
            </div>

            {!canAdd && variantKeys.length > 0 && (
              <p style={{ fontSize: 13, color: "#A22325", marginBottom: 14 }}>
                Please select {variantKeys.filter(k => !selected[k]).join(" and ")} to continue.
              </p>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => handleAdd(false)} disabled={!canAdd} style={{
                flex: 1,
                background: added ? "#1a5c1a" : canAdd ? "#A22325" : "#e0e0e0",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "16px 24px", fontSize: 14, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: canAdd ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}>
                {added ? "✓ Added!" : `Add to Cart — ${formatCurrency(product.price * qty)}`}
              </button>
              <button onClick={() => handleAdd(true)} disabled={!canAdd} style={{
                background: canAdd ? "#0a0a0a" : "#e0e0e0",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "16px 20px", fontSize: 13, fontWeight: 600,
                cursor: canAdd ? "pointer" : "not-allowed", opacity: canAdd ? 1 : 0.5,
                whiteSpace: "nowrap",
              }}>Buy Now</button>
            </div>

            <p style={{ fontSize: 12, color: "#ccc", marginTop: 20, lineHeight: 1.8 }}>
              🔒 Secure internal store &nbsp;·&nbsp; Associate pricing only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
