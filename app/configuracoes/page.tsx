import Link from "next/link";

export default function Configuracoes() {
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
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "8px", color: "#A07C3B" }}>
          Configurações
        </h1>

        <p style={{ color: "#555", marginBottom: "32px" }}>
          Área para configurar a base do sistema.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          <Link href="/configuracoes/setores" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={cardStyle}>
              <strong>Setores</strong>
            </div>
          </Link>

          <Link href="/configuracoes/cargos" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={cardStyle}>
              <strong>Cargos</strong>
            </div>
          </Link>

          <Link href="/configuracoes/perfis-ocorrencia" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={cardStyle}>
              <strong>Perfis de ocorrência</strong>
            </div>
          </Link>

          <Link href="/configuracoes/ocorrencias" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={cardStyle}>
              <strong>Ocorrências</strong>
            </div>
          </Link>
        </div>

        <div style={{ marginTop: "24px" }}>
          <a href="/" style={{ color: "#A07C3B", textDecoration: "none", fontWeight: "bold" }}>
            ← Voltar para início
          </a>
        </div>
      </section>
    </main>
  );
}

const cardStyle = {
  padding: "28px 20px",
  border: "1px solid #eee",
  borderRadius: "12px",
  cursor: "pointer",
  textAlign: "center" as const,
};