"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PerfilUsuario = "admin" | "lider" | "usuario";

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
  email: string | null;
  user_id: string | null;
  setor_id: string;
  cargo_id: string;
  perfil?: PerfilUsuario | "";
  ativo?: boolean;
  setores?: { nome: string } | { nome: string }[] | null;
  cargos?:
    | { nome: string; valor_base: number }
    | { nome: string; valor_base: number }[]
    | null;
};

export default function Colaboradores() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [perfil, setPerfil] = useState<PerfilUsuario>("usuario");

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoUserId, setEditandoUserId] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    setErro("");

    await carregarDepartamentos();
    await carregarCargos();
    await carregarColaboradores();

    setCarregando(false);
  }

  async function carregarDepartamentos() {
    const { data, error } = await supabase
      .from("setores")
      .select("id, nome")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar departamentos:", error);
      setErro("Erro ao carregar departamentos.");
      return;
    }

    setDepartamentos(data || []);
  }

  async function carregarCargos() {
    const { data, error } = await supabase
      .from("cargos")
      .select("id, nome, valor_base")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar cargos:", error);
      setErro("Erro ao carregar cargos.");
      return;
    }

    setCargos(data || []);
  }

  async function carregarColaboradores() {
    const response = await fetch("/api/colaboradores-auth", {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Erro ao carregar colaboradores:", result);
      setErro(result?.error || "Erro ao carregar colaboradores.");
      return;
    }

    setColaboradores(result || []);
  }

  function limparFormulario() {
    setNome("");
    setEmail("");
    setSenha("");
    setCargoId("");
    setDepartamentoId("");
    setPerfil("usuario");
    setEditandoId(null);
    setEditandoUserId(null);
    setErro("");
    setSucesso("");
  }

  async function salvar() {
    setErro("");
    setSucesso("");

    if (!nome.trim()) {
      setErro("Informe o nome do colaborador.");
      return;
    }

    if (!cargoId) {
      setErro("Selecione o cargo.");
      return;
    }

    if (!departamentoId) {
      setErro("Selecione o departamento.");
      return;
    }

    if (email.trim() && !editandoUserId && !senha.trim()) {
      setErro("Para criar acesso, informe uma senha.");
      return;
    }

    setSalvando(true);

    const response = await fetch("/api/colaboradores-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editandoId,
        user_id: editandoUserId,
        nome,
        email,
        senha,
        setor_id: departamentoId,
        cargo_id: cargoId,
        perfil,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Erro ao salvar colaborador:", result);
      setErro(result?.error || result?.details || "Erro ao salvar colaborador.");
      setSalvando(false);
      return;
    }

    setSucesso(
      editandoId
        ? "Colaborador atualizado com sucesso."
        : "Colaborador cadastrado com sucesso."
    );

    limparFormulario();
    await carregarColaboradores();

    setSalvando(false);
  }

  function editar(colaborador: Colaborador) {
    setEditandoId(colaborador.id);
    setEditandoUserId(colaborador.user_id);
    setNome(colaborador.nome || "");
    setEmail(colaborador.email || "");
    setSenha("");
    setCargoId(colaborador.cargo_id || "");
    setDepartamentoId(colaborador.setor_id || "");
    setPerfil((colaborador.perfil || "usuario") as PerfilUsuario);
    setErro("");
    setSucesso("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nomeCargo(colaborador: Colaborador) {
    if (Array.isArray(colaborador.cargos)) {
      return colaborador.cargos[0]?.nome || "-";
    }

    return colaborador.cargos?.nome || "-";
  }

  function nomeDepartamento(colaborador: Colaborador) {
    if (Array.isArray(colaborador.setores)) {
      return colaborador.setores[0]?.nome || "-";
    }

    return colaborador.setores?.nome || "-";
  }

  function valorBaseCargo(colaborador: Colaborador) {
    if (Array.isArray(colaborador.cargos)) {
      return colaborador.cargos[0]?.valor_base || 0;
    }

    return colaborador.cargos?.valor_base || 0;
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
  }

  function labelPerfil(valor?: string) {
    if (valor === "admin") return "Administrador";
    if (valor === "lider") return "Líder";
    if (valor === "usuario") return "Usuário";
    return "Sem acesso";
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-[#3b2f22]">Colaborador</h1>

        <p className="text-sm text-[#7a6a58]">
          Cadastro da equipe, vínculo de acesso e permissões do sistema.
        </p>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <h2 className="text-lg font-semibold text-[#3b2f22] mb-4">
            {editandoId ? "Editar colaborador" : "Novo colaborador"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b]"
            />

            <input
              placeholder="E-mail de acesso"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b]"
            />

            <input
              placeholder={
                editandoId
                  ? "Nova senha (opcional)"
                  : "Senha de acesso (opcional)"
              }
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b]"
            />

            <select
              value={cargoId}
              onChange={(e) => setCargoId(e.target.value)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b] bg-white"
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
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b] bg-white"
            >
              <option value="">Departamento</option>
              {departamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>
                  {departamento.nome}
                </option>
              ))}
            </select>

            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
              className="border border-[#d8c7ad] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b] bg-white"
            >
              <option value="admin">Administrador</option>
              <option value="lider">Líder</option>
              <option value="usuario">Usuário</option>
            </select>
          </div>

          {erro && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </p>
          )}

          {sucesso && (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {sucesso}
            </p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={salvar}
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
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-[#eadfce]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3b2f22]">
              Colaboradores cadastrados
            </h2>

            <span className="text-xs bg-[#f0e6d6] px-3 py-1 rounded-full text-[#7a5b24] font-semibold">
              {colaboradores.length} registros
            </span>
          </div>

          <div className="overflow-x-auto border border-[#eadfce] rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#f7f3ec] text-[#3b2f22]">
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">E-mail</th>
                  <th className="px-4 py-3 text-left">Cargo</th>
                  <th className="px-4 py-3 text-left">Departamento</th>
                  <th className="px-4 py-3 text-left">Valor Base</th>
                  <th className="px-4 py-3 text-left">Função</th>
                  <th className="px-4 py-3 text-left">Acesso</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-[#7a6a58]"
                    >
                      Carregando colaboradores...
                    </td>
                  </tr>
                ) : colaboradores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-[#7a6a58]"
                    >
                      Nenhum colaborador cadastrado.
                    </td>
                  </tr>
                ) : (
                  colaboradores.map((colaborador) => (
                    <tr
                      key={colaborador.id}
                      className="border-t border-[#eadfce] hover:bg-[#faf7f2]"
                    >
                      <td className="px-4 py-3 font-medium text-[#3b2f22]">
                        {colaborador.nome}
                      </td>

                      <td className="px-4 py-3 text-[#3b2f22]">
                        {colaborador.email || "-"}
                      </td>

                      <td className="px-4 py-3 text-[#3b2f22]">
                        {nomeCargo(colaborador)}
                      </td>

                      <td className="px-4 py-3 text-[#3b2f22]">
                        {nomeDepartamento(colaborador)}
                      </td>

                      <td className="px-4 py-3 text-[#3b2f22]">
                        {formatarMoeda(valorBaseCargo(colaborador))}
                      </td>

                      <td className="px-4 py-3 text-[#3b2f22]">
                        {labelPerfil(colaborador.perfil)}
                      </td>

                      <td className="px-4 py-3">
                        {colaborador.user_id ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                            Vinculado
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 border border-yellow-200">
                            Sem acesso
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => editar(colaborador)}
                          className="px-4 py-2 text-sm border border-[#d8c7ad] rounded-lg text-[#3b2f22] hover:bg-[#f7f3ec]"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}