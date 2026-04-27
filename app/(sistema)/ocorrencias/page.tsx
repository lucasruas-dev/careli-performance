"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Departamento = {
  id: string;
  nome: string;
};

type Colaborador = {
  id: string;
  nome: string;
  setor_id: string | null;
};

type Perfil = {
  id: string;
  nome: string;
};

type TipoOcorrencia = {
  id: string;
  nome: string;
  perfil_id?: string | null;
  perfil_ocorrencia_id?: string | null;
};

type Ocorrencia = {
  id: string;
  codigo: number | null;
  colaborador_id: string;
  tipo_ocorrencia_id: string;
  observacao: string | null;
  data_ocorrencia: string | null;
  evidencia_url: string | null;
  evidencia_nome: string | null;
  evidencia_tipo: string | null;
  created_at: string;
};

export default function OcorrenciasPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  const [colaboradorId, setColaboradorId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [observacao, setObservacao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroColaborador, setFiltroColaborador] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const [observacaoAberta, setObservacaoAberta] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [
      departamentosRes,
      colaboradoresRes,
      perfisRes,
      tiposRes,
      ocorrenciasRes,
    ] = await Promise.all([
      supabase.from("setores").select("id, nome").order("nome"),
      supabase.from("colaboradores").select("id, nome, setor_id").order("nome"),
      supabase.from("perfis_ocorrencia").select("id, nome").order("nome"),
      supabase.from("tipos_ocorrencia").select("*").order("nome"),
      supabase
        .from("ocorrencias")
        .select(`
          id,
          codigo,
          colaborador_id,
          tipo_ocorrencia_id,
          observacao,
          data_ocorrencia,
          evidencia_url,
          evidencia_nome,
          evidencia_tipo,
          created_at
        `)
        .order("created_at", { ascending: false }),
    ]);

    if (
      departamentosRes.error ||
      colaboradoresRes.error ||
      perfisRes.error ||
      tiposRes.error ||
      ocorrenciasRes.error
    ) {
      console.error("Erro ao carregar dados:", {
        departamentos: departamentosRes.error,
        colaboradores: colaboradoresRes.error,
        perfis: perfisRes.error,
        tipos: tiposRes.error,
        ocorrencias: ocorrenciasRes.error,
      });

      setErro("Erro ao carregar dados.");
      setCarregando(false);
      return;
    }

    setDepartamentos(departamentosRes.data || []);
    setColaboradores(colaboradoresRes.data || []);
    setPerfis(perfisRes.data || []);
    setTipos(tiposRes.data || []);
    setOcorrencias(ocorrenciasRes.data || []);

    setCarregando(false);
  }

  function buscarColaborador(id: string) {
    return colaboradores.find((c) => c.id === id);
  }

  function buscarTipo(id: string) {
    return tipos.find((t) => t.id === id);
  }

  function buscarNomeDepartamento(id: string | null) {
    if (!id) return "-";
    return departamentos.find((d) => d.id === id)?.nome || "-";
  }

  function getPerfilIdDoTipo(tipo: TipoOcorrencia | undefined) {
    return tipo?.perfil_id || tipo?.perfil_ocorrencia_id || null;
  }

  function buscarNomePerfilPorTipo(tipoIdAtual: string) {
    const tipo = buscarTipo(tipoIdAtual);
    const perfilId = getPerfilIdDoTipo(tipo);

    if (!perfilId) return "-";

    return perfis.find((p) => p.id === perfilId)?.nome || "-";
  }

  function formatarData(data: string | null) {
    if (!data) return "-";

    const date = new Date(`${data}T00:00:00`);

    return date.toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
  }

  function formatarDataHora(data: string | null) {
  if (!data) return "-";

  const dataNormalizada =
    data.endsWith("Z") || data.includes("-03:00")
      ? data
      : `${data}Z`;

  const date = new Date(dataNormalizada);

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

  async function uploadArquivo(file: File) {
    const extensao = file.name.split(".").pop()?.toLowerCase() || "arquivo";

    const nomeSeguro = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[()]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .toLowerCase();

    const caminhoArquivo = `ocorrencias/${Date.now()}-${crypto.randomUUID()}-${nomeSeguro}`;

    const { data, error } = await supabase.storage
      .from("evidencias")
      .upload(caminhoArquivo, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || `application/${extensao}`,
      });

    if (error) {
      console.error("Erro detalhado upload:", JSON.stringify(error, null, 2));
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("evidencias")
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      nome: file.name,
      tipo: file.type,
    };
  }

  function limparFormulario() {
    setColaboradorId("");
    setTipoId("");
    setDataOcorrencia("");
    setObservacao("");
    setArquivo(null);
    setEditandoId(null);
    setErro("");
  }

  function editarOcorrencia(ocorrencia: Ocorrencia) {
    setEditandoId(ocorrencia.id);
    setColaboradorId(ocorrencia.colaborador_id);
    setTipoId(ocorrencia.tipo_ocorrencia_id);
    setDataOcorrencia(ocorrencia.data_ocorrencia || "");
    setObservacao(ocorrencia.observacao || "");
    setArquivo(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvarOcorrencia(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!colaboradorId || !tipoId) {
      setErro("Selecione o colaborador e a ocorrência.");
      return;
    }

    setSalvando(true);
    setErro("");

    let evidenciaData: {
      url: string;
      nome: string;
      tipo: string;
    } | null = null;

    if (arquivo) {
      evidenciaData = await uploadArquivo(arquivo);

      if (!evidenciaData) {
        setErro("Erro ao enviar evidência.");
        setSalvando(false);
        return;
      }
    }

    const payload: any = {
      colaborador_id: colaboradorId,
      tipo_ocorrencia_id: tipoId,
      observacao: observacao.trim() || null,
      data_ocorrencia:
        dataOcorrencia || new Date().toISOString().split("T")[0],
    };

    if (evidenciaData) {
      payload.evidencia_url = evidenciaData.url;
      payload.evidencia_nome = evidenciaData.nome;
      payload.evidencia_tipo = evidenciaData.tipo;
    }

    const { error } = editandoId
      ? await supabase
          .from("ocorrencias")
          .update(payload)
          .eq("id", editandoId)
      : await supabase.from("ocorrencias").insert([payload]);

    if (error) {
      console.error("Erro ao salvar ocorrência:", JSON.stringify(error, null, 2));
      setErro("Erro ao salvar ocorrência.");
      setSalvando(false);
      return;
    }

    limparFormulario();
    setSalvando(false);

    await carregarDados();
  }

  const ocorrenciasFiltradas = useMemo(() => {
    return ocorrencias.filter((o) => {
      const colaborador = buscarColaborador(o.colaborador_id);
      const tipo = buscarTipo(o.tipo_ocorrencia_id);
      const perfilId = getPerfilIdDoTipo(tipo);

      if (filtroCodigo && !String(o.codigo || "").includes(filtroCodigo)) {
        return false;
      }

      if (filtroColaborador && o.colaborador_id !== filtroColaborador) {
        return false;
      }

      if (filtroDepartamento && colaborador?.setor_id !== filtroDepartamento) {
        return false;
      }

      if (filtroPerfil && perfilId !== filtroPerfil) {
        return false;
      }

      if (filtroTipo && o.tipo_ocorrencia_id !== filtroTipo) {
        return false;
      }

      if (filtroData && o.data_ocorrencia !== filtroData) {
        return false;
      }

      return true;
    });
  }, [
    ocorrencias,
    colaboradores,
    tipos,
    filtroCodigo,
    filtroColaborador,
    filtroDepartamento,
    filtroPerfil,
    filtroTipo,
    filtroData,
  ]);

  function limparFiltros() {
    setFiltroCodigo("");
    setFiltroColaborador("");
    setFiltroDepartamento("");
    setFiltroPerfil("");
    setFiltroTipo("");
    setFiltroData("");
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-[#3b2f22]">
          Lançamentos
        </h1>
        <p className="text-sm text-[#7a6a58]">
          Lançamento e gestão das ocorrências da operação.
        </p>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            {editandoId ? "Editar ocorrência" : "Nova ocorrência"}
          </h2>

          <form onSubmit={salvarOcorrencia}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={colaboradorId}
                onChange={(e) => setColaboradorId(e.target.value)}
                className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
              >
                <option value="">Colaborador</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>

              <select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
              >
                <option value="">Ocorrência</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dataOcorrencia}
                onChange={(e) => setDataOcorrencia(e.target.value)}
                className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
              />

              <label className="flex items-center justify-center border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-[#f7f3ec]">
                Evidência
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <input
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Observação"
                className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 px-5 py-3 bg-[#a07c3b] text-white rounded-xl font-semibold hover:bg-[#8b6b32] disabled:opacity-60"
                >
                  {salvando
                    ? "Salvando..."
                    : editandoId
                    ? "Salvar edição"
                    : "Adicionar"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    onClick={limparFormulario}
                    className="px-5 py-3 bg-[#f7f3ec] border border-[#eadfce] rounded-xl text-sm text-[#3b2f22]"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>

          {arquivo && (
            <p className="mt-4 text-sm text-[#7a6a58]">
              Evidência selecionada:{" "}
              <strong className="text-[#3b2f22]">{arquivo.name}</strong>
            </p>
          )}

          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            Filtros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              placeholder="ID"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            />

            <select
              value={filtroColaborador}
              onChange={(e) => setFiltroColaborador(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Colaborador</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Departamento</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Perfil</option>
              {perfis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Ocorrência</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <button
            onClick={limparFiltros}
            className="mt-4 px-5 py-3 bg-[#f7f3ec] border border-[#eadfce] rounded-xl text-sm text-[#3b2f22]"
          >
            Limpar filtros
          </button>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3b2f22]">
              Ocorrência cadastrada
            </h2>

            <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
              {ocorrenciasFiltradas.length} registros
            </span>
          </div>

          {carregando && (
            <p className="text-sm text-[#7a6a58]">Carregando...</p>
          )}

          {!carregando && ocorrenciasFiltradas.length === 0 && (
            <p className="text-sm text-[#7a6a58]">
              Nenhuma ocorrência cadastrada.
            </p>
          )}

          {!carregando && ocorrenciasFiltradas.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-[#eadfce]">
              <table className="w-full min-w-[1150px] border-collapse">
                <thead className="bg-[#f7f3ec]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Data registro</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Data ocorrência</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Colaborador</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Departamento</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Ocorrência</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Perfil</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Evidência</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[#3b2f22]">Observação</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[#3b2f22]">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {ocorrenciasFiltradas.map((o) => {
                    const colaborador = buscarColaborador(o.colaborador_id);
                    const tipo = buscarTipo(o.tipo_ocorrencia_id);

                    return (
                      <tr
                        key={o.id}
                        className="border-t border-[#eadfce] hover:bg-[#fbf8f3]"
                      >
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">
                          {o.codigo || "-"}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#3b2f22]">
                          {formatarDataHora(o.created_at)}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#3b2f22]">
                          {formatarData(o.data_ocorrencia)}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#3b2f22]">
                          {colaborador?.nome || "-"}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#3b2f22]">
                          {buscarNomeDepartamento(colaborador?.setor_id || null)}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#3b2f22]">
                          {tipo?.nome || "-"}
                        </td>

                        <td className="px-4 py-3 text-sm text-[#3b2f22]">
                          {buscarNomePerfilPorTipo(o.tipo_ocorrencia_id)}
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {o.evidencia_url ? (
                            <a
                              href={o.evidencia_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#a07c3b] font-semibold hover:underline"
                            >
                              Abrir
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() =>
                              setObservacaoAberta(
                                o.observacao || "Sem observação registrada."
                              )
                            }
                            className="px-3 py-2 text-sm border border-[#d8c7ad] rounded-lg text-[#3b2f22] hover:bg-[#f7f3ec]"
                          >
                            Ver
                          </button>
                        </td>

                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() => editarOcorrencia(o)}
                            className="px-4 py-2 text-sm border border-[#d8c7ad] rounded-lg text-[#3b2f22] hover:bg-[#f7f3ec]"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {observacaoAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setObservacaoAberta(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-[#eadfce] shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#3b2f22]">
                Observação
              </h3>

              <button
                onClick={() => setObservacaoAberta(null)}
                className="text-sm text-[#7a6a58] hover:text-[#3b2f22]"
              >
                Fechar
              </button>
            </div>

            <p className="text-sm text-[#3b2f22] whitespace-pre-wrap leading-6">
              {observacaoAberta}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}