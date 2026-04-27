"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useUsuario } from "@/hooks/useUsuario";

type PerfilUsuario = "admin" | "lider" | "usuario";

type ItemMenu = {
  nome: string;
  rota: string;
  perfis: PerfilUsuario[];
};

type GrupoMenu = {
  titulo: string;
  itens: ItemMenu[];
};

const menu: GrupoMenu[] = [
  {
    titulo: "Operação",
    itens: [
      {
        nome: "Colaboradores",
        rota: "/colaboradores",
        perfis: ["admin"],
      },
      {
        nome: "Lançamentos",
        rota: "/ocorrencias",
        perfis: ["admin", "lider", "usuario"],
      },
    ],
  },
  {
    titulo: "Relatórios",
    itens: [
      {
        nome: "Dashboard",
        rota: "/relatorios",
        perfis: ["admin", "lider", "usuario"],
      },
    ],
  },
  {
    titulo: "Configurações",
    itens: [
      {
        nome: "Departamento",
        rota: "/configuracoes/setores",
        perfis: ["admin"],
      },
      {
        nome: "Cargos",
        rota: "/configuracoes/cargos",
        perfis: ["admin"],
      },
      {
        nome: "Ocorrências",
        rota: "/configuracoes/ocorrencias",
        perfis: ["admin"],
      },
      {
        nome: "Perfil",
        rota: "/configuracoes/perfis-ocorrencia",
        perfis: ["admin"],
      },
    ],
  },
];

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const { usuario, carregandoUsuario } = useUsuario();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function perfilLabel(perfil?: PerfilUsuario) {
    if (perfil === "admin") return "Administrador";
    if (perfil === "lider") return "Líder";
    if (perfil === "usuario") return "Usuário";
    return "Sem perfil";
  }

  return (
    <div className="flex min-h-screen bg-[#f7f3ec]">
      <aside className="flex min-h-screen w-64 flex-col bg-white border-r border-[#eadfce] p-4">
        {/* LOGO */}
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Careli Performance"
            width={130}
            height={60}
            priority
            className="h-auto w-[130px]"
          />
        </div>

        {/* USUÁRIO */}
        <div className="mb-6 rounded-xl border border-[#eadfce] bg-[#f7f3ec] p-3 text-center">
          {carregandoUsuario ? (
            <>
              <div className="mx-auto mb-2 h-4 w-28 animate-pulse rounded bg-[#eadfce]" />
              <div className="mx-auto h-3 w-16 animate-pulse rounded bg-[#eadfce]" />
            </>
          ) : usuario ? (
            <>
              <p className="text-sm font-semibold text-[#3b2f22]">
                {usuario.nome}
              </p>
              <p className="mt-1 text-xs uppercase text-[#7a6a58]">
                {perfilLabel(usuario.perfil)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#3b2f22]">
                Usuário não identificado
              </p>
              <p className="mt-1 text-xs uppercase text-[#7a6a58]">
                Sem perfil
              </p>
            </>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1">
          {!carregandoUsuario &&
            usuario &&
            menu.map((grupo) => {
              const itensFiltrados = grupo.itens.filter((item) =>
                item.perfis.includes(usuario.perfil)
              );

              if (itensFiltrados.length === 0) return null;

              return (
                <div key={grupo.titulo} className="mb-6">
                  <p className="mb-2 text-xs font-semibold text-[#7a6a58] uppercase">
                    {grupo.titulo}
                  </p>

                  <div className="flex flex-col gap-1">
                    {itensFiltrados.map((item) => {
                      const ativo = pathname === item.rota;

                      return (
                        <Link
                          key={item.rota}
                          href={item.rota}
                          className={`rounded-lg px-3 py-2 text-sm transition ${
                            ativo
                              ? "bg-[#f0e6d6] text-[#7a5b24] font-semibold"
                              : "text-[#3b2f22] hover:bg-[#f7f3ec]"
                          }`}
                        >
                          {item.nome}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-[#eadfce] pt-4">
          <button
            onClick={sair}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}