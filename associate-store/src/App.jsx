import { useState } from "react";
import { StoreProvider } from "./context/StoreContext";
import Header from "./components/Header";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import AdminLogin from "./components/AdminLogin";
import SuggestionsPage from "./pages/SuggestionsPage";

export default function App() {
  const [page, setPage]               = useState("shop");
  const [adminAuthed, setAdminAuthed] = useState(false);

  return (
    <StoreProvider>
      <div style={{ minHeight:"100vh", background:"#F7F7F7", fontFamily:"'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <Header page={page} setPage={setPage} />
        <main>
          {page === "shop"        && <ShopPage setPage={setPage} />}
          {page === "cart"        && <CartPage setPage={setPage} />}
          {page === "suggestions" && <SuggestionsPage />}
          {page === "admin"       && (
            adminAuthed
              ? <AdminPage />
              : <AdminLogin onSuccess={() => setAdminAuthed(true)} />
          )}
        </main>
      </div>
    </StoreProvider>
  );
}
