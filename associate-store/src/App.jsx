import { useState } from "react";
import { StoreProvider } from "./context/StoreContext";
import Header from "./components/Header";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const [page, setPage] = useState("shop");

  return (
    <StoreProvider>
      <div style={{ minHeight: "100vh", background: "#f7f7f7", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <Header page={page} setPage={setPage} />
        <main>
          {page === "shop"  && <ShopPage setPage={setPage} />}
          {page === "cart"  && <CartPage setPage={setPage} />}
          {page === "admin" && <AdminPage />}
        </main>
      </div>
    </StoreProvider>
  );
}
