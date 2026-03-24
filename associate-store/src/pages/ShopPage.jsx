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
    <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{
        background: "#0a0a0a",
        padding: "72px 32px 56px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle grid bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, #1f1f1f 1px, transparent 0)",
          backgroundSize: "32px 32px",
          opacity: 0.6,
        }} />
        {/* Red accent line */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 3, background: "#A22325", borderRadius: 2 }} />

        <div style={{ position: "relative" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(162,35,37,0.15)",
            border: "1px solid rgba(162,35,37,0.3)",
            color: "#A22325",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            padding: "5px 14px", borderRadius: 20, marginBottom: 20,
          }}>Associates Only</span>

          <h1 style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            color: "#fff", fontWeight: 700,
            margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>The Associate Store</h1>

          <p style={{
            color: "#555", fontSize: 16,
            maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7,
          }}>
            Exclusive merchandise for our team. Quality goods at member-only pricing.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 380, margin: "0 auto", position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "13px 16px 13px 42px",
                borderRadius: 12, border: "1px solid #1f1f1f",
                background: "#141414", color: "#fff",
                fontSize: 14, outline: "none", boxSizing: "border-box",
              }} />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 32px", overflowX: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 6, padding: "14px 0" }}>
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "7px 18px",
              border: "1.5px solid",
              borderColor: activeCategory === cat ? "#0a0a0a" : "#eee",
              borderRadius: 24,
              background: activeCategory === cat ? "#0a0a0a" : "#fff",
              color: activeCategory === cat ? "#fff" : "#777",
              fontSize: 12, fontWeight: activeCategory === cat ? 700 : 400,
              cursor: "pointer", whiteSpace: "nowrap",
              letterSpacing: "0.04em",
              transition: "all 0.15s",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px 80px" }}>
        <p style={{ fontSize: 12, color: "#bbb", marginBottom: 24, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {filtered.length} Product{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "All" ? ` — ${activeCategory}` : ""}
        </p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#ccc" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16 }}>No products found.</p>
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
