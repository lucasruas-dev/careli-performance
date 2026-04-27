"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: string;
  nome: string;
};

type Ocorrencia = {
  id: string;
  nome: string;
  perfil_id: string | null;
};

export default function ConfiguracaoOcorrencias() {
  const [nome, setNome] = useState("");
  const [perfilId, setPerfilId] = useState("");

  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const perfisRes = await supabase
      .from("perfis_ocorrencia")
      .select("id, nome")
      .order("nome", { ascending: true });

    const ocorrenciasRes = await supabase
      .from("tipos_ocorrencia")
      .select("id, nome, perfil_id")
      .order("nome", { ascending: true });

    if (perfisRes.error) {
      console.error("Erro ao carregar perfil:", JSON.stringify(perfisRes.error, null, 2));
    } else {
      setPerfis(perfisRes.data || []);
    }

    if (ocorrenciasRes.error) {
      console.error("Erro ao carregar ocorrência:", JSON.stringify(ocorrenciasRes.error, null, 2));
    } else {
      setOcorrencias(ocorrenciasRes.data || []);
    }

    setCarregando(false);
  }

  function limparFormulario() {
    setNome("");
    setPerfilId("");
    setEditandoId(null);
  }

  function buscarNomePerfil(id: string | null) {
    if (!id) return "-";
    return perfis.find((perfil) => perfil.id === id)?.nome || "-";
  }

  async function salvarOcorrencia() {
    if (!nome.trim() || !perfilId) return;

    const payload = {
      nome: nome.trim(),
      perfil_id: perfilId,
    };

    if (editandoId) {
      const { error } = await supabase
        .from("tipos_ocorrencia")
        .update(payload)
        .eq("id", editandoId);

      if (error) {
        console.error("Erro ao atualizar ocorrência:", JSON.stringify(error, null, 2));
        return;
      }

      limparFormulario();
      carregarDados();
      return;
    }

    const { error } = await supabase
      .from("tipos_ocorrencia")
      .insert([payload]);

    if (error) {
      console.error("Erro ao inserir ocorrência:", JSON.stringify(error, null, 2));
      return;
    }

    limparFormulario();
    carregarDados();
  }

  function editarOcorrencia(ocorrencia: Ocorrencia) {
    setEditandoId(ocorrencia.id);
    setNome(ocorrencia.nome);
    setPerfilId(ocorrencia.perfil_id || "");
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-[#3b2f22]">
          Ocorrência
        </h1>
        <p className="text-sm text-[#7a6a58]">
          Cadastre os tipos de ocorrência utilizados no controle de performance.
        </p>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            {editandoId ? "Editar ocorrência" : "Nova ocorrência"}
          </h2>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              placeholder="Nome da ocorrência"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[260px]"
            />

            <select
              value={perfilId}
              onChange={(e) => setPerfilId(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[220px]"
            >
              <option value="">Selecione o perfil</option>
              {perfis.map((perfil) => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.nome}
                </option>
              ))}
            </select>

            <button
              onClick={salvarOcorrencia}
              className="px-5 py-3 bg-[#a07c3b] text-white rounded-xl font-semibold hover:bg-[#8b6b32]"
            >
              {editandoId ? "Salvar edição" : "Adicionar"}
            </button>

            {editandoId && (
              <button
                onClick={limparFormulario}
                className="px-5 py-3 bg-[#f7f3ec] text-[#3b2f22] rounded-xl border border-[#eadfce]"
              >
                Cancelar
              </button>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3b2f22]">
              Ocorrência cadastrada
            </h2>

            <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
              {ocorrencias.length} registros
            </span>
          </div>

          {carregando && (
            <p className="text-sm text-[#7a6a58]">Carregando...</p>
          )}

          {!carregando && ocorrencias.length === 0 && (
            <p className="text-sm text-[#7a6a58]">
              Nenhuma ocorrência cadastrada.
            </p>
          )}

          {!carregando && ocorrencias.length > 0 && (
            <div className="border border-[#eadfce] rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 bg-[#f7f3ec] px-4 py-3 text-sm font-semibold text-[#3b2f22]">
                <span>Ocorrência</span>
                <span>Perfil</span>
                <span className="text-right">Ações</span>
              </div>

              {ocorrencias.map((ocorrencia) => (
                <div
                  key={ocorrencia.id}
                  className="grid grid-cols-3 px-4 py-3 text-sm border-t border-[#eadfce] items-center hover:bg-[#faf7f2]"
                >
                  <span className="text-[#3b2f22]">
                    {ocorrencia.nome}
                  </span>

                  <span className="text-[#3b2f22]">
                    {buscarNomePerfil(ocorrencia.perfil_id)}
                  </span>

                  <div className="flex justify-end">
                    <button
                      onClick={() => editarOcorrencia(ocorrencia)}
                      className="px-4 py-2 text-sm border border-[#d8c7ad] rounded-lg text-[#3b2f22] hover:bg-[#f7f3ec]"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}