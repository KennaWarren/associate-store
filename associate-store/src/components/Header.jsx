import { useStore } from "../context/StoreContext";

export default function Header({ page, setPage }) {
  const { cartCount } = useStore();

  return (
    <header style={{
      background: "#FFFFFF",
      borderBottom: "1px solid #EAEAEA",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 32px",
        height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <button onClick={() => setPage("shop")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12, padding:0 }}>
          <div style={{ width:36, height:36, background:"#A22325", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(162,35,37,0.3)" }}>
            <span style={{ color:"#fff", fontSize:16, fontWeight:800, fontFamily:"Georgia, serif" }}>A</span>
          </div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a", letterSpacing:"0.04em" }}>Rogers & Hollands | Ashcroft & Oak</div>
            <div style={{ fontSize:10, color:"#A22325", letterSpacing:"0.16em", textTransform:"uppercase", marginTop:1, fontWeight:600 }}>Associate Store</div>
          </div>
        </button>

        {/* Nav */}
        <nav style={{ display:"flex", gap:4, alignItems:"center" }}>
          <NavBtn active={page==="shop"}        onClick={() => setPage("shop")}>Shop</NavBtn>
          <NavBtn active={page==="suggestions"} onClick={() => setPage("suggestions")}>Suggestions</NavBtn>
          <NavBtn active={page==="admin"}       onClick={() => setPage("admin")}>Admin</NavBtn>

          <button onClick={() => setPage("cart")} style={{
            marginLeft:8,
            background: page==="cart" ? "#A22325" : "#F7F7F7",
            border:"1.5px solid", borderColor: page==="cart" ? "#A22325" : "#EAEAEA",
            color: page==="cart" ? "#fff" : "#333",
            borderRadius:10, padding:"8px 18px", cursor:"pointer",
            fontSize:13, fontWeight:600, letterSpacing:"0.04em",
            display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
          }}
            onMouseEnter={e => { if (page!=="cart") { e.currentTarget.style.borderColor="#A22325"; e.currentTarget.style.color="#A22325"; }}}
            onMouseLeave={e => { if (page!=="cart") { e.currentTarget.style.borderColor="#EAEAEA"; e.currentTarget.style.color="#333"; }}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Cart
            {cartCount > 0 && (
              <span style={{ background:"#A22325", color:"#fff", borderRadius:"50%", width:19, height:19, fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{cartCount}</span>
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
      background: active ? "#FFF0F0" : "none",
      border:"none", color: active ? "#A22325" : "#666",
      fontSize:13, fontWeight: active ? 700 : 500,
      letterSpacing:"0.04em", cursor:"pointer",
      padding:"8px 16px", borderRadius:8, transition:"all 0.15s",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background="#F7F7F7"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background="none"; }}
    >{children}</button>
  );
}
