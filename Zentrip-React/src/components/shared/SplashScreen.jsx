export default function SplashScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: i === 1 ? "#f97316" : "#3b82f6",
              display: "inline-block",
              animation: "zt-bounce 3s infinite ease-in-out",
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes zt-bounce {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
          40%            { transform: scale(1);    opacity: 1;    }
        }
      `}</style>
    </div>
  );
}
