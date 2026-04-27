"use client";

import { useEffect, useState } from "react";

type Setor = {
  id: number;
  nome: string;
};

type Cargo = {
  id: number;
  nome: string;
  valorBase: number;
};

type Colaborador = {
  id: number;
  nome: string;
  setorId: number | "";
  cargoId: number | "";
};

export default function Colaboradores() {
  const [nome, setNome] = useState("");
  const [setorId, setSetorId] = useState<number | "">("");
  const [cargoId, setCargoId] = useState<number | "">("");

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const dadosSetores = localStorage.getItem("setores");
    if (dadosSetores) setSetores(JSON.parse(dadosSetores));

    const dadosCargos = localStorage.getItem("cargos");
    if (dadosCargos) setCargos(JSON.parse(dadosCargos));

    const dadosColaboradores = localStorage.getItem("colaboradores");

    if (dadosColaboradores) {
      const dadosAntigos = JSON.parse(dadosColaboradores);

      const dadosCorrigidos: Colaborador[] = dadosAntigos.map((item: any) => ({
        id: item.id || Date.now() + Math.random(),
        nome: item.nome || "",
        setorId: item.setorId || "",
        cargoId: item.cargoId || "",
      }));

      setColaboradores(dadosCorrigidos);
    }

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem("colaboradores", JSON.stringify(colaboradores));
    }
  }, [colaboradores, carregado]);

  const colaboradoresOrdenados = [...colaboradores].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  const setoresOrdenados = [...setores].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  const cargosOrdenados = [...cargos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  function limparFormulario() {
    setNome("");
    setSetorId("");
    setCargoId("");
    setEditandoId(null);
  }

  function salvarColaborador() {
    if (!nome || !setorId || !cargoId) return;

    if (editandoId) {
      setColaboradores(
        colaboradores.map((colaborador) =>
          colaborador.id === editandoId
            ? {
                ...colaborador,
                nome,
                setorId: Number(setorId),
                cargoId: Number(cargoId),
              }
            : colaborador
        )
      );

      limparFormulario();
      return;
    }

    const novoColaborador: Colaborador = {
      id: Date.now(),
      nome,
      setorId: Number(setorId),
      cargoId: Number(cargoId),
    };

    setColaboradores([...colaboradores, novoColaborador]);
    limparFormulario();
  }

  function editarColaborador(colaborador: Colaborador) {
    setEditandoId(colaborador.id);
    setNome(colaborador.nome || "");
    setSetorId(colaborador.setorId || "");
    setCargoId(colaborador.cargoId || "");
  }

  function getSetorNome(id: number | "") {
    if (!id) return "Sem setor";
    return setores.find((setor) => setor.id === id)?.nome || "Setor não encontrado";
  }

  function getCargo(id: number | "") {
    if (!id) return null;
    return cargos.find((cargo) => cargo.id === id) || null;
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
          Colaboradores
        </h1>

        <div style={{ marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={input}
          />

          <select
            value={setorId}
            onChange={(e) => setSetorId(e.target.value ? Number(e.target.value) : "")}
            style={input}
          >
            <option value="">Selecione o setor</option>

            {setoresOrdenados.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>

          <select
            value={cargoId}
            onChange={(e) => setCargoId(e.target.value ? Number(e.target.value) : "")}
            style={input}
          >
            <option value="">Selecione o cargo</option>

            {cargosOrdenados.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.nome}
              </option>
            ))}
          </select>

          <button onClick={salvarColaborador} style={botao}>
            {editandoId ? "Salvar edição" : "Adicionar"}
          </button>

          {editandoId && (
            <button onClick={limparFormulario} style={botaoSecundario}>
              Cancelar
            </button>
          )}
        </div>

        <div>
          {colaboradoresOrdenados.length === 0 && <p>Nenhum colaborador cadastrado.</p>}

          {colaboradoresOrdenados.map((colaborador) => {
            const cargo = getCargo(colaborador.cargoId);

            return (
              <div key={colaborador.id} style={card}>
                <div>
                  <strong>{colaborador.nome}</strong>

                  <div style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>
                    {cargo ? cargo.nome : "Sem cargo"} • {getSetorNome(colaborador.setorId)}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {cargo ? `Bônus: R$ ${formatarMoeda(cargo.valorBase)}` : "Sem valor"}
                  </div>
                </div>

                <button onClick={() => editarColaborador(colaborador)} style={editarBtn}>
                  Editar
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "24px" }}>
          <a href="/" style={link}>
            ← Voltar para início
          </a>
        </div>
      </section>
    </main>
  );
}

const input: React.CSSProperties = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  minWidth: "220px",
};

const botao: React.CSSProperties = {
  padding: "10px 16px",
  background: "#A07C3B",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const botaoSecundario: React.CSSProperties = {
  padding: "10px 16px",
  background: "#eee",
  color: "#333",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const editarBtn: React.CSSProperties = {
  padding: "8px 12px",
  background: "#f6f6f6",
  color: "#A07C3B",
  border: "1px solid #ddd",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const card: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #eee",
  borderRadius: "8px",
  marginBottom: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const link: React.CSSProperties = {
  color: "#A07C3B",
  textDecoration: "none",
  fontWeight: "bold",
};