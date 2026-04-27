"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    titulo: "Operação",
    itens: [
      { nome: "Colaboradores", rota: "/colaboradores" },
      { nome: "Lançamentos", rota: "/ocorrencias" },
    ],
  },
  {
    titulo: "Relatórios",
    itens: [
      { nome: "Dashboard", rota: "/relatorios" },
    ],
  },
  {
    titulo: "Configurações",
    itens: [
      { nome: "Departamento", rota: "/configuracoes/setores" }, // mantém rota
      { nome: "Cargos", rota: "/configuracoes/cargos" },
      { nome: "Ocorrências", rota: "/configuracoes/ocorrencias" },
      { nome: "Perfil", rota: "/configuracoes/perfis-ocorrencia" },
    ],
  },
];

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#f7f3ec]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-[#eadfce] p-4">
        
        {/* LOGO */}
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Careli Performance"
            width={130}
            height={60}
            priority
            className="h-auto w-[130px]"
          />
        </div>

        {/* MENU */}
        {menu.map((grupo) => (
          <div key={grupo.titulo} className="mb-6">
            
            <p className="mb-2 text-xs font-semibold text-[#7a6a58] uppercase">
              {grupo.titulo}
            </p>

            <div className="flex flex-col gap-1">
              {grupo.itens.map((item) => {
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
        ))}

      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}