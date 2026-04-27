"use client";

import { useEffect, useState } from "react";

type Cargo = {
  id: number;
  nome: string;
  valorBase: number;
};

export default function Cargos() {
  const [nome, setNome] = useState("");
  const [valorBase, setValorBase] = useState("");
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const dados = localStorage.getItem("cargos");

    if (dados) {
      setCargos(JSON.parse(dados));
    }

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem("cargos", JSON.stringify(cargos));
    }
  }, [cargos, carregado]);

  const cargosOrdenados = [...cargos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function limparFormulario() {
    setNome("");
    setValorBase("");
    setEditandoId(null);
  }

  function salvarCargo() {
    if (!nome || !valorBase) return;

    if (editandoId) {
      const atualizados = cargos.map((cargo) =>
        cargo.id === editandoId
          ? { ...cargo, nome, valorBase: Number(valorBase) }
          : cargo
      );

      setCargos(atualizados);
      limparFormulario();
      return;
    }

    const novoCargo: Cargo = {
      id: Date.now(),
      nome,
      valorBase: Number(valorBase),
    };

    setCargos([...cargos, novoCargo]);
    limparFormulario();
  }

  function editarCargo(cargo: Cargo) {
    setEditandoId(cargo.id);
    setNome(cargo.nome);
    setValorBase(String(cargo.valorBase));
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
          Cargos
        </h1>

        <div style={{ marginBottom: "24px" }}>
          <input
            placeholder="Nome do cargo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              padding: "10px",
              marginRight: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "220px",
            }}
          />

          <input
            placeholder="Valor base"
            type="number"
            value={valorBase}
            onChange={(e) => setValorBase(e.target.value)}
            style={{
              padding: "10px",
              marginRight: "8px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "220px",
            }}
          />

          <button
            onClick={salvarCargo}
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
          {cargosOrdenados.length === 0 && <p>Nenhum cargo cadastrado.</p>}

          {cargosOrdenados.map((cargo) => (
            <div
              key={cargo.id}
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
                <strong>{cargo.nome}</strong> — R$ {formatarMoeda(cargo.valorBase)}
              </div>

              <button
                onClick={() => editarCargo(cargo)}
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