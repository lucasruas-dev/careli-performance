"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Departamento = {
  id: string;
  nome: string;
};

export default function Departamentos() {
  const [nome, setNome] = useState("");
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregarDepartamentos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("setores") // mantém a tabela por enquanto
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar departamento:", error);
    } else {
      setDepartamentos(data || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  function limparFormulario() {
    setNome("");
    setEditandoId(null);
  }

  async function salvarDepartamento() {
    if (!nome.trim()) return;

    if (editandoId) {
      const { error } = await supabase
        .from("setores")
        .update({ nome: nome.trim() })
        .eq("id", editandoId);

      if (error) {
        console.error("Erro ao atualizar departamento:", error);
        return;
      }

      limparFormulario();
      carregarDepartamentos();
      return;
    }

    const { error } = await supabase
      .from("setores")
      .insert([{ nome: nome.trim() }]);

    if (error) {
      console.error("Erro ao inserir departamento:", error);
      return;
    }

    limparFormulario();
    carregarDepartamentos();
  }

  function editarDepartamento(departamento: Departamento) {
    setEditandoId(departamento.id);
    setNome(departamento.nome);
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-[#3b2f22]">
          Departamento
        </h1>
        <p className="text-sm text-[#7a6a58]">
          Cadastro de departamentos da operação.
        </p>

        {/* FORM */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            {editandoId ? "Editar departamento" : "Novo departamento"}
          </h2>

          <div className="flex flex-wrap gap-3 items-center">

            <input
              placeholder="Nome do departamento"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[280px]"
            />

            <button
              onClick={salvarDepartamento}
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
              Departamento cadastrado
            </h2>

            <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
              {departamentos.length} registros
            </span>
          </div>

          {carregando && (
            <p className="text-sm text-[#7a6a58]">Carregando...</p>
          )}

          {!carregando && departamentos.length === 0 && (
            <p className="text-sm text-[#7a6a58]">
              Nenhum departamento cadastrado.
            </p>
          )}

          {!carregando && departamentos.length > 0 && (
            <div className="border border-[#eadfce] rounded-xl overflow-hidden">

              {/* HEADER */}
              <div className="grid grid-cols-2 bg-[#f7f3ec] px-4 py-3 text-sm font-semibold text-[#3b2f22]">
                <span>Departamento</span>
                <span className="text-right">Ações</span>
              </div>

              {/* LINHAS */}
              {departamentos.map((dep) => (
                <div
                  key={dep.id}
                  className="grid grid-cols-2 px-4 py-3 text-sm border-t border-[#eadfce] items-center hover:bg-[#faf7f2]"
                >
                  <span className="text-[#3b2f22]">{dep.nome}</span>

                  <div className="flex justify-end">
                    <button
                      onClick={() => editarDepartamento(dep)}
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