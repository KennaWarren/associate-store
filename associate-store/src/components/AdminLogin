import { useState } from "react";

const ADMIN_PASSWORD = "admin1234"; // 🔒 Change this to your real password

export default function AdminLogin({ onSuccess }) {
  const [input, setInput]   = useState("");
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "#f7f7f7",
    }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 14,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          animation: shake ? "shake 0.5s ease" : "none",
        }}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%       { transform: translateX(-8px); }
            40%       { transform: translateX(8px); }
            60%       { transform: translateX(-6px); }
            80%       { transform: translateX(6px); }
          }
        `}</style>

        {/* Lock icon */}
        <div style={{
          width: 56,
          height: 56,
          background: "#111",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 24,
        }}>🔒</div>

        <h2 style={{
          fontFamily: "'Georgia', serif",
          fontSize: 22,
          color: "#111",
          marginBottom: 6,
        }}>Admin Access</h2>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 28 }}>
          Enter the admin password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              border: `1.5px solid ${error ? "#A22325" : "#ddd"}`,
              borderRadius: 8,
              fontSize: 15,
              outline: "none",
              marginBottom: 8,
              boxSizing: "border-box",
              textAlign: "center",
              letterSpacing: "0.1em",
              transition: "border-color 0.2s",
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: "#A22325", marginBottom: 12 }}>
              Incorrect password. Please try again.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              background: "#A22325",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "13px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              marginTop: error ? 0 : 8,
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
