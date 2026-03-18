import { categoryColors, categoryEmoji, formatCurrency } from "../data/utils";

export default function ProductCard({ product, onClick }) {
  const colors = categoryColors[product.category] || { bg: "#1a1a1a", accent: "#A22325" };
  const emoji  = categoryEmoji[product.category] || "📦";
  const hasVariants = Object.keys(product.variants).length > 0;

  return (
    <article
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.18s, box-shadow 0.18s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image placeholder */}
      <div style={{
        background: colors.bg,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <span style={{ fontSize: 56 }}>{emoji}</span>
        <span style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "#A22325",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 4,
        }}>{product.category}</span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#111",
          margin: "0 0 6px",
          fontFamily: "'Georgia', serif",
          lineHeight: 1.3,
        }}>{product.name}</h3>
        <p style={{
          fontSize: 12,
          color: "#777",
          margin: "0 0 14px",
          lineHeight: 1.5,
          flex: 1,
        }}>{product.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#A22325" }}>
            {formatCurrency(product.price)}
          </span>
          {hasVariants && (
            <span style={{ fontSize: 11, color: "#999", letterSpacing: "0.06em" }}>
              {Object.keys(product.variants).join(" · ").toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* CTA bar */}
      <div style={{
        background: "#111",
        color: "#fff",
        textAlign: "center",
        padding: "10px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        transition: "background 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#A22325"}
        onMouseLeave={e => e.currentTarget.style.background = "#111"}
      >
        Select Options
      </div>
    </article>
  );
}
