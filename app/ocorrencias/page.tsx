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

export default function Ocorrencias() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [perfis, setPerfis] = useState<PerfilOcorrencia[]>([]);
  const [tiposOcorrencia, setTiposOcorrencia] = useState<TipoOcorrencia[]>([]);
  const [registros, setRegistros] = useState<RegistroOcorrencia[]>([]);

  const [colaboradorId, setColaboradorId] = useState<number | "">("");
  const [tipoOcorrenciaId, setTipoOcorrenciaId] = useState<number | "">("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [evidencia, setEvidencia] = useState("");
  const [observacao, setObservacao] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregado, setCarregado] = useState(false);

  const [filtroSetorId, setFiltroSetorId] = useState<number | "">("");
  const [filtroColaboradorId, setFiltroColaboradorId] = useState<number | "">("");
  const [filtroTipoOcorrenciaId, setFiltroTipoOcorrenciaId] = useState<number | "">("");
  const [filtroPerfilId, setFiltroPerfilId] = useState<number | "">("");
  const [filtroDataCriacao, setFiltroDataCriacao] = useState("");
  const [filtroDataOcorrencia, setFiltroDataOcorrencia] = useState("");

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

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem("registrosOcorrencia", JSON.stringify(registros));
    }
  }, [registros, carregado]);

  const setoresOrdenados = [...setores].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const colaboradoresOrdenados = [...colaboradores].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
  const perfisOrdenados = [...perfis].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const tiposOrdenados = [...tiposOcorrencia].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  function getColaborador(id: number) {
    return colaboradores.find((colaborador) => colaborador.id === id);
  }

  function getSetor(id: number | "") {
    if (!id) return null;
    return setores.find((setor) => setor.id === id) || null;
  }

  function getNomeColaborador(id: number) {
    return getColaborador(id)?.nome || "Colaborador não encontrado";
  }

  function getTipoOcorrencia(id: number) {
    return tiposOcorrencia.find((tipo) => tipo.id === id);
  }

  function getNomeTipoOcorrencia(id: number) {
    return getTipoOcorrencia(id)?.nome || "Ocorrência não encontrada";
  }

  function getNomePerfilPorTipo(tipoOcorrenciaId: number) {
    const tipo = getTipoOcorrencia(tipoOcorrenciaId);
    if (!tipo) return "Perfil não encontrado";

    return perfis.find((perfil) => perfil.id === tipo.perfilId)?.nome || "Perfil não encontrado";
  }

  function getNomeSetorPorColaborador(colaboradorId: number) {
    const colaborador = getColaborador(colaboradorId);
    const setor = getSetor(colaborador?.setorId || "");
    return setor?.nome || "Sem setor";
  }

  const registrosFiltrados = registros.filter((registro) => {
    const colaborador = getColaborador(registro.colaboradorId);
    const tipo = getTipoOcorrencia(registro.tipoOcorrenciaId);

    const dataCriacaoFormatada = registro.dataCriacao ? registro.dataCriacao.split("T")[0] : "";

    const filtroSetorOk = !filtroSetorId || colaborador?.setorId === Number(filtroSetorId);
    const filtroColaboradorOk =
      !filtroColaboradorId || registro.colaboradorId === Number(filtroColaboradorId);
    const filtroTipoOk =
      !filtroTipoOcorrenciaId || registro.tipoOcorrenciaId === Number(filtroTipoOcorrenciaId);
    const filtroPerfilOk = !filtroPerfilId || tipo?.perfilId === Number(filtroPerfilId);
    const filtroDataCriacaoOk = !filtroDataCriacao || dataCriacaoFormatada === filtroDataCriacao;
    const filtroDataOcorrenciaOk =
      !filtroDataOcorrencia || registro.dataOcorrencia === filtroDataOcorrencia;

    return (
      filtroSetorOk &&
      filtroColaboradorOk &&
      filtroTipoOk &&
      filtroPerfilOk &&
      filtroDataCriacaoOk &&
      filtroDataOcorrenciaOk
    );
  });

  const registrosOrdenados = [...registrosFiltrados].sort(
    (a, b) => new Date(b.dataOcorrencia).getTime() - new Date(a.dataOcorrencia).getTime()
  );

  function limparFormulario() {
    setColaboradorId("");
    setTipoOcorrenciaId("");
    setDataOcorrencia("");
    setEvidencia("");
    setObservacao("");
    setEditandoId(null);
  }

  function limparFiltros() {
    setFiltroSetorId("");
    setFiltroColaboradorId("");
    setFiltroTipoOcorrenciaId("");
    setFiltroPerfilId("");
    setFiltroDataCriacao("");
    setFiltroDataOcorrencia("");
  }

  function salvarRegistro() {
    if (!colaboradorId || !tipoOcorrenciaId || !dataOcorrencia) return;

    if (editandoId) {
      setRegistros(
        registros.map((registro) =>
          registro.id === editandoId
            ? {
                ...registro,
                colaboradorId: Number(colaboradorId),
                tipoOcorrenciaId: Number(tipoOcorrenciaId),
                dataOcorrencia,
                evidencia,
                observacao,
              }
            : registro
        )
      );

      limparFormulario();
      return;
    }

    const novoRegistro: RegistroOcorrencia = {
      id: Date.now(),
      colaboradorId: Number(colaboradorId),
      tipoOcorrenciaId: Number(tipoOcorrenciaId),
      dataOcorrencia,
      evidencia,
      observacao,
      dataCriacao: new Date().toISOString(),
    };

    setRegistros([...registros, novoRegistro]);
    limparFormulario();
  }

  function editarRegistro(registro: RegistroOcorrencia) {
    setEditandoId(registro.id);
    setColaboradorId(registro.colaboradorId);
    setTipoOcorrenciaId(registro.tipoOcorrenciaId);
    setDataOcorrencia(registro.dataOcorrencia);
    setEvidencia(registro.evidencia || "");
    setObservacao(registro.observacao || "");
  }

  function formatarData(data: string) {
    if (!data) return "-";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function formatarDataHora(data: string) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  }

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
        <h1 style={{ fontSize: "32px", marginBottom: "16px", color: "#A07C3B" }}>
          Ocorrências
        </h1>

        <div
          style={{
            marginBottom: "12px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 160px 1.3fr auto auto",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <select value={colaboradorId} onChange={(e) => setColaboradorId(Number(e.target.value))} style={input}>
            <option value="">Colaborador</option>
            {colaboradoresOrdenados.map((colaborador) => (
              <option key={colaborador.id} value={colaborador.id}>
                {colaborador.nome}
              </option>
            ))}
          </select>

          <select value={tipoOcorrenciaId} onChange={(e) => setTipoOcorrenciaId(Number(e.target.value))} style={input}>
            <option value="">Ocorrência</option>
            {tiposOrdenados.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>

          <input type="date" value={dataOcorrencia} onChange={(e) => setDataOcorrencia(e.target.value)} style={input} />

          <input
            placeholder="Evidência: link, print ou referência"
            value={evidencia}
            onChange={(e) => setEvidencia(e.target.value)}
            style={input}
          />

          <button onClick={salvarRegistro} style={botaoPrimario}>
            {editandoId ? "Salvar" : "Adicionar"}
          </button>

          {editandoId && (
            <button onClick={limparFormulario} style={botaoSecundario}>
              Cancelar
            </button>
          )}
        </div>

        <textarea
          placeholder="Observação / nota detalhada"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          style={{
            width: "100%",
            minHeight: "90px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginBottom: "24px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />

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
            Filtros
          </strong>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 160px 160px auto",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <select
              value={filtroSetorId}
              onChange={(e) => setFiltroSetorId(e.target.value ? Number(e.target.value) : "")}
              style={input}
            >
              <option value="">Todos os setores</option>
              {setoresOrdenados.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroColaboradorId}
              onChange={(e) => setFiltroColaboradorId(e.target.value ? Number(e.target.value) : "")}
              style={input}
            >
              <option value="">Todos os colaboradores</option>
              {colaboradoresOrdenados.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroTipoOcorrenciaId}
              onChange={(e) =>
                setFiltroTipoOcorrenciaId(e.target.value ? Number(e.target.value) : "")
              }
              style={input}
            >
              <option value="">Todos os tipos</option>
              {tiposOrdenados.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroPerfilId}
              onChange={(e) => setFiltroPerfilId(e.target.value ? Number(e.target.value) : "")}
              style={input}
            >
              <option value="">Todos os perfis</option>
              {perfisOrdenados.map((perfil) => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.nome}
                </option>
              ))}
            </select>

            <input type="date" value={filtroDataCriacao} onChange={(e) => setFiltroDataCriacao(e.target.value)} style={input} />

            <input
              type="date"
              value={filtroDataOcorrencia}
              onChange={(e) => setFiltroDataOcorrencia(e.target.value)}
              style={input}
            />

            <button onClick={limparFiltros} style={botaoSecundario}>
              Limpar
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "12px", color: "#555", fontSize: "14px" }}>
          Exibindo {registrosOrdenados.length} de {registros.length} ocorrência(s).
        </div>

        <div>
          {registrosOrdenados.length === 0 && <p>Nenhuma ocorrência encontrada.</p>}

          {registrosOrdenados.map((registro) => (
            <div key={registro.id} style={card}>
              <div>
                <strong>
                  {getNomeColaborador(registro.colaboradorId)} —{" "}
                  {getNomePerfilPorTipo(registro.tipoOcorrenciaId)}
                </strong>

                <div style={textoSecundario}>
                  Setor: {getNomeSetorPorColaborador(registro.colaboradorId)}
                </div>

                <div style={textoSecundario}>
                  Ocorrência: {getNomeTipoOcorrencia(registro.tipoOcorrenciaId)}
                </div>

                <div style={textoSecundario}>
                  Data da ocorrência: {formatarData(registro.dataOcorrencia)}
                </div>

                <div style={{ fontSize: "12px", color: "#aaa" }}>
                  Criado em: {formatarDataHora(registro.dataCriacao)}
                </div>

                {registro.evidencia && <div style={textoSecundario}>Evidência: {registro.evidencia}</div>}

                {registro.observacao && <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>Observação: {registro.observacao}</div>}
              </div>

              <button onClick={() => editarRegistro(registro)} style={editarBtn}>
                Editar
              </button>
            </div>
          ))}
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

const input: React.CSSProperties = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const botaoPrimario: React.CSSProperties = {
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
  gap: "16px",
};

const textoSecundario: React.CSSProperties = {
  fontSize: "12px",
  color: "#777",
  marginTop: "4px",
};