"use client";

import { useEffect, useState } from "react";

type Setor = {
  id: number;
  nome: string;
};

type Colaborador = {
  id: number;
  nome: string;
  setorId: number | "";
  cargoId: number | "";
};

type PerfilOcorrencia = {
  id: number;
  nome: string;
};

type TipoOcorrencia = {
  id: number;
  nome: string;
  perfilId: number;
};

type RegistroOcorrencia = {
  id: number;
  colaboradorId: number;
  tipoOcorrenciaId: number;
  dataOcorrencia: string;
  evidencia: string;
  observacao: string;
  dataCriacao: string;
};

export default function Relatorios() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [perfis, setPerfis] = useState<PerfilOcorrencia[]>([]);
  const [tiposOcorrencia, setTiposOcorrencia] = useState<TipoOcorrencia[]>([]);
  const [registros, setRegistros] = useState<RegistroOcorrencia[]>([]);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const dadosSetores = localStorage.getItem("setores");
    if (dadosSetores) setSetores(JSON.parse(dadosSetores));

    const dadosColaboradores = localStorage.getItem("colaboradores");
    if (dadosColaboradores) setColaboradores(JSON.parse(dadosColaboradores));

    const dadosPerfis = localStorage.getItem("perfisOcorrencia");
    if (dadosPerfis) setPerfis(JSON.parse(dadosPerfis));

    const dadosTipos = localStorage.getItem("tiposOcorrencia");
    if (dadosTipos) setTiposOcorrencia(JSON.parse(dadosTipos));

    const dadosRegistros = localStorage.getItem("registrosOcorrencia");
    if (dadosRegistros) setRegistros(JSON.parse(dadosRegistros));
  }, []);

  const registrosFiltrados = registros.filter((registro) => {
    if (!registro.dataOcorrencia) return false;

    const data = new Date(`${registro.dataOcorrencia}T00:00:00`);
    const inicio = dataInicio ? new Date(`${dataInicio}T00:00:00`) : null;
    const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : null;

    if (inicio && data < inicio) return false;
    if (fim && data > fim) return false;

    return true;
  });

  function getColaborador(id: number) {
    return colaboradores.find((colaborador) => colaborador.id === id);
  }

  function getTipo(id: number) {
    return tiposOcorrencia.find((tipo) => tipo.id === id);
  }

  function getPerfil(id: number) {
    return perfis.find((perfil) => perfil.id === id);
  }

  function getSetor(id: number | "") {
    if (!id) return null;
    return setores.find((setor) => setor.id === id) || null;
  }

  function contarPorSetor() {
    const resultado: { nome: string; total: number }[] = [];

    registrosFiltrados.forEach((registro) => {
      const colaborador = getColaborador(registro.colaboradorId);
      const setor = getSetor(colaborador?.setorId || "");
      const nomeSetor = setor?.nome || "Sem setor";

      const item = resultado.find((r) => r.nome === nomeSetor);

      if (item) item.total += 1;
      else resultado.push({ nome: nomeSetor, total: 1 });
    });

    return resultado.sort((a, b) => b.total - a.total);
  }

  function contarPorPerfil() {
    const resultado: { nome: string; total: number }[] = [];

    registrosFiltrados.forEach((registro) => {
      const tipo = getTipo(registro.tipoOcorrenciaId);
      if (!tipo) return;

      const perfil = getPerfil(tipo.perfilId);
      const nomePerfil = perfil?.nome || "Sem perfil";

      const item = resultado.find((r) => r.nome === nomePerfil);

      if (item) item.total += 1;
      else resultado.push({ nome: nomePerfil, total: 1 });
    });

    return resultado.sort((a, b) => b.total - a.total);
  }

  function contarPorTipo() {
    const resultado: { nome: string; total: number }[] = [];

    registrosFiltrados.forEach((registro) => {
      const tipo = getTipo(registro.tipoOcorrenciaId);
      const nomeTipo = tipo?.nome || "Tipo não encontrado";

      const item = resultado.find((r) => r.nome === nomeTipo);

      if (item) item.total += 1;
      else resultado.push({ nome: nomeTipo, total: 1 });
    });

    return resultado.sort((a, b) => b.total - a.total);
  }

  function contarPorColaborador() {
    const resultado: { nome: string; total: number }[] = [];

    registrosFiltrados.forEach((registro) => {
      const colaborador = getColaborador(registro.colaboradorId);
      const nomeColaborador = colaborador?.nome || "Colaborador não encontrado";

      const item = resultado.find((r) => r.nome === nomeColaborador);

      if (item) item.total += 1;
      else resultado.push({ nome: nomeColaborador, total: 1 });
    });

    return resultado.sort((a, b) => b.total - a.total);
  }

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
  }

  const totalOcorrencias = registrosFiltrados.length;
  const totalSetores = contarPorSetor().length;
  const totalPerfis = contarPorPerfil().length;
  const totalTipos = contarPorTipo().length;

  return (
    <main style={{ minHeight: "100vh", background: "#f6f6f6", padding: "32px" }}>
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "8px", color: "#A07C3B" }}>
          Relatórios
        </h1>

        <p style={{ color: "#555", marginBottom: "24px" }}>
          Dashboard consolidado das ocorrências registradas.
        </p>

        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            border: "1px solid #eee",
            borderRadius: "12px",
            background: "#fafafa",
          }}
        >
          <strong style={{ display: "block", marginBottom: "12px", color: "#A07C3B" }}>
            Filtro por período
          </strong>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={input} />
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={input} />

            <button onClick={limparFiltros} style={botaoSecundario}>
              Limpar
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <Card titulo="Total de ocorrências" valor={totalOcorrencias} />
          <Card titulo="Setores com ocorrências" valor={totalSetores} />
          <Card titulo="Perfis com ocorrências" valor={totalPerfis} />
          <Card titulo="Tipos registrados" valor={totalTipos} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          <BlocoRelatorio titulo="Ocorrências por setor" dados={contarPorSetor()} />
          <BlocoRelatorio titulo="Ocorrências por perfil" dados={contarPorPerfil()} />
          <BlocoRelatorio titulo="Ocorrências por tipo" dados={contarPorTipo()} />
          <BlocoRelatorio titulo="Ocorrências por colaborador" dados={contarPorColaborador()} />
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

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div style={cardIndicador}>
      <div style={{ fontSize: "13px", color: "#777", marginBottom: "8px" }}>{titulo}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color: "#A07C3B" }}>{valor}</div>
    </div>
  );
}

function BlocoRelatorio({
  titulo,
  dados,
}: {
  titulo: string;
  dados: { nome: string; total: number }[];
}) {
  return (
    <div style={blocoRelatorio}>
      <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "#A07C3B" }}>{titulo}</h2>

      {dados.length === 0 && <p style={{ color: "#777" }}>Sem dados no período.</p>}

      {dados.map((item) => (
        <div key={item.nome} style={linhaRelatorio}>
          <span>{item.nome}</span>
          <strong>{item.total}</strong>
        </div>
      ))}
    </div>
  );
}

const input: React.CSSProperties = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const botaoSecundario: React.CSSProperties = {
  padding: "10px 16px",
  background: "#eee",
  color: "#333",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const cardIndicador: React.CSSProperties = {
  padding: "20px",
  border: "1px solid #eee",
  borderRadius: "12px",
  background: "#fafafa",
};

const blocoRelatorio: React.CSSProperties = {
  padding: "20px",
  border: "1px solid #eee",
  borderRadius: "12px",
};

const linhaRelatorio: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #f0f0f0",
};