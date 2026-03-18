import { useStore } from "../context/StoreContext";

export default function Header({ page, setPage }) {
  const { cartCount } = useStore();

  return (
    <header style={{
      background: "#111",
      borderBottom: "3px solid #A22325",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <button onClick={() => setPage("shop")} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
        }}>
          <span style={{
            fontFamily: "'Georgia', serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.04em",
          }}>The Associate Store</span>
          <span style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#A22325",
            marginTop: 1,
          }}>Associate Store</span>
        </button>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NavBtn active={page === "shop"} onClick={() => setPage("shop")}>Shop</NavBtn>
          <NavBtn active={page === "admin"} onClick={() => setPage("admin")}>Admin</NavBtn>
          <button
            onClick={() => setPage("cart")}
            style={{
              background: page === "cart" ? "#A22325" : "transparent",
              border: "1.5px solid",
              borderColor: page === "cart" ? "#A22325" : "#444",
              color: "#fff",
              borderRadius: 6,
              padding: "7px 16px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            Cart
            {cartCount > 0 && (
              <span style={{
                background: "#A22325",
                color: "#fff",
                borderRadius: "50%",
                width: 20,
                height: 20,
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 2,
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
      background: "none",
      border: "none",
      color: active ? "#fff" : "#999",
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      cursor: "pointer",
      padding: "8px 12px",
      borderRadius: 4,
      transition: "color 0.15s",
    }}>{children}</button>
  );
}
