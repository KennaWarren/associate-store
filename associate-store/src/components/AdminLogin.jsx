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
      justifyContent: "center", padding: 24, background: "#f9f9f9",
    }}>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }`}</style>
      <div style={{
        background: "#fff", border: "1px solid #f0f0f0",
        borderRadius: 20, padding: "48px 40px",
        width: "100%", maxWidth: 360, textAlign: "center",
        animation: shake ? "shake 0.5s ease" : "none",
      }}>
        <div style={{
          width: 52, height: 52, background: "#0a0a0a", borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 22,
        }}>🔒</div>
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#0a0a0a", marginBottom: 6 }}>Admin Access</h2>
        <p style={{ fontSize: 14, color: "#aaa", marginBottom: 28, lineHeight: 1.6 }}>Enter the admin password to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password" value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Password" autoFocus
            style={{
              width: "100%", padding: "13px 16px",
              border: `1.5px solid ${error ? "#A22325" : "#f0f0f0"}`,
              borderRadius: 10, fontSize: 15, outline: "none",
              marginBottom: 8, boxSizing: "border-box",
              textAlign: "center", letterSpacing: "0.15em",
              background: "#f9f9f9", color: "#0a0a0a",
              transition: "border-color 0.2s",
            }}
          />
          {error && <p style={{ fontSize: 12, color: "#A22325", marginBottom: 12 }}>Incorrect password. Try again.</p>}
          <button type="submit" style={{
            width: "100%", background: "#0a0a0a", color: "#fff",
            border: "none", borderRadius: 10,
            padding: "13px", fontSize: 14, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
            marginTop: error ? 0 : 8,
          }}>Sign In</button>
        </form>
      </div>
    </div>
  );
}
