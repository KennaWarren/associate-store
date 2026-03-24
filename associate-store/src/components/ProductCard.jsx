import { categoryColors, categoryEmoji, formatCurrency } from "../data/utils";

export default function ProductCard({ product, onClick }) {
  const colors = categoryColors[product.category] || { bg: "#111", accent: "#A22325" };
  const emoji  = categoryEmoji[product.category] || "📦";
  const hasVariants = Object.keys(product.variants || {}).length > 0;

  return (
    <article
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #f0f0f0",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image */}
      <div style={{
        background: colors.bg,
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {product.image ? (
          <img src={product.image} alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 52, opacity: 0.9 }}>{emoji}</span>
        )}
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 20,
        }}>{product.category}</span>
        {hasVariants && (
          <span style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            color: "#fff", fontSize: 10,
            padding: "4px 10px", borderRadius: 20,
            letterSpacing: "0.08em",
          }}>Options</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontSize: 15, fontWeight: 600, color: "#0a0a0a",
          margin: "0 0 6px", lineHeight: 1.35, flex: 1,
        }}>{product.name}</h3>
        <p style={{
          fontSize: 12, color: "#aaa", margin: "0 0 16px",
          lineHeight: 1.5, display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{product.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#0a0a0a" }}>
            {formatCurrency(product.price)}
          </span>
          <span style={{
            background: "#0a0a0a", color: "#fff",
            fontSize: 11, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "7px 14px", borderRadius: 8,
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#A22325"}
            onMouseLeave={e => e.currentTarget.style.background = "#0a0a0a"}
          >View →</span>
        </div>
      </div>
    </article>
  );
}
