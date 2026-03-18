import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { categoryColors, categoryEmoji, formatCurrency } from "../data/utils";

export default function ProductModal({ product, onClose, setPage }) {
  const { addToCart } = useStore();
  const [selected, setSelected]   = useState({});
  const [qty, setQty]             = useState(1);
  const [added, setAdded]         = useState(false);

  const variantKeys   = Object.keys(product.variants);
  const allSelected   = variantKeys.every(k => selected[k]);
  const canAdd        = variantKeys.length === 0 || allSelected;

  const colors = categoryColors[product.category] || { bg: "#1a1a1a", accent: "#A22325" };
  const emoji  = categoryEmoji[product.category] || "📦";

  const handleAdd = () => {
    if (!canAdd) return;
    addToCart(product, selected, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Image */}
        <div style={{
          background: colors.bg,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          borderRadius: "14px 14px 0 0",
        }}>
          <span style={{ fontSize: 72 }}>{emoji}</span>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(255,255,255,0.15)",
              border: "none", color: "#fff", borderRadius: "50%",
              width: 32, height: 32, cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Content */}
        <div style={{ padding: 28 }}>
          <p style={{ fontSize: 11, color: "#A22325", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            {product.category}
          </p>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 24, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>
            {product.name}
          </h2>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>
            {product.description}
          </p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#A22325", marginBottom: 24 }}>
            {formatCurrency(product.price)}
          </p>

          {/* Variants */}
          {variantKeys.map(key => (
            <div key={key} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#333", marginBottom: 10 }}>
                {key}
                {selected[key] && <span style={{ color: "#A22325", marginLeft: 8 }}>— {selected[key]}</span>}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {product.variants[key].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelected(s => ({ ...s, [key]: opt }))}
                    style={{
                      padding: "7px 16px",
                      border: "1.5px solid",
                      borderColor: selected[key] === opt ? "#A22325" : "#ddd",
                      borderRadius: 6,
                      background: selected[key] === opt ? "#A22325" : "#fff",
                      color: selected[key] === opt ? "#fff" : "#333",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >{opt}</button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#333", marginBottom: 10 }}>Quantity</p>
            <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #ddd", borderRadius: 8, width: "fit-content", overflow: "hidden" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: "#f5f5f5", border: "none", width: 40, height: 40, cursor: "pointer", fontSize: 18, color: "#333" }}>−</button>
              <span style={{ padding: "0 20px", fontWeight: 600, fontSize: 15, color: "#111" }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ background: "#f5f5f5", border: "none", width: 40, height: 40, cursor: "pointer", fontSize: 18, color: "#333" }}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              style={{
                flex: 1,
                background: added ? "#2d7a2d" : canAdd ? "#A22325" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: canAdd ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              {added ? "✓ Added to Cart" : !canAdd ? "Select Options Above" : `Add to Cart — ${formatCurrency(product.price * qty)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
