import { useState, useRef, useCallback } from "react";
import { useStore } from "../context/StoreContext";
import { formatCurrency, formatDate } from "../data/utils";
import { paymentMethods } from "../data/products";

const STATUS_OPTIONS = ["pending","processing","fulfilled","cancelled"];
const STATUS_COLORS  = {
  pending:    { bg:"#FFFBEB", color:"#92400E", border:"#FDE68A" },
  processing: { bg:"#EFF6FF", color:"#1E40AF", border:"#BFDBFE" },
  fulfilled:  { bg:"#F0FDF4", color:"#166534", border:"#BBF7D0" },
  cancelled:  { bg:"#FEF2F2", color:"#991B1B", border:"#FECACA" },
};
const CATEGORIES = ["Apparel","Accessories","Drinkware","Bags","Office","Other"];
const TABS = ["orders","products","coupons"];

/* ─── Compress + resize image to max 800px, ~80KB output ─── */
function compressImage(file, maxDim = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Calculate new dimensions keeping aspect ratio
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else                 { width  = Math.round(width  * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ─── Reusable image upload button ─── */
function ImageUploader({ value, onChange, label = "Upload Image", small = false }) {
  const ref = useRef();
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Accept any size — we'll compress it down
    if (file.size > 20 * 1024 * 1024) { alert("Image must be under 20 MB."); return; }
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (err) {
      alert("Could not process image. Please try a different file.");
    } finally {
      setCompressing(false);
      // Reset input so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
      {compressing ? (
        <div style={{
          width: small ? 72 : "100%", height: small ? 72 : 120,
          border:"2px dashed #EAEAEA", borderRadius: small ? 10 : 12,
          background:"#F7F7F7", display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:12, color:"#A22325", fontWeight:600 }}>Compressing…</span>
        </div>
      ) : value ? (
        <div style={{ position:"relative", display:"inline-block" }}>
          <div style={{
            width: small ? 72 : "100%",
            height: small ? 72 : 160,
            borderRadius: small ? 8 : 12,
            border:"1.5px solid #EAEAEA",
            background:"#F7F7F7",
            display:"flex", alignItems:"center", justifyContent:"center",
            overflow:"hidden",
          }}>
            <img src={value} alt="preview" style={{
              maxWidth:"100%", maxHeight:"100%",
              objectFit:"contain",
              display:"block",
            }} />
          </div>
          <button onClick={() => onChange("")} style={{
            position:"absolute", top:-8, right:-8,
            background:"#A22325", color:"#fff",
            border:"none", borderRadius:"50%",
            width:22, height:22, fontSize:13, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
          }}>×</button>
          <button onClick={() => ref.current.click()} style={{
            marginTop: small ? 4 : 8, display:"block",
            fontSize:11, color:"#A22325", fontWeight:600,
            background:"none", border:"none", cursor:"pointer", padding:0,
          }}>Change</button>
        </div>
      ) : (
        <button onClick={() => ref.current.click()} style={{
          width: small ? 72 : "100%",
          height: small ? 72 : 120,
          border:"2px dashed #EAEAEA",
          borderRadius: small ? 10 : 12,
          background:"#F7F7F7", cursor:"pointer",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          gap:6, transition:"border-color 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#A22325"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#EAEAEA"}
        >
          <span style={{ fontSize: small ? 18 : 24 }}>📷</span>
          {!small && <span style={{ fontSize:12, color:"#bbb", fontWeight:500 }}>{label}</span>}
          {!small && <span style={{ fontSize:11, color:"#ddd" }}>PNG, JPG — any size</span>}
        </button>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("orders");
  return (
    <div style={{ background:"#F7F7F7", minHeight:"100vh" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid #EAEAEA", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 32px", display:"flex", gap:4, alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", marginRight:16, letterSpacing:"0.02em" }}>Admin</span>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab===t ? "#FFF0F0" : "none",
              border:"none",
              color: tab===t ? "#A22325" : "#888",
              padding:"16px 18px",
              fontSize:13, fontWeight: tab===t ? 700 : 500,
              letterSpacing:"0.04em", textTransform:"capitalize",
              cursor:"pointer", transition:"all 0.15s",
              borderBottom: tab===t ? "2px solid #A22325" : "2px solid transparent",
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"36px 32px" }}>
        {tab === "orders"   && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "coupons"  && <CouponsTab />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ORDERS TAB
══════════════════════════════════════ */
function OrdersTab() {
  const { orders, updateOrder, deleteOrder, ordersLoading, ordersError, loadOrders } = useStore();
  const [filter, setFilter]         = useState("all");
  const [paidFilter, setPaidFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const printPackingSlip = (order, payMethod) => {
    const itemRows = order.items.map(item => {
      const variants = Object.entries(item.variants || {}).map(([,v]) => v).join(", ");
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;">
            ${item.productName}${variants ? ` <span style="color:#888;font-size:12px;">(${variants})</span>` : ""}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;font-size:14px;">${item.qty}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-size:14px;">$${item.price.toFixed(2)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-size:14px;font-weight:600;">$${item.subtotal.toFixed(2)}</td>
        </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Packing Slip — ${order.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 680px; margin: 0 auto; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #A22325;">
    <div>
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1a1a;margin-bottom:4px;">Packing Slip</h1>
      <p style="font-size:12px;color:#888;letter-spacing:0.08em;text-transform:uppercase;">Associate Store</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:13px;font-family:monospace;color:#A22325;font-weight:700;margin-bottom:4px;">${order.id}</p>
      <p style="font-size:12px;color:#888;">${new Date(order.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</p>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
    <div style="background:#F7F7F7;border-radius:10px;padding:16px 20px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#bbb;margin-bottom:10px;">Ship To</p>
      <p style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">${order.name}</p>
      <p style="font-size:13px;color:#555;margin-bottom:2px;">${order.email}</p>
      <p style="font-size:13px;color:#555;">Store #: ${order.department}</p>
    </div>
    <div style="background:#F7F7F7;border-radius:10px;padding:16px 20px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#bbb;margin-bottom:10px;">Payment</p>
      <p style="font-size:13px;color:#555;margin-bottom:2px;">${payMethod?.label || order.paymentMethod}</p>
      <p style="font-size:12px;color:#bbb;">Status: ${order.paid ? "✓ Paid" : "Pending"}</p>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#1a1a1a;">
        <th style="padding:10px 8px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#fff;">Item</th>
        <th style="padding:10px 8px;text-align:center;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#fff;">Qty</th>
        <th style="padding:10px 8px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#fff;">Unit Price</th>
        <th style="padding:10px 8px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#fff;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div style="display:flex;justify-content:flex-end;">
    <div style="width:240px;">
      ${order.discount > 0 ? `
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#555;margin-bottom:6px;">
        <span>Discount (${order.couponCode})</span><span style="color:#166534;">−$${(order.discount||0).toFixed(2)}</span>
      </div>` : ""}
      <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:800;color:#1a1a1a;padding-top:10px;border-top:2px solid #1a1a1a;">
        <span>Total</span><span style="color:#A22325;">$${order.total.toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${order.notes ? `<div style="margin-top:24px;padding:14px 18px;background:#FFFBF5;border:1px solid #F5E0C0;border-radius:10px;"><p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A22325;margin-bottom:6px;">Notes</p><p style="font-size:13px;color:#555;">${order.notes}</p></div>` : ""}

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #EAEAEA;text-align:center;">
    <p style="font-size:11px;color:#ccc;letter-spacing:0.06em;">Thank you — Associate Store · Internal Use Only</p>
  </div>

  <div class="no-print" style="margin-top:32px;text-align:center;">
    <button onclick="window.print()" style="background:#A22325;color:#fff;border:none;border-radius:10px;padding:12px 32px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.06em;">Print</button>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=720,height=900");
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (paidFilter === "paid"   && !o.paid) return false;
    if (paidFilter === "unpaid" &&  o.paid) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) &&
        !o.id.toLowerCase().includes(search.toLowerCase()) &&
        !o.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRev = orders.reduce((s,o) => s+o.total, 0);
  const paidRev  = orders.filter(o=>o.paid).reduce((s,o) => s+o.total, 0);

  const exportCSV = () => {
    const rows = [
      ["Order ID","Date","Name","Email","Department","Items","Subtotal","Discount","Coupon","Total","Payment","Paid","Status","Notes"],
      ...orders.map(o => [
        o.id, formatDate(o.date), o.name, o.email, o.department,
        o.items.map(i=>`${i.productName}(${i.qty})`).join("; "),
        o.subtotal?.toFixed(2)||o.total.toFixed(2),
        (o.discount||0).toFixed(2), o.couponCode||"",
        o.total.toFixed(2),
        paymentMethods.find(p=>p.id===o.paymentMethod)?.label||o.paymentMethod,
        o.paid?"Yes":"No", o.status, o.notes||"",
      ])
    ];
    const csv  = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const a    = document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:26, color:"#1a1a1a", marginBottom:4 }}>Orders</h2>
          <p style={{ color:"#bbb", fontSize:13 }}>{ordersLoading ? "Loading…" : `${orders.length} total orders`}</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={loadOrders} style={actionBtn("#666")} title="Refresh orders from Airtable">↻ Refresh</button>
          <button onClick={exportCSV} style={actionBtn("#1a1a1a")}>↓ Export CSV</button>
        </div>
      </div>

      {ordersError && (
        <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#991B1B" }}>
          Could not load orders from Airtable: {ordersError}. Check your token in <code>src/data/airtable.js</code>.
        </div>
      )}

      {ordersLoading ? (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
          <p style={{ color:"#bbb", fontSize:15 }}>Loading orders…</p>
        </div>
      ) : (<>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:16, marginBottom:28 }}>
        <StatCard label="Total Orders"  value={orders.length} sub={`${orders.filter(o=>o.status==="pending").length} pending`} />
        <StatCard label="Total Revenue" value={formatCurrency(totalRev)} sub="all orders" />
        <StatCard label="Collected"     value={formatCurrency(paidRev)} sub={`${orders.filter(o=>o.paid).length} paid`} accent="#166534" />
        <StatCard label="Outstanding"   value={formatCurrency(totalRev-paidRev)} sub={`${orders.filter(o=>!o.paid).length} unpaid`} accent="#A22325" />
      </div>

      <div style={{ background:"#fff", borderRadius:14, padding:"16px 20px", marginBottom:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", border:"1px solid #EAEAEA", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <input type="text" placeholder="Search by name, email, order ID..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, padding:"10px 14px", border:"1.5px solid #EAEAEA", borderRadius:10, fontSize:13, outline:"none", background:"#F7F7F7", color:"#1a1a1a" }} />
        <FilterGroup label="Status:" value={filter} onChange={setFilter}
          options={[["all","All"],["pending","Pending"],["processing","Processing"],["fulfilled","Fulfilled"],["cancelled","Cancelled"]]} />
        <FilterGroup label="Payment:" value={paidFilter} onChange={setPaidFilter}
          options={[["all","All"],["paid","Paid"],["unpaid","Unpaid"]]} />
      </div>

      {filtered.length === 0 ? <EmptyState icon="📭" text="No orders match your filters." /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(order => {
            const isExp     = expanded === order.id;
            const statusSty = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const payMethod = paymentMethods.find(p=>p.id===order.paymentMethod);
            return (
              <div key={order.id} style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", borderLeft:`4px solid ${order.paid?"#16a34a":"#A22325"}` }}>
                <div onClick={() => setExpanded(isExp?null:order.id)}
                  style={{ padding:"16px 20px", display:"grid", gridTemplateColumns:"1fr 110px 100px 130px 110px 36px", gap:12, alignItems:"center", cursor:"pointer", transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >
                  <div>
                    <p style={{ fontWeight:600, fontSize:14, color:"#1a1a1a", marginBottom:3 }}>{order.name}</p>
                    <p style={{ fontSize:12, color:"#bbb", fontFamily:"monospace" }}>{order.id}</p>
                    <p style={{ fontSize:12, color:"#ccc" }}>{formatDate(order.date)} · {order.department}</p>
                  </div>
                  <span style={{ fontSize:13, color:"#888" }}>{order.items.length} item{order.items.length!==1?"s":""}</span>
                  <span style={{ fontWeight:800, fontSize:15, color:"#1a1a1a" }}>{formatCurrency(order.total)}</span>
                  <select value={order.status} onChange={e=>{e.stopPropagation();updateOrder(order.id,{status:e.target.value});}} onClick={e=>e.stopPropagation()}
                    style={{ background:statusSty.bg, color:statusSty.color, border:`1px solid ${statusSty.border}`, borderRadius:8, padding:"6px 10px", fontSize:12, fontWeight:600, cursor:"pointer", outline:"none" }}>
                    {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <label onClick={e=>e.stopPropagation()} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                    <input type="checkbox" checked={order.paid} onChange={e=>updateOrder(order.id,{paid:e.target.checked})} style={{ accentColor:"#A22325", width:15, height:15 }} />
                    <span style={{ fontSize:12, color:order.paid?"#166534":"#A22325", fontWeight:700 }}>{order.paid?"Paid":"Unpaid"}</span>
                  </label>
                  <span style={{ color:"#ccc", fontSize:14 }}>{isExp?"▲":"▼"}</span>
                </div>
                {isExp && (
                  <div style={{ borderTop:"1px solid #F0F0F0", padding:"20px", background:"#FAFAFA" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
                      <div><p style={lbl}>Contact</p><p style={sm}>{order.email}</p><p style={sm}>{order.department}</p></div>
                      <div><p style={lbl}>Payment</p><p style={sm}>{payMethod?.label}</p><p style={{...sm,color:"#bbb"}}>{payMethod?.handle}</p></div>
                      {order.notes && <div><p style={lbl}>Notes</p><p style={{...sm,fontStyle:"italic",color:"#888"}}>{order.notes}</p></div>}
                      {order.couponCode && <div><p style={lbl}>Coupon</p><p style={{...sm,color:"#166534",fontWeight:600}}>{order.couponCode} (−{formatCurrency(order.discount||0)})</p></div>}
                    </div>
                    <p style={lbl}>Items</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
                      {order.items.map((item,i) => (
                        <div key={i} style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between", fontSize:13 }}>
                          <span>
                            <strong style={{color:"#1a1a1a"}}>{item.productName}</strong>
                            {Object.entries(item.variants).length>0 && <span style={{color:"#bbb"}}> ({Object.entries(item.variants).map(([,v])=>v).join(", ")})</span>}
                            <span style={{color:"#ccc"}}> ×{item.qty}</span>
                          </span>
                          <span style={{fontWeight:700,color:"#1a1a1a"}}>{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    {/* Action buttons */}
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                      <button onClick={() => printPackingSlip(order, payMethod)} style={{ ...smBtn("#1a1a1a"), display:"flex", alignItems:"center", gap:6 }}>
                        🖨️ Print Packing Slip
                      </button>
                      {confirmDel===order.id ? (
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                          <span style={{fontSize:13,color:"#A22325",fontWeight:500}}>Delete this order?</span>
                          <button onClick={()=>{deleteOrder(order.id);setConfirmDel(null);}} style={smBtn("#A22325")}>Yes, delete</button>
                          <button onClick={()=>setConfirmDel(null)} style={smBtn("#888")}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={()=>setConfirmDel(order.id)} style={smBtn("#EAEAEA","#999")}>Delete Order</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </>)}
    </div>
  );
}

/* ══════════════════════════════════════
   PRODUCTS TAB
══════════════════════════════════════ */
const emptyProduct = { name:"", description:"", price:"", cost:"", category:"Apparel", image:"", variants:{}, variantImages:{} };

function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct, productsLoading, productsError, loadProducts } = useStore();
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyProduct);
  const [variantKey, setVariantKey]   = useState("");
  const [variantVals, setVariantVals] = useState("");
  const [confirmDel, setConfirmDel]   = useState(null);
  const [msg, setMsg]                 = useState("");

  const openNew  = () => { setForm(emptyProduct); setEditing("new"); setVariantKey(""); setVariantVals(""); };
  const openEdit = (p) => {
    setForm({ ...p, price:String(p.price), cost:String(p.cost||""), image:p.image||"", variants:p.variants||{}, variantImages:p.variantImages||{} });
    setEditing(p.id); setVariantKey(""); setVariantVals("");
  };
  const close = () => { setEditing(null); setMsg(""); };

  const addVariant = () => {
    if (!variantKey.trim() || !variantVals.trim()) return;
    const vals = variantVals.split(",").map(v=>v.trim()).filter(Boolean);
    setForm(f => ({ ...f, variants: { ...f.variants, [variantKey.trim()]: vals } }));
    setVariantKey(""); setVariantVals("");
  };
  const removeVariant = (key) => {
    setForm(f => {
      const v = {...f.variants}; delete v[key];
      const vi = {...f.variantImages};
      Object.keys(vi).forEach(k => { if (k.startsWith(key+":")) delete vi[k]; });
      return {...f, variants:v, variantImages:vi};
    });
  };

  const setVariantImage = (variantKey, optionValue, imageData) => {
    const key = `${variantKey}:${optionValue}`;
    setForm(f => ({ ...f, variantImages: { ...f.variantImages, [key]: imageData } }));
  };
  const getVariantImage = (variantKey, optionValue) => {
    return form.variantImages?.[`${variantKey}:${optionValue}`] || "";
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { setMsg("Name and price are required."); return; }
    const data = { ...form, price:parseFloat(form.price), cost:parseFloat(form.cost||0) };
    try {
      if (editing === "new") await addProduct(data); else await updateProduct(editing, data);
      close();
    } catch (e) {
      setMsg("Could not save product. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:26, color:"#1a1a1a", marginBottom:4 }}>Products</h2>
          <p style={{ color:"#bbb", fontSize:13 }}>{productsLoading ? "Loading…" : `${products.length} products`}</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={loadProducts} style={actionBtn("#666")}>↻ Refresh</button>
          <button onClick={openNew} style={actionBtn("#A22325")}>+ Add Product</button>
        </div>
      </div>
      {productsError && (
        <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#991B1B" }}>
          Could not load products: {productsError}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:18 }}>
        {products.map(p => (
          <div key={p.id} style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ background:"#F7F7F7", height:130, display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, overflow:"hidden" }}>
              {p.image ? <img src={p.image} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "📦"}
            </div>
            <div style={{ padding:"16px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                <p style={{ fontWeight:600, fontSize:14, color:"#1a1a1a", flex:1, marginRight:8 }}>{p.name}</p>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontWeight:800, color:"#A22325", fontSize:14, display:"block" }}>{formatCurrency(p.price)}</span>
                  {p.cost > 0 && <span style={{ fontSize:11, color:"#bbb" }}>Cost: {formatCurrency(p.cost)}</span>}
                </div>
              </div>
              <p style={{ fontSize:12, color:"#bbb", marginBottom:4 }}>{p.category}</p>
              <p style={{ fontSize:12, color:"#ccc", marginBottom:12, lineHeight:1.5 }}>{p.description?.slice(0,80)}{p.description?.length>80?"…":""}</p>
              {Object.keys(p.variants||{}).length > 0 && (
                <p style={{ fontSize:11, color:"#ddd", marginBottom:12 }}>Variants: {Object.keys(p.variants).join(", ")}</p>
              )}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>openEdit(p)} style={{...smBtn("#1a1a1a"),flex:1}}>Edit</button>
                {confirmDel===p.id ? (
                  <>
                    <button onClick={()=>{deleteProduct(p.id);setConfirmDel(null);}} style={smBtn("#A22325")}>Confirm</button>
                    <button onClick={()=>setConfirmDel(null)} style={smBtn("#888")}>Cancel</button>
                  </>
                ) : (
                  <button onClick={()=>setConfirmDel(p.id)} style={smBtn("#EAEAEA","#999")}>Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Product Edit / Add Modal ── */}
      {editing !== null && (
        <div onClick={close} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(3px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:620, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.15)" }}>

            {/* Header */}
            <div style={{ padding:"22px 28px", borderBottom:"1px solid #EAEAEA", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#fff", zIndex:10 }}>
              <h3 style={{ fontFamily:"'Georgia', serif", fontSize:20, color:"#1a1a1a" }}>{editing==="new"?"Add Product":"Edit Product"}</h3>
              <button onClick={close} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#bbb" }}>×</button>
            </div>

            <div style={{ padding:"24px 28px", display:"grid", gap:22 }}>

              {/* Basic info */}
              <PField label="Product Name *">
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={pInp} placeholder="Classic Logo Tee" />
              </PField>

              <PField label="Description">
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{...pInp,resize:"vertical"}} placeholder="Short product description..." />
              </PField>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <PField label="Sell Price ($) *">
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={pInp} placeholder="0.00" />
                </PField>
                <PField label="Cost ($) — Admin only">
                  <input type="number" min="0" step="0.01" value={form.cost||""} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} style={{...pInp, borderColor:"#F5E0C0", background:"#FFFBF5"}} placeholder="0.00" />
                </PField>
              </div>
              <PField label="Category">
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={pInp}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </PField>

              {/* Main product image */}
              <PField label="Main Product Image">
                <ImageUploader
                  value={form.image}
                  onChange={img => setForm(f=>({...f,image:img}))}
                  label="Upload Main Image"
                />
              </PField>

              {/* Variants section */}
              <div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#aaa" }}>Variants & Images</p>
                </div>

                {/* Existing variants */}
                {Object.entries(form.variants).map(([key, vals]) => (
                  <div key={key} style={{ background:"#F7F7F7", border:"1px solid #EAEAEA", borderRadius:12, padding:"16px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#1a1a1a", letterSpacing:"0.04em" }}>{key}</span>
                      <button onClick={()=>removeVariant(key)} style={{ background:"none", border:"none", color:"#A22325", cursor:"pointer", fontSize:13, fontWeight:600 }}>Remove variant</button>
                    </div>

                    {/* Each option with its image uploader */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))", gap:12 }}>
                      {vals.map(opt => (
                        <div key={opt} style={{ textAlign:"center" }}>
                          <ImageUploader
                            value={getVariantImage(key, opt)}
                            onChange={img => setVariantImage(key, opt, img)}
                            small={true}
                          />
                          <p style={{ fontSize:12, color:"#555", marginTop:5, fontWeight:500 }}>{opt}</p>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize:11, color:"#ccc", marginTop:10 }}>
                      Upload an image for each option — it will show when the customer selects it.
                    </p>
                  </div>
                ))}

                {/* Add new variant */}
                <div style={{ border:"1.5px dashed #EAEAEA", borderRadius:12, padding:"14px 16px", background:"#fff" }}>
                  <p style={{ fontSize:12, color:"#bbb", marginBottom:10, fontWeight:500 }}>Add a new variant</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr auto", gap:8 }}>
                    <input value={variantKey} onChange={e=>setVariantKey(e.target.value)} style={pInp} placeholder="e.g. Color" />
                    <input value={variantVals} onChange={e=>setVariantVals(e.target.value)} style={pInp} placeholder="Red, Blue, Green" />
                    <button onClick={addVariant} style={{...actionBtn("#1a1a1a"),padding:"0 14px",whiteSpace:"nowrap"}}>Add</button>
                  </div>
                  <p style={{ fontSize:11, color:"#ddd", marginTop:6 }}>Comma-separated options. Then upload images for each option above.</p>
                </div>
              </div>

              {msg && <p style={{ fontSize:13, color:"#A22325" }}>{msg}</p>}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={handleSave} style={{...actionBtn("#A22325"),flex:1,padding:"13px"}}>{editing==="new"?"Add Product":"Save Changes"}</button>
                <button onClick={close} style={{...actionBtn("#888"),flex:1,padding:"13px"}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   COUPONS TAB
══════════════════════════════════════ */
const emptyCoupon = { code:"", type:"percent", value:"", active:true, description:"" };

function CouponsTab() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyCoupon);
  const [msg, setMsg]               = useState("");
  const [confirmDel, setConfirmDel] = useState(null);

  const openNew  = () => { setForm(emptyCoupon); setEditing("new"); };
  const openEdit = (c) => { setForm({...c,value:String(c.value)}); setEditing(c.id); };
  const close    = () => { setEditing(null); setMsg(""); };

  const handleSave = () => {
    if (!form.code.trim() || !form.value) { setMsg("Code and value are required."); return; }
    const data = { ...form, code:form.code.toUpperCase().trim(), value:parseFloat(form.value) };
    if (editing === "new") addCoupon(data); else updateCoupon(editing, data);
    close();
  };

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:26, color:"#1a1a1a", marginBottom:4 }}>Coupons</h2>
          <p style={{ color:"#bbb", fontSize:13 }}>{coupons.length} coupon{coupons.length!==1?"s":""}</p>
        </div>
        <button onClick={openNew} style={actionBtn("#A22325")}>+ New Coupon</button>
      </div>

      {coupons.length === 0 ? <EmptyState icon="🏷️" text="No coupons yet." /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {coupons.map(c => (
            <div key={c.id} style={{ background:"#fff", border:"1px solid #EAEAEA", borderRadius:14, padding:"18px 22px", display:"flex", alignItems:"center", gap:16, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", borderLeft:`4px solid ${c.active?"#16a34a":"#EAEAEA"}` }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontFamily:"'Courier New', monospace", fontWeight:700, fontSize:16, color:"#1a1a1a", background:"#F7F7F7", padding:"3px 12px", borderRadius:8, letterSpacing:"0.08em", border:"1px solid #EAEAEA" }}>{c.code}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:c.active?"#F0FDF4":"#F7F7F7", color:c.active?"#166534":"#aaa", border:`1px solid ${c.active?"#BBF7D0":"#EAEAEA"}` }}>{c.active?"Active":"Inactive"}</span>
                </div>
                <p style={{ fontSize:13, color:"#777", marginBottom:2 }}>{c.description||"No description"}</p>
                <p style={{ fontSize:12, color:"#A22325", fontWeight:700 }}>{c.type==="percent"?`${c.value}% off`:`$${c.value} off`} entire order</p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:"#888" }}>
                  <input type="checkbox" checked={c.active} onChange={e=>updateCoupon(c.id,{active:e.target.checked})} style={{ accentColor:"#A22325" }} />Active
                </label>
                <button onClick={()=>openEdit(c)} style={smBtn("#1a1a1a")}>Edit</button>
                {confirmDel===c.id ? (
                  <>
                    <button onClick={()=>{deleteCoupon(c.id);setConfirmDel(null);}} style={smBtn("#A22325")}>Confirm</button>
                    <button onClick={()=>setConfirmDel(null)} style={smBtn("#888")}>Cancel</button>
                  </>
                ) : <button onClick={()=>setConfirmDel(c.id)} style={smBtn("#EAEAEA","#999")}>Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div onClick={close} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(2px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ padding:"22px 26px", borderBottom:"1px solid #EAEAEA", display:"flex", justifyContent:"space-between" }}>
              <h3 style={{ fontFamily:"'Georgia', serif", fontSize:18, color:"#1a1a1a" }}>{editing==="new"?"New Coupon":"Edit Coupon"}</h3>
              <button onClick={close} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#bbb" }}>×</button>
            </div>
            <div style={{ padding:"22px 26px", display:"grid", gap:16 }}>
              <PField label="Coupon Code *"><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} style={pInp} placeholder="SUMMER20" /></PField>
              <PField label="Description"><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={pInp} placeholder="20% off entire order" /></PField>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <PField label="Type">
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={pInp}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </PField>
                <PField label={form.type==="percent"?"Percent *":"Amount *"}>
                  <input type="number" min="0" step={form.type==="percent"?"1":"0.01"} value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} style={pInp} placeholder={form.type==="percent"?"10":"5.00"} />
                </PField>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:"#555" }}>
                <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} style={{ accentColor:"#A22325", width:16, height:16 }} />
                Active (employees can use this coupon)
              </label>
              {msg && <p style={{ fontSize:13, color:"#A22325" }}>{msg}</p>}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={handleSave} style={{...actionBtn("#A22325"),flex:1,padding:"12px"}}>{editing==="new"?"Create":"Save Changes"}</button>
                <button onClick={close} style={{...actionBtn("#888"),flex:1,padding:"12px"}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared helpers ── */
function StatCard({ label, value, sub, accent="#1a1a1a" }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"20px 22px", border:"1px solid #EAEAEA", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize:11, color:"#bbb", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, fontWeight:600 }}>{label}</p>
      <p style={{ fontSize:22, fontWeight:800, color:accent, marginBottom:4 }}>{value}</p>
      <p style={{ fontSize:12, color:"#ccc" }}>{sub}</p>
    </div>
  );
}
function FilterGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
      <span style={{ fontSize:12, color:"#bbb", fontWeight:600 }}>{label}</span>
      {options.map(([val,lbl]) => (
        <button key={val} onClick={()=>onChange(val)} style={{ padding:"5px 13px", border:"1.5px solid", borderColor:value===val?"#A22325":"#EAEAEA", borderRadius:20, background:value===val?"#A22325":"#fff", color:value===val?"#fff":"#777", fontSize:12, fontWeight:value===val?700:400, cursor:"pointer", transition:"all 0.15s" }}>{lbl}</button>
      ))}
    </div>
  );
}
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 0", color:"#ccc" }}>
      <p style={{ fontSize:36 }}>{icon}</p>
      <p style={{ fontSize:15, marginTop:12, color:"#bbb" }}>{text}</p>
    </div>
  );
}
function PField({ label, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#aaa", marginBottom:8 }}>{label}</label>
      {children}
    </div>
  );
}

const pInp      = { width:"100%", padding:"11px 14px", border:"1.5px solid #EAEAEA", borderRadius:10, fontSize:14, color:"#1a1a1a", outline:"none", background:"#F7F7F7", boxSizing:"border-box" };
const lbl       = { fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#bbb", marginBottom:6 };
const sm        = { fontSize:13, color:"#555" };
const actionBtn = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:10, padding:"11px 22px", fontSize:13, fontWeight:600, cursor:"pointer", letterSpacing:"0.04em" });
const smBtn     = (bg, color="#fff") => ({ background:bg, color, border:`1px solid ${bg==="#EAEAEA"?"#EAEAEA":"transparent"}`, borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer" });
