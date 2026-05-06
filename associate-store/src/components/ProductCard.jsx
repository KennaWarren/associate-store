import { categoryEmoji, formatCurrency } from "../data/utils";

const categoryAccents = {
  Apparel:     "#FFF0F0",
  Accessories: "#F0FFF4",
  Drinkware:   "#F0F4FF",
  Bags:        "#FFF8F0",
  Office:      "#F5F0FF",
};

export default function ProductCard({ product, onClick }) {
  const emoji       = categoryEmoji[product.category] || "📦";
  const accentBg    = categoryAccents[product.category] || "#F7F7F7";
  const hasVariants = Object.keys(product.variants || {}).length > 0;

  // Resolve display image: use __default__ variant image if set, else product.image
  const variantImages = product.variantImages || {};
  const defaultImgKey = variantImages.__default__;
  const displayImage  = defaultImgKey
    ? variantImages[defaultImgKey] || product.image || ""
    : product.image || "";

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
      {/* Image area — no category badge shown */}
      <div style={{
        background: displayImage ? "#F7F7F7" : accentBg,
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: displayImage ? "8px" : 0,
      }}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", display:"block" }}
          />
        ) : (
          <span style={{ fontSize: 56 }}>{emoji}</span>
        )}

        {/* Only show "Options" badge if has variants — no category label */}
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
            background: "#A22325", color: "#fff",
            fontSize: 12, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "7px 16px", borderRadius: 8,
            boxShadow: "0 2px 8px rgba(162,35,37,0.25)",
            transition: "background 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background="#8a1e20"; e.currentTarget.style.boxShadow="0 4px 12px rgba(162,35,37,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#A22325"; e.currentTarget.style.boxShadow="0 2px 8px rgba(162,35,37,0.25)"; }}
          >View →</span>
        </div>
      </div>
    </article>
  );
}
