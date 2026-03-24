import { useState } from "react";
import { StoreProvider } from "./context/StoreContext";
import Header from "./components/Header";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  const [page, setPage]           = useState("shop");
  const [adminAuthed, setAdminAuthed] = useState(false);

  const handleSetPage = (p) => {
    // If navigating away from admin, keep auth state
    // (they stay logged in for the session)
    setPage(p);
  };

  return (
    <StoreProvider>
      <div style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}>
        <Header page={page} setPage={handleSetPage} />
        <main>
          {page === "shop"  && <ShopPage setPage={handleSetPage} />}
          {page === "cart"  && <CartPage setPage={handleSetPage} />}
          {page === "admin" && (
            adminAuthed
              ? <AdminPage />
              : <AdminLogin onSuccess={() => setAdminAuthed(true)} />
          )}
        </main>
      </div>
    </StoreProvider>
  );
}
