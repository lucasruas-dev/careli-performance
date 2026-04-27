export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#f6f6f6", padding: "32px" }}>
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* LOGO */}
        <div style={{ marginBottom: "16px" }}>
          <img
            src="/logo.png"
            alt="Careli"
            style={{ width: "90px", margin: "0 auto" }}
          />
        </div>

        <h1 style={{ fontSize: "28px", color: "#A07C3B", marginBottom: "8px" }}>
          Sistema de Performance
        </h1>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <a href="/colaboradores" style={card}>Colaboradores</a>
          <a href="/ocorrencias" style={card}>Ocorrências</a>
          <a href="/relatorios" style={card}>Relatórios</a>
          <a href="/configuracoes" style={card}>Configurações</a>
        </div>
      </section>
    </main>
  );
}

const card: React.CSSProperties = {
  background: "#f9f9f9",
  padding: "24px",
  borderRadius: "12px",
  textAlign: "center",
  textDecoration: "none",
  color: "#A07C3B",
  fontWeight: "bold",
  border: "1px solid #eee",
};