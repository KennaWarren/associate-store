import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { categoryEmoji, formatCurrency } from "../data/utils";

const categoryAccents = {
  Apparel:     "#FFF0F0",
  Accessories: "#F0FFF4",
  Drinkware:   "#F0F4FF",
  Bags:        "#FFF8F0",
  Office:      "#F5F0FF",
};

export default function ProductDetailPage({ product, onBack, setPage }) {
  const { addToCart } = useStore();
  const [selected, setSelected] = useState({});
  const [qty, setQty]           = useState(1);
  const [added, setAdded]       = useState(false);

  const variantKeys = Object.keys(product.variants || {});
  const allSelected = variantKeys.every(k => selected[k]);
  const canAdd      = variantKeys.length === 0 || allSelected;
  const emoji       = categoryEmoji[product.category] || "📦";
  const accentBg    = categoryAccents[product.category] || "#F7F7F7";

  const handleAdd = (andGo = false) => {
    if (!canAdd) return;
    addToCart(product, selected, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    if (andGo) setPage("cart");
  };

  return (
    <div style={{ background: "#F7F7F7", minHeight: "100vh" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EAEAEA", padding: "14px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "#A22325",
            cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Shop
          </button>
          <span style={{ color: "#ddd" }}>/</span>
          <span style={{ fontSize: 13, color: "#bbb" }}>{product.category}</span>
          <span style={{ color: "#ddd" }}>/</span>
          <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Image */}
          <div style={{
            background: product.image ? "#F7F7F7" : accentBg,
            borderRadius: 20,
            aspectRatio: "1/1",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", position: "relative",
            border: "1px solid #EAEAEA",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}>
            {product.image ? (
              <img src={product.image} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 110 }}>{emoji}</span>
            )}
            <div style={{
              position: "absolute", top: 16, left: 16,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              color: "#555", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "5px 12px", borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.06)",
            }}>{product.category}</div>
          </div>

          {/* Details */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "40px 36px", border: "1px solid #EAEAEA", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: 32, fontWeight: 700, color: "#1a1a1a",
              margin: "0 0 10px", lineHeight: 1.2, letterSpacing: "-0.01em",
            }}>{product.name}</h1>

            <p style={{ fontSize: 30, fontWeight: 800, color: "#A22325", margin: "0 0 20px", letterSpacing: "-0.01em" }}>
              {formatCurrency(product.price)}
            </p>

            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.75, marginBottom: 28 }}>
              {product.description}
            </p>

            <div style={{ height: 1, background: "#EAEAEA", marginBottom: 28 }} />

            {/* Variants */}
            {variantKeys.map(key => (
              <div key={key} style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#bbb", marginBottom: 10,
                }}>
                  {key}
                  {selected[key] && (
                    <span style={{ color: "#1a1a1a", marginLeft: 8, fontWeight: 600, letterSpacing: 0, textTransform: "none", fontSize: 13 }}>
                      — {selected[key]}
                    </span>
                  )}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(product.variants[key] || []).map(opt => (
                    <button key={opt} onClick={() => setSelected(s => ({ ...s, [key]: opt }))} style={{
                      padding: "9px 20px",
                      border: "1.5px solid",
                      borderColor: selected[key] === opt ? "#A22325" : "#EAEAEA",
                      borderRadius: 10,
                      background: selected[key] === opt ? "#A22325" : "#fff",
                      color: selected[key] === opt ? "#fff" : "#444",
                      fontSize: 13, fontWeight: 500, cursor: "pointer",
                      transition: "all 0.15s",
                      boxShadow: selected[key] === opt ? "0 2px 8px rgba(162,35,37,0.25)" : "none",
                    }}
                      onMouseEnter={e => { if (selected[key] !== opt) e.currentTarget.style.borderColor = "#A22325"; }}
                      onMouseLeave={e => { if (selected[key] !== opt) e.currentTarget.style.borderColor = "#EAEAEA"; }}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb", marginBottom: 10 }}>Quantity</p>
              <div style={{
                display: "inline-flex", alignItems: "center",
                border: "1.5px solid #EAEAEA", borderRadius: 12,
                overflow: "hidden", background: "#F7F7F7",
              }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ background: "none", border: "none", width: 44, height: 44, cursor: "pointer", fontSize: 18, color: "#555" }}>−</button>
                <span style={{ padding: "0 22px", fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  style={{ background: "none", border: "none", width: 44, height: 44, cursor: "pointer", fontSize: 18, color: "#555" }}>+</button>
              </div>
            </div>

            {!canAdd && variantKeys.length > 0 && (
              <p style={{ fontSize: 13, color: "#A22325", marginBottom: 14, fontWeight: 500 }}>
                Please select {variantKeys.filter(k => !selected[k]).join(" and ")} to continue.
              </p>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => handleAdd(false)} disabled={!canAdd} style={{
                flex: 1,
                background: added ? "#2d7a2d" : canAdd ? "#A22325" : "#EAEAEA",
                color: canAdd || added ? "#fff" : "#aaa",
                border: "none", borderRadius: 12,
                padding: "15px 20px", fontSize: 14, fontWeight: 700,
                letterSpacing: "0.04em",
                cursor: canAdd ? "pointer" : "not-allowed",
                transition: "background 0.2s",
                boxShadow: canAdd && !added ? "0 4px 16px rgba(162,35,37,0.3)" : "none",
              }}
                onMouseEnter={e => { if (canAdd && !added) e.currentTarget.style.background = "#8a1e20"; }}
                onMouseLeave={e => { if (canAdd && !added) e.currentTarget.style.background = "#A22325"; }}
              >
                {added ? "✓ Added to Cart!" : `Add to Cart — ${formatCurrency(product.price * qty)}`}
              </button>

              <button onClick={() => handleAdd(true)} disabled={!canAdd} style={{
                background: canAdd ? "#1a1a1a" : "#EAEAEA",
                color: canAdd ? "#fff" : "#aaa",
                border: "none", borderRadius: 12,
                padding: "15px 18px", fontSize: 13, fontWeight: 600,
                cursor: canAdd ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => { if (canAdd) e.currentTarget.style.background = "#333"; }}
                onMouseLeave={e => { if (canAdd) e.currentTarget.style.background = "#1a1a1a"; }}
              >Buy Now</button>
            </div>

            <p style={{ fontSize: 12, color: "#ccc", marginTop: 18, lineHeight: 1.8, textAlign: "center" }}>
              🔒 Secure internal store · Associate pricing only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
