import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { formatCurrency, formatDate } from "../data/utils";
import { paymentMethods } from "../data/products";

const STATUS_OPTIONS = ["pending", "processing", "fulfilled", "cancelled"];
const STATUS_COLORS  = {
  pending:    { bg: "#fff8e0", color: "#7a5c00" },
  processing: { bg: "#e0f0ff", color: "#004a8a" },
  fulfilled:  { bg: "#e0f5e0", color: "#1a5c1a" },
  cancelled:  { bg: "#fce8e8", color: "#7a1a1a" },
};

export default function AdminPage() {
  const { orders, updateOrder, deleteOrder } = useStore();
  const [filter, setFilter]       = useState("all");
  const [paidFilter, setPaidFilter] = useState("all");
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (paidFilter === "paid" && !o.paid) return false;
    if (paidFilter === "unpaid" && o.paid) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) &&
        !o.id.toLowerCase().includes(search.toLowerCase()) &&
        !o.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRevenue    = orders.reduce((s, o) => s + o.total, 0);
  const paidRevenue     = orders.filter(o => o.paid).reduce((s, o) => s + o.total, 0);
  const unpaidRevenue   = totalRevenue - paidRevenue;
  const pendingCount    = orders.filter(o => o.status === "pending").length;

  const exportCSV = () => {
    const rows = [
      ["Order ID","Date","Name","Email","Department","Items","Total","Payment Method","Paid","Status","Notes"],
      ...orders.map(o => [
        o.id,
        formatDate(o.date),
        o.name,
        o.email,
        o.department,
        o.items.map(i => `${i.productName}(${i.qty})`).join("; "),
        o.total.toFixed(2),
        paymentMethods.find(p => p.id === o.paymentMethod)?.label || o.paymentMethod,
        o.paid ? "Yes" : "No",
        o.status,
        o.notes || "",
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 26, color: "#111", marginBottom: 4 }}>Order Management</h1>
            <p style={{ color: "#888", fontSize: 13 }}>{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={exportCSV} style={{
            background: "#111", color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            letterSpacing: "0.06em",
          }}>
            ↓ Export CSV
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Orders" value={orders.length} sub={`${pendingCount} pending`} />
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} sub="all orders" />
          <StatCard label="Collected" value={formatCurrency(paidRevenue)} sub={`${orders.filter(o=>o.paid).length} paid`} accent="#2d7a2d" />
          <StatCard label="Outstanding" value={formatCurrency(unpaidRevenue)} sub={`${orders.filter(o=>!o.paid).length} unpaid`} accent="#A22325" />
        </div>

        {/* Filters */}
        <div style={{
          background: "#fff",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 16,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          border: "1px solid #eee",
        }}>
          <input
            type="text"
            placeholder="Search by name, email, or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: "8px 14px",
              border: "1.5px solid #ddd", borderRadius: 7, fontSize: 13, outline: "none",
            }}
          />
          <FilterGroup label="Status:" value={filter} onChange={setFilter}
            options={[["all","All"],["pending","Pending"],["processing","Processing"],["fulfilled","Fulfilled"],["cancelled","Cancelled"]]}
          />
          <FilterGroup label="Payment:" value={paidFilter} onChange={setPaidFilter}
            options={[["all","All"],["paid","Paid"],["unpaid","Unpaid"]]}
          />
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
            <p style={{ fontSize: 32 }}>📭</p>
            <p style={{ fontSize: 15, marginTop: 12 }}>No orders match your filters.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(order => {
              const isExpanded    = expanded === order.id;
              const statusStyle   = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const payMethod     = paymentMethods.find(p => p.id === order.paymentMethod);

              return (
                <div key={order.id} style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 10,
                  overflow: "hidden",
                  borderLeft: `4px solid ${order.paid ? "#2d7a2d" : "#A22325"}`,
                }}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    style={{
                      padding: "16px 20px",
                      display: "grid",
                      gridTemplateColumns: "1fr 130px 100px 120px 100px 40px",
                      gap: 12,
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 2 }}>{order.name}</p>
                      <p style={{ fontSize: 12, color: "#888" }}>{order.id} · {formatDate(order.date)}</p>
                      <p style={{ fontSize: 12, color: "#aaa" }}>{order.department}</p>
                    </div>
                    <div style={{ fontSize: 13, color: "#555" }}>
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
                      {formatCurrency(order.total)}
                    </div>
                    {/* Status dropdown */}
                    <select
                      value={order.status}
                      onChange={e => { e.stopPropagation(); updateOrder(order.id, { status: e.target.value }); }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    {/* Paid toggle */}
                    <label
                      onClick={e => e.stopPropagation()}
                      style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={order.paid}
                        onChange={e => updateOrder(order.id, { paid: e.target.checked })}
                        style={{ accentColor: "#2d7a2d", width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 12, color: order.paid ? "#2d7a2d" : "#A22325", fontWeight: 600 }}>
                        {order.paid ? "Paid" : "Unpaid"}
                      </span>
                    </label>
                    <span style={{ color: "#ccc", fontSize: 18 }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #f0f0f0", padding: "20px 20px 20px", background: "#fafafa" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                        <div>
                          <p style={labelStyle}>Contact</p>
                          <p style={{ fontSize: 13, color: "#333" }}>{order.email}</p>
                          <p style={{ fontSize: 13, color: "#333" }}>{order.department}</p>
                        </div>
                        <div>
                          <p style={labelStyle}>Payment</p>
                          <p style={{ fontSize: 13, color: "#333" }}>{payMethod?.label}</p>
                          <p style={{ fontSize: 12, color: "#888" }}>{payMethod?.handle}</p>
                        </div>
                        {order.notes && (
                          <div>
                            <p style={labelStyle}>Notes</p>
                            <p style={{ fontSize: 13, color: "#333", fontStyle: "italic" }}>{order.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <p style={labelStyle}>Items Ordered</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{
                            background: "#fff",
                            border: "1px solid #eee",
                            borderRadius: 7,
                            padding: "10px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: 13,
                          }}>
                            <div>
                              <span style={{ fontWeight: 600, color: "#111" }}>{item.productName}</span>
                              {Object.entries(item.variants).length > 0 && (
                                <span style={{ color: "#888", marginLeft: 8 }}>
                                  ({Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(", ")})
                                </span>
                              )}
                              <span style={{ color: "#aaa", marginLeft: 8 }}>× {item.qty}</span>
                            </div>
                            <span style={{ fontWeight: 600, color: "#111" }}>{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delete */}
                      {confirmDelete === order.id ? (
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: "#A22325" }}>Delete this order?</span>
                          <button onClick={() => { deleteOrder(order.id); setConfirmDelete(null); }} style={deleteBtnStyle("#A22325")}>Yes, delete</button>
                          <button onClick={() => setConfirmDelete(null)} style={deleteBtnStyle("#888")}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(order.id)} style={deleteBtnStyle("#ddd", "#999")}>
                          Delete Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent = "#111" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", border: "1px solid #eee" }}>
      <p style={{ fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: accent, marginBottom: 2 }}>{value}</p>
      <p style={{ fontSize: 12, color: "#bbb" }}>{sub}</p>
    </div>
  );
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{label}</span>
      {options.map(([val, lbl]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          style={{
            padding: "5px 12px",
            border: "1.5px solid",
            borderColor: value === val ? "#111" : "#ddd",
            borderRadius: 20,
            background: value === val ? "#111" : "#fff",
            color: value === val ? "#fff" : "#555",
            fontSize: 12,
            fontWeight: value === val ? 600 : 400,
            cursor: "pointer",
          }}
        >{lbl}</button>
      ))}
    </div>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 6 };

function deleteBtnStyle(bg, color = "#fff") {
  return {
    background: bg, color, border: "none", borderRadius: 6,
    padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  };
}
