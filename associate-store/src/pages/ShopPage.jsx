import { useState } from "react";
import { products, categories } from "../data/products";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

export default function ShopPage({ setPage }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #111 0%, #1a1a1a 50%, #0d0d0d 100%)",
        padding: "60px 24px",
        textAlign: "center",
        borderBottom: "3px solid #A22325",
      }}>
        <p style={{ fontSize: 11, color: "#A22325", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
          For Associates Only
        </p>
        <h1 style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          color: "#fff",
          fontWeight: 700,
          margin: "0 0 16px",
          letterSpacing: "-0.01em",
        }}>The Associate Store</h1>
        <p style={{ color: "#aaa", fontSize: 16, maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.6 }}>
          Exclusive company merchandise, available only to our team.
          Quality goods at associate-only pricing.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: 8,
              border: "1.5px solid #333",
              background: "#1a1a1a",
              color: "#fff",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #eee",
        padding: "0 24px",
        overflowX: "auto",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          gap: 4,
          padding: "12px 0",
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 16px",
                border: "1.5px solid",
                borderColor: activeCategory === cat ? "#A22325" : "#e0e0e0",
                borderRadius: 20,
                background: activeCategory === cat ? "#A22325" : "#fff",
                color: activeCategory === cat ? "#fff" : "#555",
                fontSize: 13,
                fontWeight: activeCategory === cat ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ background: "#f7f7f7", padding: "32px 24px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          </p>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
              <p style={{ fontSize: 16 }}>No products found.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 24,
            }}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          setPage={setPage}
        />
      )}
    </div>
  );
}
