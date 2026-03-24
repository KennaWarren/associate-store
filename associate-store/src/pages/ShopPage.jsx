import { useState } from "react";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import ProductDetailPage from "./ProductDetailPage";

export default function ShopPage({ setPage }) {
  const { products } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");

  const allCategories = ["All", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchCat    = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (selectedProduct) {
    return <ProductDetailPage product={selectedProduct} onBack={() => setSelectedProduct(null)} setPage={setPage} />;
  }

  return (
    <div style={{ background: "#F7F7F7", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #fff 0%, #FFF5F5 50%, #FFF0F0 100%)",
        padding: "80px 32px 64px",
        textAlign: "center",
        borderBottom: "1px solid #EAEAEA",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%", background:"rgba(162,35,37,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:180, height:180, borderRadius:"50%", background:"rgba(162,35,37,0.03)", pointerEvents:"none" }} />

        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            background: "#FFF0F0",
            border: "1px solid rgba(162,35,37,0.2)",
            color: "#A22325",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "6px 16px", borderRadius: 20, marginBottom: 24,
          }}>WELCOME TO</span>

          <h1 style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            color: "#1a1a1a", fontWeight: 700,
            margin: "0 0 18px", letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>The Associate Store</h1>

          <p style={{
            color: "#777", fontSize: 17,
            maxWidth: 420, margin: "0 auto 36px", lineHeight: 1.7,
          }}>
            This exclusive space was created just for you—our Rogers & Hollands | Ashcroft & Oak family. After seeing how much our team loved the branded jackets, polos, water bottles, and backpacks we gifted, many of you asked for a way to get more. We heard you—and we’re thrilled to now offer these inspired items, available for purchase right here.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 400, margin: "0 auto", position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents:"none" }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px 14px 46px",
                borderRadius: 12, border: "1.5px solid #EAEAEA",
                background: "#fff", color: "#1a1a1a",
                fontSize: 14, outline: "none", boxSizing: "border-box",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor = "#A22325"; e.target.style.boxShadow = "0 2px 16px rgba(162,35,37,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#EAEAEA"; e.target.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EAEAEA", padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 6, padding: "14px 0", overflowX: "auto" }}>
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "8px 20px",
              border: "1.5px solid",
              borderColor: activeCategory === cat ? "#A22325" : "#EAEAEA",
              borderRadius: 24,
              background: activeCategory === cat ? "#A22325" : "#fff",
              color: activeCategory === cat ? "#fff" : "#666",
              fontSize: 13, fontWeight: activeCategory === cat ? 700 : 500,
              cursor: "pointer", whiteSpace: "nowrap",
              letterSpacing: "0.02em",
              transition: "all 0.15s",
              boxShadow: activeCategory === cat ? "0 2px 8px rgba(162,35,37,0.25)" : "none",
            }}
              onMouseEnter={e => { if (activeCategory !== cat) { e.currentTarget.style.borderColor = "#A22325"; e.currentTarget.style.color = "#A22325"; }}}
              onMouseLeave={e => { if (activeCategory !== cat) { e.currentTarget.style.borderColor = "#EAEAEA"; e.currentTarget.style.color = "#666"; }}}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 80px" }}>
        <p style={{ fontSize: 13, color: "#bbb", marginBottom: 28, letterSpacing: "0.04em" }}>
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        </p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#ccc" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16, color: "#aaa" }}>No products found.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

