"use client";

import { useEffect, useState } from "react";

type Perfil = {
  id: number;
  nome: string;
};

type TipoOcorrencia = {
  id: number;
  nome: string;
  perfilId: number;
};

export default function OcorrenciasConfiguradas() {
  const [nome, setNome] = useState("");
  const [perfilId, setPerfilId] = useState<number | "">("");
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const dadosPerfis = localStorage.getItem("perfisOcorrencia");
    if (dadosPerfis) setPerfis(JSON.parse(dadosPerfis));

    const dadosTipos = localStorage.getItem("tiposOcorrencia");
    if (dadosTipos) setTipos(JSON.parse(dadosTipos));

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem("tiposOcorrencia", JSON.stringify(tipos));
    }
  }, [tipos, carregado]);

  const perfisOrdenados = [...perfis].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  const tiposOrdenados = [...tipos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  function getPerfilNome(id: number) {
    return perfis.find((perfil) => perfil.id === id)?.nome || "Sem perfil";
  }

  function limparFormulario() {
    setNome("");
    setPerfilId("");
    setEditandoId(null);
  }

  function salvarOcorrenciaConfigurada() {
    if (!nome || !perfilId) return;

    if (editandoId) {
      setTipos(
        tipos.map((tipo) =>
          tipo.id === editandoId
            ? {
                ...tipo,
                nome,
                perfilId: Number(perfilId),
              }
            : tipo
        )
      );

      limparFormulario();
      return;
    }

    const novaOcorrencia: TipoOcorrencia = {
      id: Date.now(),
      nome,
      perfilId: Number(perfilId),
    };

    setTipos([...tipos, novaOcorrencia]);
    limparFormulario();
  }

  function editarOcorrenciaConfigurada(tipo: TipoOcorrencia) {
    setEditandoId(tipo.id);
    setNome(tipo.nome);
    setPerfilId(tipo.perfilId);
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
          Ocorrências configuradas
        </h1>

        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            placeholder="Nome da ocorrência"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "280px",
            }}
          />

          <select
            value={perfilId}
            onChange={(e) => setPerfilId(Number(e.target.value))}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "240px",
            }}
          >
            <option value="">Selecione o perfil</option>

            {perfisOrdenados.map((perfil) => (
              <option key={perfil.id} value={perfil.id}>
                {perfil.nome}
              </option>
            ))}
          </select>

          <button
            onClick={salvarOcorrenciaConfigurada}
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
          {tiposOrdenados.length === 0 && <p>Nenhuma ocorrência configurada.</p>}

          {tiposOrdenados.map((tipo) => (
            <div
              key={tipo.id}
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
              <div>
                <strong>{tipo.nome}</strong> — {getPerfilNome(tipo.perfilId)}
              </div>

              <button
                onClick={() => editarOcorrenciaConfigurada(tipo)}
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
          <a
            href="/configuracoes"
            style={{ color: "#A07C3B", textDecoration: "none", fontWeight: "bold" }}
          >
            ← Voltar para configurações
          </a>
        </div>
      </section>
    </main>
  );
}