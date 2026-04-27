"use client";

import { useEffect, useState } from "react";

type PerfilOcorrencia = {
  id: number;
  nome: string;
};

export default function PerfisOcorrencia() {
  const [nome, setNome] = useState("");
  const [perfis, setPerfis] = useState<PerfilOcorrencia[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const dados = localStorage.getItem("perfisOcorrencia");
    if (dados) {
      setPerfis(JSON.parse(dados));
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem("perfisOcorrencia", JSON.stringify(perfis));
    }
  }, [perfis, carregado]);

  const perfisOrdenados = [...perfis].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  function limparFormulario() {
    setNome("");
    setEditandoId(null);
  }

  function salvarPerfil() {
    if (!nome) return;

    if (editandoId) {
      setPerfis(
        perfis.map((p) =>
          p.id === editandoId ? { ...p, nome } : p
        )
      );
      limparFormulario();
      return;
    }

    setPerfis([
      ...perfis,
      {
        id: Date.now(),
        nome,
      },
    ]);

    limparFormulario();
  }

  function editarPerfil(perfil: PerfilOcorrencia) {
    setEditandoId(perfil.id);
    setNome(perfil.nome);
  }

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
        <h1 style={{ fontSize: "32px", marginBottom: "16px", color: "#A07C3B" }}>
          Perfis de Ocorrência
        </h1>

        <div style={{ marginBottom: "24px" }}>
          <input
            placeholder="Nome do perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              padding: "10px",
              marginRight: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "260px",
            }}
          />

          <button
            onClick={salvarPerfil}
            style={{
              padding: "10px 16px",
              background: "#A07C3B",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            {editandoId ? "Salvar edição" : "Adicionar"}
          </button>

          {editandoId && (
            <button
              onClick={limparFormulario}
              style={{
                padding: "10px 16px",
                background: "#eee",
                color: "#333",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>

        <div>
          {perfisOrdenados.length === 0 && <p>Nenhum perfil cadastrado.</p>}

          {perfisOrdenados.map((perfil) => (
            <div
              key={perfil.id}
              style={{
                padding: "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{perfil.nome}</strong>

              <button
                onClick={() => editarPerfil(perfil)}
                style={{
                  padding: "8px 12px",
                  background: "#f6f6f6",
                  color: "#A07C3B",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Editar
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px" }}>
          <a href="/configuracoes" style={{ color: "#A07C3B", fontWeight: "bold" }}>
            ← Voltar
          </a>
        </div>
      </section>
    </main>
  );
}