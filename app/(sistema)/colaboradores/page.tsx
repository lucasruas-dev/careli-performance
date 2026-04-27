"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Departamento = {
  id: string;
  nome: string;
};

type Cargo = {
  id: string;
  nome: string;
  valor_base: number;
};

type Colaborador = {
  id: string;
  nome: string;
  setor_id: string;
  cargo_id: string;
  setores?: { nome: string }[] | { nome: string } | null;
  cargos?: { nome: string; valor_base: number }[] | { nome: string; valor_base: number } | null;
};

export default function Colaboradores() {
  const [nome, setNome] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [cargoId, setCargoId] = useState("");

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
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
    const { data, error } = await supabase
      .from("setores")
      .select("id, nome")
      .order("nome");

    if (error) {
      console.error("Erro departamentos:", error);
      return;
    }

    setDepartamentos(data || []);
  }

  async function carregarCargos() {
    const { data, error } = await supabase
      .from("cargos")
      .select("id, nome, valor_base")
      .order("nome");

    if (error) {
      console.error("Erro cargos:", error);
      return;
    }

    setCargos(data || []);
  }

  async function carregarColaboradores() {
    const { data, error } = await supabase
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

    if (error) {
      console.error("Erro colaboradores:", error);
      return;
    }

    setColaboradores((data || []) as Colaborador[]);
  }

  function limpar() {
    setNome("");
    setDepartamentoId("");
    setCargoId("");
    setEditandoId(null);
  }

  async function salvar() {
    if (!nome.trim() || !departamentoId || !cargoId) return;

    const payload = {
      nome: nome.trim(),
      setor_id: departamentoId,
      cargo_id: cargoId,
    };

    if (editandoId) {
      const { error } = await supabase
        .from("colaboradores")
        .update(payload)
        .eq("id", editandoId);

      if (error) {
        console.error("Erro ao atualizar colaborador:", error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("colaboradores")
        .insert([payload]);

      if (error) {
        console.error("Erro ao inserir colaborador:", error);
        return;
      }
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

  function nomeDepartamento(col: Colaborador) {
    if (Array.isArray(col.setores)) {
      return col.setores[0]?.nome || "-";
    }

    return col.setores?.nome || "-";
  }

  function nomeCargo(col: Colaborador) {
    if (Array.isArray(col.cargos)) {
      return col.cargos[0]?.nome || "-";
    }

    return col.cargos?.nome || "-";
  }

  function valorBaseCargo(col: Colaborador) {
    if (Array.isArray(col.cargos)) {
      return col.cargos[0]?.valor_base || 0;
    }

    return col.cargos?.valor_base || 0;
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-2xl font-bold text-[#3b2f22]">
          Colaborador
        </h1>
        <p className="text-sm text-[#7a6a58]">
          Cadastro e gestão da equipe.
        </p>

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
              value={cargoId}
              onChange={(e) => setCargoId(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[180px]"
            >
              <option value="">Cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nome}
                </option>
              ))}
            </select>

            <select
              value={departamentoId}
              onChange={(e) => setDepartamentoId(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[220px]"
            >
              <option value="">Departamento</option>
              {departamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>
                  {departamento.nome}
                </option>
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
              <div className="grid grid-cols-5 bg-[#f7f3ec] px-4 py-3 text-sm font-semibold text-[#3b2f22]">
                <span>Nome</span>
                <span>Cargo</span>
                <span>Departamento</span>
                <span>Valor Base</span>
                <span className="text-right">Ações</span>
              </div>

              {colaboradores.map((col) => (
                <div
                  key={col.id}
                  className="grid grid-cols-5 px-4 py-3 text-sm border-t border-[#eadfce] items-center hover:bg-[#faf7f2]"
                >
                  <span className="text-[#3b2f22]">{col.nome}</span>

                  <span className="text-[#3b2f22]">
                    {nomeCargo(col)}
                  </span>

                  <span className="text-[#3b2f22]">
                    {nomeDepartamento(col)}
                  </span>

                  <span className="text-[#3b2f22]">
                    {formatarMoeda(valorBaseCargo(col))}
                  </span>

                  <div className="flex justify-end">
                    <button
                      onClick={() => editar(col)}
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