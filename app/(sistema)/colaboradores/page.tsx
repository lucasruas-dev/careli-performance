"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Colaborador = {
  id: string;
  nome: string;
  setor_id: string;
  cargo_id: string;
  setores?: { nome: string };
  cargos?: { nome: string; valor_base: number };
};

export default function Colaboradores() {
  const [nome, setNome] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [cargoId, setCargoId] = useState("");

  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    await Promise.all([
      carregarDepartamentos(),
      carregarCargos(),
      carregarColaboradores(),
    ]);
  }

  async function carregarDepartamentos() {
    const { data } = await supabase.from("setores").select("*");
    setDepartamentos(data || []);
  }

  async function carregarCargos() {
    const { data } = await supabase.from("cargos").select("*");
    setCargos(data || []);
  }

  async function carregarColaboradores() {
    const { data } = await supabase
      .from("colaboradores")
      .select(`
        id,
        nome,
        setor_id,
        cargo_id,
        setores(nome),
        cargos(nome, valor_base)
      `)
      .order("nome");

    setColaboradores(data || []);
  }

  function limpar() {
    setNome("");
    setDepartamentoId("");
    setCargoId("");
    setEditandoId(null);
  }

  async function salvar() {
    if (!nome || !departamentoId || !cargoId) return;

    const payload = {
      nome,
      setor_id: departamentoId,
      cargo_id: cargoId,
    };

    if (editandoId) {
      await supabase.from("colaboradores").update(payload).eq("id", editandoId);
    } else {
      await supabase.from("colaboradores").insert([payload]);
    }

    limpar();
    carregarColaboradores();
  }

  function editar(col: Colaborador) {
    setEditandoId(col.id);
    setNome(col.nome);
    setDepartamentoId(col.setor_id);
    setCargoId(col.cargo_id);
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-[#3b2f22]">
          Colaborador
        </h1>
        <p className="text-sm text-[#7a6a58]">
          Cadastro e gestão da equipe.
        </p>

        {/* FORM */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            {editandoId ? "Editar colaborador" : "Novo colaborador"}
          </h2>

          <div className="flex flex-wrap gap-3 items-center">

            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[260px]"
            />

            <select
              value={departamentoId}
              onChange={(e) => setDepartamentoId(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Departamento</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>

            <select
              value={cargoId}
              onChange={(e) => setCargoId(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm"
            >
              <option value="">Cargo</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>

            <button
              onClick={salvar}
              className="px-5 py-3 bg-[#a07c3b] text-white rounded-xl font-semibold hover:bg-[#8b6b32]"
            >
              {editandoId ? "Salvar edição" : "Adicionar"}
            </button>

            {editandoId && (
              <button
                onClick={limpar}
                className="px-5 py-3 bg-[#f7f3ec] border border-[#eadfce] rounded-xl"
              >
                Cancelar
              </button>
            )}

          </div>
        </section>

        {/* LISTAGEM PADRÃO */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3b2f22]">
              Colaborador cadastrado
            </h2>

            <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
              {colaboradores.length} registros
            </span>
          </div>

          {colaboradores.length === 0 && (
            <p className="text-sm text-[#7a6a58]">
              Nenhum colaborador cadastrado.
            </p>
          )}

          {colaboradores.length > 0 && (
            <div className="border border-[#eadfce] rounded-xl overflow-hidden">

              {/* HEADER */}
              <div className="grid grid-cols-5 bg-[#f7f3ec] px-4 py-3 text-sm font-semibold text-[#3b2f22]">
                <span>Nome</span>
                <span>Cargo</span>
                <span>Departamento</span>
                <span>Valor</span>
                <span className="text-right">Ações</span>
              </div>

              {/* LINHAS */}
              {colaboradores.map((col) => (
                <div
                  key={col.id}
                  className="grid grid-cols-5 px-4 py-3 text-sm border-t border-[#eadfce] items-center hover:bg-[#faf7f2]"
                >
                  <span>{col.nome}</span>
                  <span>{col.cargos?.nome}</span>
                  <span>{col.setores?.nome}</span>
                  <span>{formatarMoeda(col.cargos?.valor_base || 0)}</span>

                  <div className="flex justify-end">
                    <button
                      onClick={() => editar(col)}
                      className="px-4 py-2 text-sm border border-[#d8c7ad] rounded-lg hover:bg-[#f7f3ec]"
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