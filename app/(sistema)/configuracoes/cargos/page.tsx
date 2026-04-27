"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cargo = {
  id: string;
  nome: string;
  valor_base: number | null;
};

export default function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [nome, setNome] = useState("");
  const [valorBase, setValorBase] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarCargos();
  }, []);

  async function carregarCargos() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("cargos")
      .select("id, nome, valor_base")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar cargos:", error);
      setErro("Erro ao carregar cargos.");
    } else {
      setCargos(data || []);
    }

    setCarregando(false);
  }

  function converterValor(valor: string) {
    if (!valor) return 0;

    return Number(
      valor
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    );
  }

  function formatarMoeda(valor: number | null) {
    if (valor === null || valor === undefined) return "R$ 0,00";

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function limparFormulario() {
    setNome("");
    setValorBase("");
    setEditandoId(null);
    setErro("");
  }

  async function salvarCargo() {
    if (!nome.trim()) {
      setErro("Informe o nome do cargo.");
      return;
    }

    setSalvando(true);
    setErro("");

    const payload = {
      nome: nome.trim(),
      valor_base: converterValor(valorBase),
    };

    if (editandoId) {
      const { error } = await supabase
        .from("cargos")
        .update(payload)
        .eq("id", editandoId);

      if (error) {
        console.error("Erro ao atualizar cargo:", error);
        setErro("Erro ao atualizar cargo.");
        setSalvando(false);
        return;
      }
    } else {
      const { error } = await supabase.from("cargos").insert([payload]);

      if (error) {
        console.error("Erro ao inserir cargo:", error);
        setErro("Erro ao inserir cargo.");
        setSalvando(false);
        return;
      }
    }

    limparFormulario();
    setSalvando(false);
    carregarCargos();
  }

  function editarCargo(cargo: Cargo) {
    setNome(cargo.nome);
    setValorBase(
      cargo.valor_base ? String(cargo.valor_base).replace(".", ",") : ""
    );
    setEditandoId(cargo.id);
    setErro("");
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-[#3b2f22]">Cargos</h1>
        <p className="text-sm text-[#7a6a58]">
          Cadastre os cargos e seus respectivos valores base.
        </p>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            {editandoId ? "Editar cargo" : "Novo cargo"}
          </h2>

          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do cargo"
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[260px]"
            />

            <input
              type="text"
              value={valorBase}
              onChange={(e) => setValorBase(e.target.value)}
              placeholder="Valor base"
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm w-[260px]"
            />

            <button
              onClick={salvarCargo}
              disabled={salvando}
              className="px-5 py-3 bg-[#a07c3b] text-white rounded-xl font-semibold hover:bg-[#8b6b32] disabled:opacity-60"
            >
              {salvando
                ? "Salvando..."
                : editandoId
                ? "Salvar edição"
                : "Adicionar"}
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

          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3b2f22]">
              Cargos cadastrados
            </h2>

            <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
              {cargos.length} registros
            </span>
          </div>

          {carregando && (
            <p className="text-sm text-[#7a6a58]">Carregando...</p>
          )}

          {!carregando && cargos.length === 0 && (
            <p className="text-sm text-[#7a6a58]">
              Nenhum cargo cadastrado.
            </p>
          )}

          {!carregando && cargos.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-[#eadfce]">
              <table className="w-full border-collapse">
                <thead className="bg-[#f7f3ec]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">
                      Cargo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#3b2f22]">
                      Valor Base
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[#3b2f22]">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cargos.map((cargo) => (
                    <tr
                      key={cargo.id}
                      className="border-t border-[#eadfce] hover:bg-[#fbf8f3]"
                    >
                      <td className="px-4 py-3 text-sm text-[#3b2f22]">
                        {cargo.nome}
                      </td>

                      <td className="px-4 py-3 text-sm text-[#7a6a58]">
                        {formatarMoeda(cargo.valor_base)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => editarCargo(cargo)}
                          className="px-4 py-2 text-sm border border-[#d8c7ad] rounded-lg text-[#3b2f22] hover:bg-[#f7f3ec]"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}