import { useState } from "react";

const ADMIN_PASSWORD = "admin1234";

export default function AdminLogin({ onSuccess }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "80vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
      background: "linear-gradient(135deg, #fff 0%, #FFF5F5 100%)",
    }}>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }`}</style>
      <div style={{
        background: "#fff",
        border: "1px solid #EAEAEA",
        borderRadius: 20,
        padding: "52px 44px",
        width: "100%", maxWidth: 380, textAlign: "center",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        animation: shake ? "shake 0.5s ease" : "none",
      }}>
        <div style={{
          width: 56, height: 56,
          background: "linear-gradient(135deg, #FFF0F0, #FFE0E0)",
          border: "2px solid rgba(162,35,37,0.15)",
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 22px", fontSize: 22,
        }}>🔒</div>

        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 24, color: "#1a1a1a", marginBottom: 8 }}>Admin Access</h2>
        <p style={{ fontSize: 14, color: "#aaa", marginBottom: 32, lineHeight: 1.6 }}>
          Enter the admin password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password" value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Password" autoFocus
            style={{
              width: "100%", padding: "13px 16px",
              border: `1.5px solid ${error ? "#A22325" : "#EAEAEA"}`,
              borderRadius: 12, fontSize: 15, outline: "none",
              marginBottom: 8, boxSizing: "border-box",
              textAlign: "center", letterSpacing: "0.15em",
              background: "#F7F7F7", color: "#1a1a1a",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = "#A22325"; e.target.style.boxShadow = "0 0 0 3px rgba(162,35,37,0.08)"; }}
            onBlur={e => { if (!error) { e.target.style.borderColor = "#EAEAEA"; e.target.style.boxShadow = "none"; }}}
          />
          {error && <p style={{ fontSize: 13, color: "#A22325", marginBottom: 14, fontWeight: 500 }}>Incorrect password. Try again.</p>}
          <button type="submit" style={{
            width: "100%",
            background: "#A22325", color: "#fff",
            border: "none", borderRadius: 12,
            padding: "14px", fontSize: 14, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer", marginTop: error ? 0 : 8,
            boxShadow: "0 4px 16px rgba(162,35,37,0.3)",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#8a1e20"}
            onMouseLeave={e => e.currentTarget.style.background = "#A22325"}
          >Sign In</button>
        </form>
      </div>
    </div>
  );
}
