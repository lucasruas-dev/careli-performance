"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/relatorios");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f3ec] px-4">
      <div className="w-full max-w-md bg-white border border-[#eadfce] rounded-2xl shadow-sm p-8">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Careli Performance"
            width={160}
            height={70}
            className="object-contain"
            priority
          />
        </div>

        {/* TEXTO */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Careli Performance
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Acesse sua área de gestão de performance.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@empresa.com.br"
              required
              className="mt-1 w-full rounded-xl border border-[#eadfce] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              className="mt-1 w-full rounded-xl border border-[#eadfce] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a07c3b]"
            />
          </div>

          {erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full h-11 rounded-xl bg-[#a07c3b] text-white font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {carregando && <Loader2 size={18} className="animate-spin" />}
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}