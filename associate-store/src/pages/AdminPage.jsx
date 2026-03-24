import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { formatCurrency, formatDate } from "../data/utils";
import { paymentMethods } from "../data/products";

const STATUS_OPTIONS = ["pending","processing","fulfilled","cancelled"];
const STATUS_COLORS  = {
  pending:    { bg:"#fff8e0", color:"#7a5c00" },
  processing: { bg:"#e0f0ff", color:"#004a8a" },
  fulfilled:  { bg:"#e0f5e0", color:"#1a5c1a" },
  cancelled:  { bg:"#fce8e8", color:"#7a1a1a" },
};
const TABS = ["orders","products","coupons"];

export default function AdminPage() {
  const [tab, setTab] = useState("orders");
  return (
    <div style={{ background:"#f5f5f5", minHeight:"100vh" }}>
      {/* Tab bar */}
      <div style={{ background:"#111", borderBottom:"3px solid #A22325" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", gap:4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab===t ? "#A22325" : "none",
              border:"none", color: tab===t ? "#fff" : "#aaa",
              padding:"14px 20px", fontSize:13, fontWeight:600,
              letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer",
              transition:"all 0.15s",
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"32px 24px" }}>
        {tab === "orders"   && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "coupons"  && <CouponsTab />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ORDERS TAB
═══════════════════════════════════════════ */
function OrdersTab() {
  const { orders, updateOrder, deleteOrder } = useStore();
  const [filter, setFilter]         = useState("all");
  const [paidFilter, setPaidFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (paidFilter === "paid"   && !o.paid) return false;
    if (paidFilter === "unpaid" &&  o.paid) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) &&
        !o.id.toLowerCase().includes(search.toLowerCase()) &&
        !o.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRev  = orders.reduce((s,o) => s+o.total, 0);
  const paidRev   = orders.filter(o=>o.paid).reduce((s,o) => s+o.total, 0);

  const exportCSV = () => {
    const rows = [
      ["Order ID","Date","Name","Email","Department","Items","Subtotal","Discount","Coupon","Total","Payment","Paid","Status","Notes"],
      ...orders.map(o => [
        o.id, formatDate(o.date), o.name, o.email, o.department,
        o.items.map(i=>`${i.productName}(${i.qty})`).join("; "),
        o.subtotal?.toFixed(2) || o.total.toFixed(2),
        (o.discount||0).toFixed(2),
        o.couponCode||"",
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
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:24, color:"#111", marginBottom:4 }}>Orders</h2>
          <p style={{ color:"#888", fontSize:13 }}>{orders.length} total orders</p>
        </div>
        <button onClick={exportCSV} style={actionBtn("#111")}>↓ Export CSV</button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:14, marginBottom:24 }}>
        <StatCard label="Total Orders"  value={orders.length} sub={`${orders.filter(o=>o.status==="pending").length} pending`} />
        <StatCard label="Total Revenue" value={formatCurrency(totalRev)} sub="all orders" />
        <StatCard label="Collected"     value={formatCurrency(paidRev)} sub={`${orders.filter(o=>o.paid).length} paid`} accent="#2d7a2d" />
        <StatCard label="Outstanding"   value={formatCurrency(totalRev-paidRev)} sub={`${orders.filter(o=>!o.paid).length} unpaid`} accent="#A22325" />
      </div>

      {/* Filters */}
      <div style={{ background:"#fff", borderRadius:10, padding:"14px 18px", marginBottom:14, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", border:"1px solid #eee" }}>
        <input type="text" placeholder="Search by name, email, order ID..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:180, padding:"8px 12px", border:"1.5px solid #ddd", borderRadius:7, fontSize:13, outline:"none" }} />
        <FilterGroup label="Status:" value={filter} onChange={setFilter}
          options={[["all","All"],["pending","Pending"],["processing","Processing"],["fulfilled","Fulfilled"],["cancelled","Cancelled"]]} />
        <FilterGroup label="Payment:" value={paidFilter} onChange={setPaidFilter}
          options={[["all","All"],["paid","Paid"],["unpaid","Unpaid"]]} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📭" text="No orders match your filters." />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(order => {
            const isExp      = expanded === order.id;
            const statusSty  = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const payMethod  = paymentMethods.find(p=>p.id===order.paymentMethod);
            return (
              <div key={order.id} style={{ background:"#fff", border:"1px solid #eee", borderRadius:10, overflow:"hidden", borderLeft:`4px solid ${order.paid?"#2d7a2d":"#A22325"}` }}>
                <div onClick={() => setExpanded(isExp ? null : order.id)}
                  style={{ padding:"14px 18px", display:"grid", gridTemplateColumns:"1fr 110px 90px 120px 100px 36px", gap:10, alignItems:"center", cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                >
                  <div>
                    <p style={{ fontWeight:600, fontSize:14, color:"#111", marginBottom:2 }}>{order.name}</p>
                    <p style={{ fontSize:12, color:"#888" }}>{order.id} · {formatDate(order.date)}</p>
                  </div>
                  <span style={{ fontSize:13, color:"#666" }}>{order.items.length} item{order.items.length!==1?"s":""}</span>
                  <span style={{ fontWeight:700, fontSize:15 }}>{formatCurrency(order.total)}</span>
                  <select value={order.status} onChange={e=>{e.stopPropagation();updateOrder(order.id,{status:e.target.value});}} onClick={e=>e.stopPropagation()}
                    style={{ background:statusSty.bg, color:statusSty.color, border:"none", borderRadius:6, padding:"5px 8px", fontSize:12, fontWeight:600, cursor:"pointer", outline:"none" }}>
                    {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <label onClick={e=>e.stopPropagation()} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                    <input type="checkbox" checked={order.paid} onChange={e=>updateOrder(order.id,{paid:e.target.checked})} style={{ accentColor:"#2d7a2d", width:15, height:15 }} />
                    <span style={{ fontSize:12, color:order.paid?"#2d7a2d":"#A22325", fontWeight:600 }}>{order.paid?"Paid":"Unpaid"}</span>
                  </label>
                  <span style={{ color:"#ccc", fontSize:16 }}>{isExp?"▲":"▼"}</span>
                </div>
                {isExp && (
                  <div style={{ borderTop:"1px solid #f0f0f0", padding:"18px", background:"#fafafa" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                      <div><p style={lbl}>Contact</p><p style={sm}>{order.email}</p><p style={sm}>{order.department}</p></div>
                      <div><p style={lbl}>Payment</p><p style={sm}>{payMethod?.label}</p><p style={{...sm,color:"#aaa"}}>{payMethod?.handle}</p></div>
                      {order.notes && <div><p style={lbl}>Notes</p><p style={{...sm,fontStyle:"italic"}}>{order.notes}</p></div>}
                      {order.couponCode && <div><p style={lbl}>Coupon Used</p><p style={{...sm,color:"#2d7a2d",fontWeight:600}}>{order.couponCode} (−{formatCurrency(order.discount||0)})</p></div>}
                    </div>
                    <p style={lbl}>Items</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                      {order.items.map((item,i) => (
                        <div key={i} style={{ background:"#fff", border:"1px solid #eee", borderRadius:7, padding:"9px 13px", display:"flex", justifyContent:"space-between", fontSize:13 }}>
                          <span>
                            <strong>{item.productName}</strong>
                            {Object.entries(item.variants).length>0 && <span style={{color:"#888"}}> ({Object.entries(item.variants).map(([k,v])=>`${k}: ${v}`).join(", ")})</span>}
                            <span style={{color:"#aaa"}}> × {item.qty}</span>
                          </span>
                          <span style={{fontWeight:600}}>{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    {confirmDel===order.id ? (
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{fontSize:13,color:"#A22325"}}>Delete this order?</span>
                        <button onClick={()=>{deleteOrder(order.id);setConfirmDel(null);}} style={smBtn("#A22325")}>Yes, delete</button>
                        <button onClick={()=>setConfirmDel(null)} style={smBtn("#888")}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={()=>setConfirmDel(order.id)} style={smBtn("#ddd","#999")}>Delete Order</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PRODUCTS TAB
═══════════════════════════════════════════ */
const CATEGORIES = ["Apparel","Accessories","Drinkware","Bags","Office","Other"];
const emptyProduct = { name:"", description:"", price:"", category:"Apparel", image:"", variants:{} };

function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [editing, setEditing]     = useState(null); // product id or "new"
  const [form, setForm]           = useState(emptyProduct);
  const [variantKey, setVariantKey]     = useState("");
  const [variantValues, setVariantValues] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [msg, setMsg]             = useState("");

  const openNew = () => { setForm(emptyProduct); setEditing("new"); setVariantKey(""); setVariantValues(""); };
  const openEdit = (p) => {
    setForm({ ...p, price: String(p.price), image: p.image||"" });
    setEditing(p.id);
    setVariantKey(""); setVariantValues("");
  };
  const close = () => { setEditing(null); setMsg(""); };

  const addVariant = () => {
    if (!variantKey.trim() || !variantValues.trim()) return;
    const vals = variantValues.split(",").map(v=>v.trim()).filter(Boolean);
    setForm(f => ({ ...f, variants: { ...f.variants, [variantKey.trim()]: vals } }));
    setVariantKey(""); setVariantValues("");
  };
  const removeVariant = (key) => setForm(f => { const v={...f.variants}; delete v[key]; return {...f, variants:v}; });

  const handleSave = () => {
    if (!form.name.trim() || !form.price) { setMsg("Name and price are required."); return; }
    const data = { ...form, price: parseFloat(form.price) };
    if (editing === "new") addProduct(data);
    else updateProduct(editing, data);
    setMsg(""); close();
  };

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:24, color:"#111", marginBottom:4 }}>Products</h2>
          <p style={{ color:"#888", fontSize:13 }}>{products.length} products</p>
        </div>
        <button onClick={openNew} style={actionBtn("#A22325")}>+ Add Product</button>
      </div>

      {/* Product list */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
        {products.map(p => (
          <div key={p.id} style={{ background:"#fff", border:"1px solid #eee", borderRadius:10, overflow:"hidden" }}>
            <div style={{ background:"#1a1a1a", height:120, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>
              {p.image ? <img src={p.image} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "📦"}
            </div>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                <p style={{ fontWeight:600, fontSize:14, color:"#111", flex:1, marginRight:8 }}>{p.name}</p>
                <span style={{ fontWeight:700, color:"#A22325", fontSize:14, whiteSpace:"nowrap" }}>{formatCurrency(p.price)}</span>
              </div>
              <p style={{ fontSize:12, color:"#888", marginBottom:4 }}>{p.category}</p>
              <p style={{ fontSize:12, color:"#aaa", marginBottom:12, lineHeight:1.4 }}>{p.description?.slice(0,80)}{p.description?.length>80?"…":""}</p>
              {Object.keys(p.variants||{}).length > 0 && (
                <p style={{ fontSize:11, color:"#bbb", marginBottom:10 }}>
                  Variants: {Object.keys(p.variants).join(", ")}
                </p>
              )}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => openEdit(p)} style={{ ...smBtn("#111"), flex:1 }}>Edit</button>
                {confirmDel===p.id ? (
                  <>
                    <button onClick={()=>{deleteProduct(p.id);setConfirmDel(null);}} style={smBtn("#A22325")}>Confirm</button>
                    <button onClick={()=>setConfirmDel(null)} style={smBtn("#888")}>Cancel</button>
                  </>
                ) : (
                  <button onClick={()=>setConfirmDel(p.id)} style={smBtn("#ddd","#999")}>Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add modal */}
      {editing !== null && (
        <div onClick={close} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:14, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ padding:"24px 28px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ fontFamily:"'Georgia', serif", fontSize:20, color:"#111" }}>{editing==="new"?"Add Product":"Edit Product"}</h3>
              <button onClick={close} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#aaa" }}>×</button>
            </div>
            <div style={{ padding:"24px 28px", display:"grid", gap:16 }}>
              <PField label="Product Name *">
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={pInput} placeholder="Classic Logo Tee" />
              </PField>
              <PField label="Description">
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{...pInput,resize:"vertical"}} placeholder="Short product description..." />
              </PField>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <PField label="Price ($) *">
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={pInput} placeholder="0.00" />
                </PField>
                <PField label="Category">
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={pInput}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </PField>
              </div>
              <PField label="Image URL (optional)">
                <input value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))} style={pInput} placeholder="https://example.com/image.jpg" />
              </PField>

              {/* Variants */}
              <div>
                <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"#444", marginBottom:10 }}>Variants</p>
                {Object.entries(form.variants).map(([key,vals]) => (
                  <div key={key} style={{ background:"#f8f8f8", border:"1px solid #eee", borderRadius:8, padding:"10px 12px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:600, color:"#333" }}>{key}: </span>
                      <span style={{ fontSize:13, color:"#666" }}>{vals.join(", ")}</span>
                    </div>
                    <button onClick={()=>removeVariant(key)} style={{ background:"none", border:"none", color:"#A22325", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
                  </div>
                ))}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr auto", gap:8, marginTop:8 }}>
                  <input value={variantKey} onChange={e=>setVariantKey(e.target.value)} style={pInput} placeholder="e.g. Size" />
                  <input value={variantValues} onChange={e=>setVariantValues(e.target.value)} style={pInput} placeholder="S, M, L, XL" />
                  <button onClick={addVariant} style={{ ...actionBtn("#111"), padding:"0 14px", width:"auto" }}>Add</button>
                </div>
                <p style={{ fontSize:11, color:"#bbb", marginTop:6 }}>Enter variant name and comma-separated options.</p>
              </div>

              {msg && <p style={{ fontSize:13, color:"#A22325" }}>{msg}</p>}
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button onClick={handleSave} style={{ ...actionBtn("#A22325"), flex:1 }}>
                  {editing==="new" ? "Add Product" : "Save Changes"}
                </button>
                <button onClick={close} style={{ ...actionBtn("#111"), flex:1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   COUPONS TAB
═══════════════════════════════════════════ */
const emptyCoupon = { code:"", type:"percent", value:"", active:true, description:"" };

function CouponsTab() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyCoupon);
  const [msg, setMsg]           = useState("");
  const [confirmDel, setConfirmDel] = useState(null);

  const openNew  = () => { setForm(emptyCoupon); setEditing("new"); };
  const openEdit = (c) => { setForm({...c, value:String(c.value)}); setEditing(c.id); };
  const close    = () => { setEditing(null); setMsg(""); };

  const handleSave = () => {
    if (!form.code.trim() || !form.value) { setMsg("Code and value are required."); return; }
    const data = { ...form, code: form.code.toUpperCase().trim(), value: parseFloat(form.value) };
    if (editing === "new") addCoupon(data);
    else updateCoupon(editing, data);
    close();
  };

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:24, color:"#111", marginBottom:4 }}>Coupons</h2>
          <p style={{ color:"#888", fontSize:13 }}>{coupons.length} coupon{coupons.length!==1?"s":""}</p>
        </div>
        <button onClick={openNew} style={actionBtn("#A22325")}>+ New Coupon</button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon="🏷️" text="No coupons yet. Create one above." />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {coupons.map(c => (
            <div key={c.id} style={{
              background:"#fff", border:"1px solid #eee", borderRadius:10,
              padding:"16px 20px", display:"flex", alignItems:"center", gap:16,
              borderLeft:`4px solid ${c.active?"#2d7a2d":"#ccc"}`,
            }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span style={{
                    fontFamily:"'Courier New', monospace", fontWeight:700, fontSize:16, color:"#111",
                    background:"#f0f0f0", padding:"3px 10px", borderRadius:6, letterSpacing:"0.1em",
                  }}>{c.code}</span>
                  <span style={{
                    fontSize:12, fontWeight:700, padding:"2px 8px", borderRadius:4,
                    background: c.active?"#e0f5e0":"#f0f0f0",
                    color: c.active?"#1a5c1a":"#888",
                  }}>{c.active?"Active":"Inactive"}</span>
                </div>
                <p style={{ fontSize:13, color:"#555", marginBottom:2 }}>{c.description || "No description"}</p>
                <p style={{ fontSize:12, color:"#A22325", fontWeight:600 }}>
                  {c.type==="percent" ? `${c.value}% off` : `$${c.value} off`} entire order
                </p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:"#555" }}>
                  <input type="checkbox" checked={c.active} onChange={e=>updateCoupon(c.id,{active:e.target.checked})} style={{ accentColor:"#2d7a2d" }} />
                  Active
                </label>
                <button onClick={()=>openEdit(c)} style={smBtn("#111")}>Edit</button>
                {confirmDel===c.id ? (
                  <>
                    <button onClick={()=>{deleteCoupon(c.id);setConfirmDel(null);}} style={smBtn("#A22325")}>Confirm</button>
                    <button onClick={()=>setConfirmDel(null)} style={smBtn("#888")}>Cancel</button>
                  </>
                ) : (
                  <button onClick={()=>setConfirmDel(c.id)} style={smBtn("#ddd","#999")}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupon modal */}
      {editing !== null && (
        <div onClick={close} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:14, width:"100%", maxWidth:440 }}>
            <div style={{ padding:"20px 24px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between" }}>
              <h3 style={{ fontFamily:"'Georgia', serif", fontSize:18, color:"#111" }}>{editing==="new"?"New Coupon":"Edit Coupon"}</h3>
              <button onClick={close} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#aaa" }}>×</button>
            </div>
            <div style={{ padding:"20px 24px", display:"grid", gap:14 }}>
              <PField label="Coupon Code *">
                <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} style={pInput} placeholder="SUMMER20" />
              </PField>
              <PField label="Description">
                <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={pInput} placeholder="20% off entire order" />
              </PField>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <PField label="Discount Type">
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={pInput}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </PField>
                <PField label={form.type==="percent"?"Percentage *":"Amount ($) *"}>
                  <input type="number" min="0" step={form.type==="percent"?"1":"0.01"} max={form.type==="percent"?100:undefined}
                    value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} style={pInput}
                    placeholder={form.type==="percent"?"10":"5.00"} />
                </PField>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:"#333" }}>
                <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} style={{ accentColor:"#2d7a2d", width:16, height:16 }} />
                Active (employees can use this coupon)
              </label>
              {msg && <p style={{ fontSize:13, color:"#A22325" }}>{msg}</p>}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={handleSave} style={{ ...actionBtn("#A22325"), flex:1 }}>{editing==="new"?"Create Coupon":"Save Changes"}</button>
                <button onClick={close} style={{ ...actionBtn("#111"), flex:1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared helpers ── */
function StatCard({ label, value, sub, accent="#111" }) {
  return (
    <div style={{ background:"#fff", borderRadius:10, padding:"16px 18px", border:"1px solid #eee" }}>
      <p style={{ fontSize:11, color:"#999", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{label}</p>
      <p style={{ fontSize:20, fontWeight:700, color:accent, marginBottom:2 }}>{value}</p>
      <p style={{ fontSize:12, color:"#bbb" }}>{sub}</p>
    </div>
  );
}
function FilterGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
      <span style={{ fontSize:12, color:"#888", fontWeight:600 }}>{label}</span>
      {options.map(([val,lbl]) => (
        <button key={val} onClick={()=>onChange(val)} style={{ padding:"4px 11px", border:"1.5px solid", borderColor:value===val?"#111":"#ddd", borderRadius:20, background:value===val?"#111":"#fff", color:value===val?"#fff":"#555", fontSize:12, fontWeight:value===val?600:400, cursor:"pointer" }}>{lbl}</button>
      ))}
    </div>
  );
}
function EmptyState({ icon, text }) {
  return <div style={{ textAlign:"center", padding:"60px 0", color:"#aaa" }}><p style={{ fontSize:32 }}>{icon}</p><p style={{ fontSize:15, marginTop:12 }}>{text}</p></div>;
}
function PField({ label, children }) {
  return <div><label style={{ display:"block", fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"#444", marginBottom:7 }}>{label}</label>{children}</div>;
}
const pInput    = { width:"100%", padding:"10px 14px", border:"1.5px solid #ddd", borderRadius:8, fontSize:14, color:"#111", outline:"none", background:"#fafafa", boxSizing:"border-box" };
const lbl       = { fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#aaa", marginBottom:6 };
const sm        = { fontSize:13, color:"#333" };
const actionBtn = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer", letterSpacing:"0.06em" });
const smBtn     = (bg, color="#fff") => ({ background:bg, color, border:"none", borderRadius:6, padding:"7px 13px", fontSize:12, fontWeight:600, cursor:"pointer" });
