import { useStore } from "../context/StoreContext";

export default function Header({ page, setPage }) {
  const { cartCount } = useStore();

  return (
    <header style={{
      background: "#0a0a0a",
      borderBottom: "1px solid #1f1f1f",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 32px",
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button onClick={() => setPage("shop")} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 32, height: 32,
            background: "#A22325",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "Georgia, serif" }}>A</span>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Your Company
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 1 }}>
              Associate Store
            </div>
          </div>
        </button>

        <nav style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <NavBtn active={page === "shop"} onClick={() => setPage("shop")}>Shop</NavBtn>
          <NavBtn active={page === "admin"} onClick={() => setPage("admin")}>Admin</NavBtn>
          <button onClick={() => setPage("cart")} style={{
            marginLeft: 8,
            background: page === "cart" ? "#A22325" : "transparent",
            border: "1px solid",
            borderColor: page === "cart" ? "#A22325" : "#2a2a2a",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Cart
            {cartCount > 0 && (
              <span style={{
                background: "#A22325", color: "#fff",
                borderRadius: "50%", width: 18, height: 18,
                fontSize: 10, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cartCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#1a1a1a" : "none",
      border: "none",
      color: active ? "#fff" : "#555",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      cursor: "pointer",
      padding: "8px 16px",
      borderRadius: 8,
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

