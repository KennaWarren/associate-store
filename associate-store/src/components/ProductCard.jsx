import { categoryEmoji, formatCurrency } from "../data/utils";

const categoryAccents = {
  Apparel:     "#FFF0F0",
  Accessories: "#F0FFF4",
  Bags:        "#FFF8F0",
  Office:      "#F5F0FF",
};

export default function ProductCard({ product, onClick }) {
  const emoji       = categoryEmoji[product.category] || "📦";
  const accentBg    = categoryAccents[product.category] || "#F7F7F7";
  const hasVariants = Object.keys(product.variants || {}).length > 0;

  return (
    <article
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #EAEAEA",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
    >
      {/* Image area */}
      <div style={{
        background: "#F7F7F7",
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: product.image ? "8px" : 0,
      }}>
        {product.image ? (
          <img src={product.image} alt={product.name}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
        ) : (
          <span style={{ fontSize: 56 }}>{emoji}</span>
        )}

        {/* Category badge */}
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(4px)",
          color: "#555",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.06)",
        }}>{product.category}</span>

        {hasVariants && (
          <span style={{
            position: "absolute", top: 12, right: 12,
            background: "#A22325",
            color: "#fff", fontSize: 10, fontWeight: 600,
            padding: "4px 10px", borderRadius: 20,
            letterSpacing: "0.06em",
          }}>Options</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontSize: 15, fontWeight: 600, color: "#1a1a1a",
          margin: "0 0 6px", lineHeight: 1.35, flex: 1,
        }}>{product.name}</h3>
        <p style={{
          fontSize: 13, color: "#aaa", margin: "0 0 16px",
          lineHeight: 1.55, display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{product.description}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 19, fontWeight: 800, color: "#1a1a1a" }}>
            {formatCurrency(product.price)}
          </span>
          <span style={{
            background: "#A22325",
            color: "#fff",
            fontSize: 12, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "7px 16px", borderRadius: 8,
            boxShadow: "0 2px 8px rgba(162,35,37,0.25)",
            transition: "background 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#8a1e20"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(162,35,37,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#A22325"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(162,35,37,0.25)"; }}
          >View →</span>
        </div>
      </div>
    </article>
  );
}
