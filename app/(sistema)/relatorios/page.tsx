"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

export default function Relatorios() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroColaborador, setFiltroColaborador] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

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
      console.error("Erro ao carregar relatórios:", {
        departamentos: departamentosRes.error,
        colaboradores: colaboradoresRes.error,
        perfis: perfisRes.error,
        tipos: tiposRes.error,
        ocorrencias: ocorrenciasRes.error,
      });

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

  function buscarDepartamento(id: string | null | undefined) {
    if (!id) return undefined;
    return departamentos.find((d) => d.id === id);
  }

  function buscarTipo(id: string) {
    return tipos.find((t) => t.id === id);
  }

  function getPerfilIdDoTipo(tipo: TipoOcorrencia | undefined) {
    return tipo?.perfil_id || tipo?.perfil_ocorrencia_id || null;
  }

  function buscarPerfilPorTipo(tipoId: string) {
    const tipo = buscarTipo(tipoId);
    const perfilId = getPerfilIdDoTipo(tipo);

    if (!perfilId) return undefined;

    return perfis.find((p) => p.id === perfilId);
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

    const date = new Date(data);

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

  const dadosFiltrados = useMemo(() => {
    return ocorrencias.filter((o) => {
      const colaborador = buscarColaborador(o.colaborador_id);
      const departamento = buscarDepartamento(colaborador?.setor_id);
      const tipo = buscarTipo(o.tipo_ocorrencia_id);
      const perfil = buscarPerfilPorTipo(o.tipo_ocorrencia_id);

      if (filtroCodigo && !String(o.codigo || "").includes(filtroCodigo)) {
        return false;
      }

      if (filtroColaborador && o.colaborador_id !== filtroColaborador) {
        return false;
      }

      if (filtroDepartamento && departamento?.id !== filtroDepartamento) {
        return false;
      }

      if (filtroPerfil && perfil?.id !== filtroPerfil) {
        return false;
      }

      if (filtroTipo && o.tipo_ocorrencia_id !== filtroTipo) {
        return false;
      }

      if (filtroData && o.data_ocorrencia !== filtroData) {
        return false;
      }

      if (dataInicio && o.data_ocorrencia && o.data_ocorrencia < dataInicio) {
        return false;
      }

      if (dataFim && o.data_ocorrencia && o.data_ocorrencia > dataFim) {
        return false;
      }

      return true;
    });
  }, [
    ocorrencias,
    colaboradores,
    departamentos,
    tipos,
    perfis,
    filtroCodigo,
    filtroColaborador,
    filtroDepartamento,
    filtroPerfil,
    filtroTipo,
    filtroData,
    dataInicio,
    dataFim,
  ]);

  function agruparPor(
    lista: Ocorrencia[],
    callback: (item: Ocorrencia) => string
  ) {
    const mapa = new Map<string, number>();

    lista.forEach((item) => {
      const chave = callback(item) || "Não informado";
      mapa.set(chave, (mapa.get(chave) || 0) + 1);
    });

    return Array.from(mapa.entries())
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  const porDepartamento = agruparPor(dadosFiltrados, (o) => {
    const colaborador = buscarColaborador(o.colaborador_id);
    return buscarDepartamento(colaborador?.setor_id)?.nome || "Não informado";
  });

  const porPerfil = agruparPor(dadosFiltrados, (o) => {
    return buscarPerfilPorTipo(o.tipo_ocorrencia_id)?.nome || "Não informado";
  });

  const porTipo = agruparPor(dadosFiltrados, (o) => {
    return buscarTipo(o.tipo_ocorrencia_id)?.nome || "Não informado";
  });

  const porColaborador = agruparPor(dadosFiltrados, (o) => {
    return buscarColaborador(o.colaborador_id)?.nome || "Não informado";
  });

  const totalRegistros = dadosFiltrados.length;
  const totalDepartamentos = porDepartamento.filter((i) => i.nome !== "Não informado").length;
  const totalPerfis = porPerfil.filter((i) => i.nome !== "Não informado").length;
  const totalTipos = porTipo.filter((i) => i.nome !== "Não informado").length;
  const totalColaboradores = porColaborador.filter((i) => i.nome !== "Não informado").length;
  const totalComEvidencia = dadosFiltrados.filter((o) => o.evidencia_url).length;
  const totalSemEvidencia = dadosFiltrados.filter((o) => !o.evidencia_url).length;
  const maiorTipo = porTipo[0]?.nome || "-";

  function limparFiltros() {
    setFiltroCodigo("");
    setFiltroColaborador("");
    setFiltroDepartamento("");
    setFiltroPerfil("");
    setFiltroTipo("");
    setFiltroData("");
    setDataInicio("");
    setDataFim("");
  }

  function exportarExcel() {
    if (dadosFiltrados.length === 0) return;

    const linhas = dadosFiltrados.map((o) => {
      const colaborador = buscarColaborador(o.colaborador_id);
      const departamento = buscarDepartamento(colaborador?.setor_id);
      const tipo = buscarTipo(o.tipo_ocorrencia_id);
      const perfil = buscarPerfilPorTipo(o.tipo_ocorrencia_id);

      return {
        Código: o.codigo || "-",
        "Data Registro": formatarDataHora(o.created_at),
        "Data Ocorrência": formatarData(o.data_ocorrencia),
        Colaborador: colaborador?.nome || "-",
        Departamento: departamento?.nome || "-",
        Ocorrência: tipo?.nome || "-",
        Perfil: perfil?.nome || "-",
        Evidência: o.evidencia_url || "-",
        Observação: o.observacao || "-",
      };
    });

    const csv = [
      Object.keys(linhas[0]).join(";"),
      ...linhas.map((linha) =>
        Object.values(linha)
          .map((valor) => `"${String(valor).replaceAll('"', '""')}"`)
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_ocorrencias.csv";
    link.click();
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-[#3b2f22]">
          Relatórios
        </h1>
        <p className="text-sm text-[#7a6a58]">
          Dashboard consolidado das ocorrências registradas.
        </p>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            Filtros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
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

            <button
              onClick={limparFiltros}
              className="px-5 py-3 bg-[#f7f3ec] border border-[#eadfce] rounded-xl text-sm text-[#3b2f22]"
            >
              Limpar
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card titulo="Quantidade de registros" valor={totalRegistros} />
          <Card titulo="Departamentos com registros" valor={totalDepartamentos} />
          <Card titulo="Perfil com registros" valor={totalPerfis} />
          <Card titulo="Ocorrências registradas" valor={totalTipos} />
          <Card titulo="Colaboradores com registros" valor={totalColaboradores} />
          <Card titulo="Com evidência" valor={totalComEvidencia} />
          <Card titulo="Sem evidência" valor={totalSemEvidencia} />
          <Card titulo="Maior recorrência" valor={maiorTipo} destaqueTexto />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardLista titulo="Registros por departamento" lista={porDepartamento} />
          <CardLista titulo="Registros por perfil" lista={porPerfil} />
          <CardLista titulo="Registros por ocorrência" lista={porTipo} />
          <CardLista titulo="Registros por colaborador" lista={porColaborador} />
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3b2f22]">
              Visão analítica das ocorrências
            </h2>

            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 px-4 py-2 border border-[#d8c7ad] rounded-lg hover:bg-[#f7f3ec]"
            >
              <Image
                src="/logo_excel.png"
                alt="Exportar"
                width={18}
                height={18}
              />
              <span className="text-sm">Exportar</span>
            </button>
          </div>

          {carregando && (
            <p className="text-sm text-[#7a6a58]">Carregando...</p>
          )}

          {!carregando && dadosFiltrados.length === 0 && (
            <p className="text-sm text-[#7a6a58]">
              Nenhum dado encontrado.
            </p>
          )}

          {!carregando && dadosFiltrados.length > 0 && (
            <div className="overflow-x-auto border border-[#eadfce] rounded-xl">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead className="bg-[#f7f3ec]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Data registro</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Data ocorrência</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Colaborador</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Departamento</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Ocorrência</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Perfil</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Evidência</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">Observação</th>
                  </tr>
                </thead>

                <tbody>
                  {dadosFiltrados.map((o) => {
                    const colaborador = buscarColaborador(o.colaborador_id);
                    const departamento = buscarDepartamento(colaborador?.setor_id);
                    const tipo = buscarTipo(o.tipo_ocorrencia_id);
                    const perfil = buscarPerfilPorTipo(o.tipo_ocorrencia_id);

                    return (
                      <tr key={o.id} className="border-t border-[#eadfce] hover:bg-[#faf7f2]">
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">{o.codigo || "-"}</td>
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">{formatarDataHora(o.created_at)}</td>
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">{formatarData(o.data_ocorrencia)}</td>
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">{colaborador?.nome || "-"}</td>
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">{departamento?.nome || "-"}</td>
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">{tipo?.nome || "-"}</td>
                        <td className="px-4 py-3 text-sm text-[#3b2f22]">{perfil?.nome || "-"}</td>

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

                        <td className="px-4 py-3 text-sm text-[#3b2f22] max-w-[240px] truncate">
                          {o.observacao || "-"}
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
    </main>
  );
}

function Card({
  titulo,
  valor,
  destaqueTexto = false,
}: {
  titulo: string;
  valor: any;
  destaqueTexto?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#eadfce] shadow-sm">
      <p className="text-sm text-[#7a6a58]">{titulo}</p>
      <p
        className={`font-bold text-[#3b2f22] mt-2 ${
          destaqueTexto ? "text-base truncate" : "text-2xl"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

function CardLista({
  titulo,
  lista,
}: {
  titulo: string;
  lista: { nome: string; quantidade: number }[];
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#eadfce] shadow-sm">
      <h3 className="text-sm font-semibold text-[#3b2f22] mb-3">
        {titulo}
      </h3>

      {lista.length === 0 ? (
        <p className="text-sm text-[#7a6a58]">Sem dados</p>
      ) : (
        <div className="flex flex-col gap-2">
          {lista.map((item) => (
            <div
              key={item.nome}
              className="flex justify-between items-center border border-[#eadfce] rounded-xl px-3 py-2"
            >
              <span className="text-sm text-[#3b2f22] truncate">
                {item.nome}
              </span>

              <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
                {item.quantidade}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}