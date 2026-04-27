"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: string;
  nome: string;
};

export default function PerfilOcorrencia() {
  const [nome, setNome] = useState("");
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregarPerfis() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("perfis_ocorrencia")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar perfil:", error);
    } else {
      setPerfis(data || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarPerfis();
  }, []);

  function limparFormulario() {
    setNome("");
    setEditandoId(null);
  }

  async function salvarPerfil() {
    if (!nome.trim()) return;

    if (editandoId) {
      const { error } = await supabase
        .from("perfis_ocorrencia")
        .update({ nome: nome.trim() })
        .eq("id", editandoId);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        return;
      }

      limparFormulario();
      carregarPerfis();
      return;
    }

    const { error } = await supabase
      .from("perfis_ocorrencia")
      .insert([{ nome: nome.trim() }]);

    if (error) {
      console.error("Erro ao inserir perfil:", error);
      return;
    }

    limparFormulario();
    carregarPerfis();
  }

  function editarPerfil(perfil: Perfil) {
    setEditandoId(perfil.id);
    setNome(perfil.nome);
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-[#3b2f22]">
          Perfil de Ocorrência
        </h1>
        <p className="text-sm text-[#7a6a58]">
          Classifique os tipos de ocorrência por perfil (ex: Cultura, Pontualidade).
        </p>

        {/* FORM */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            {editandoId ? "Editar perfil" : "Novo perfil"}
          </h2>

          <div className="flex flex-wrap gap-3 items-center">

            <input
              placeholder="Nome do perfil"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[280px]"
            />

            <button
              onClick={salvarPerfil}
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

        {/* LISTAGEM */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3b2f22]">
              Perfil cadastrado
            </h2>

            <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
              {perfis.length} registros
            </span>
          </div>

          {carregando && (
            <p className="text-sm text-[#7a6a58]">Carregando...</p>
          )}

          {!carregando && perfis.length === 0 && (
            <p className="text-sm text-[#7a6a58]">
              Nenhum perfil cadastrado.
            </p>
          )}

          {!carregando && perfis.length > 0 && (
            <div className="border border-[#eadfce] rounded-xl overflow-hidden">

              {/* HEADER */}
              <div className="grid grid-cols-2 bg-[#f7f3ec] px-4 py-3 text-sm font-semibold text-[#3b2f22]">
                <span>Perfil</span>
                <span className="text-right">Ações</span>
              </div>

              {/* LINHAS */}
              {perfis.map((perfil) => (
                <div
                  key={perfil.id}
                  className="grid grid-cols-2 px-4 py-3 text-sm border-t border-[#eadfce] items-center hover:bg-[#faf7f2]"
                >
                  <span className="text-[#3b2f22]">{perfil.nome}</span>

                  <div className="flex justify-end">
                    <button
                      onClick={() => editarPerfil(perfil)}
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