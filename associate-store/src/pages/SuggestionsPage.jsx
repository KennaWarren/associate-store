import { useState } from "react";
import { useStore } from "../context/StoreContext";

export default function SuggestionsPage() {
  const { submitSuggestion } = useStore();
  const [form, setForm]       = useState({ name:"", storeNumber:"", suggestion:"", question:"" });
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = "Required";
    if (!form.storeNumber.trim()) e.storeNumber = "Required";
    if (!form.suggestion.trim()) e.suggestion = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true); setError(null);
    try {
      await submitSuggestion(form);
      setSubmitted(true);
    } catch (e) {
      setError("Could not submit suggestion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ background:"#F7F7F7", minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"#fff", borderRadius:20, padding:"52px 44px", maxWidth:480, width:"100%", textAlign:"center", border:"1px solid #EAEAEA", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ width:64, height:64, background:"#FFF0F0", border:"2px solid rgba(162,35,37,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:28 }}>💡</div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:26, color:"#1a1a1a", marginBottom:10 }}>Thank You!</h2>
          <p style={{ color:"#666", fontSize:15, lineHeight:1.7, marginBottom:28 }}>
            Your product suggestion has been submitted. We review all suggestions and appreciate your feedback!
          </p>
          <button onClick={() => { setSubmitted(false); setForm({ name:"", storeNumber:"", suggestion:"", question:"" }); }}
            style={{ background:"#A22325", color:"#fff", border:"none", borderRadius:10, padding:"13px 32px", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(162,35,37,0.3)" }}>
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"#F7F7F7", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg, #fff 0%, #FFF5F5 50%, #FFF0F0 100%)", padding:"60px 32px 48px", textAlign:"center", borderBottom:"1px solid #EAEAEA" }}>
        <span style={{ display:"inline-block", background:"#FFF0F0", border:"1px solid rgba(162,35,37,0.2)", color:"#A22325", fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", padding:"6px 16px", borderRadius:20, marginBottom:20 }}>
          Have an Idea?
        </span>
        <h1 style={{ fontFamily:"'Georgia', serif", fontSize:"clamp(2rem, 4vw, 3rem)", color:"#1a1a1a", fontWeight:700, margin:"0 0 14px", letterSpacing:"-0.02em" }}>
          Product Suggestions
        </h1>
        <p style={{ color:"#777", fontSize:16, maxWidth:420, margin:"0 auto", lineHeight:1.7 }}>
          Don't see something you'd like? Submit a product suggestion and we'll consider adding it to the store.
        </p>
      </div>

      {/* Form */}
      <div style={{ maxWidth:580, margin:"48px auto", padding:"0 24px 80px" }}>
        <div style={{ background:"#fff", borderRadius:20, padding:"36px 36px", border:"1px solid #EAEAEA", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>

          <div style={{ display:"grid", gap:20 }}>
            <Field label="Your Name *" error={errors.name}>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                style={inp(errors.name)} placeholder="Jane Smith" />
            </Field>

            <Field label="Store Number *" error={errors.storeNumber}>
              <input value={form.storeNumber} onChange={e => setForm(f=>({...f,storeNumber:e.target.value}))}
                style={inp(errors.storeNumber)} placeholder="e.g. Store #42" />
            </Field>

            <Field label="Product Suggestion *" error={errors.suggestion}>
              <textarea value={form.suggestion} onChange={e => setForm(f=>({...f,suggestion:e.target.value}))}
                rows={4} style={{ ...inp(errors.suggestion), resize:"vertical" }}
                placeholder="Describe the product you'd like to see (brand, type, style, etc.)" />
            </Field>

            <Field label="Questions or Comments (optional)">
              <textarea value={form.question} onChange={e => setForm(f=>({...f,question:e.target.value}))}
                rows={3} style={{ ...inp(), resize:"vertical" }}
                placeholder="Any questions for the store team?" />
            </Field>
          </div>

          {error && <p style={{ fontSize:13, color:"#A22325", marginTop:16 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={submitting} style={{
            width:"100%", marginTop:24,
            background: submitting ? "#ccc" : "#A22325",
            color:"#fff", border:"none", borderRadius:12,
            padding:"15px", fontSize:14, fontWeight:700,
            letterSpacing:"0.04em", cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: submitting ? "none" : "0 4px 16px rgba(162,35,37,0.3)",
            transition:"background 0.2s",
          }}>
            {submitting ? "Submitting…" : "Submit Suggestion"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#aaa", marginBottom:8 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize:12, color:"#A22325", marginTop:5 }}>{error}</p>}
    </div>
  );
}

const inp = (err) => ({
  width:"100%", padding:"12px 14px",
  border:`1.5px solid ${err ? "#A22325" : "#EAEAEA"}`,
  borderRadius:10, fontSize:14, color:"#1a1a1a",
  outline:"none", background:"#F7F7F7", boxSizing:"border-box",
});
