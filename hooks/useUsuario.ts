"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type PerfilUsuario = "admin" | "lider" | "usuario";

type UsuarioLogado = {
  id: string;
  nome: string;
  perfil: PerfilUsuario;
  colaborador_id: string | null;
  setor_id: string | null;
};

export function useUsuario() {
  const supabase = useMemo(() => createClient(), []);

  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  useEffect(() => {
    async function carregarUsuario() {
      setCarregandoUsuario(true);

      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth || !user) {
        setUsuario(null);
        setCarregandoUsuario(false);
        return;
      }

      const { data: perfil } = await supabase
        .from("usuarios_perfis")
        .select("nome, perfil")
        .eq("user_id", user.id)
        .eq("ativo", true)
        .single();

      const { data: colaborador } = await supabase
        .from("colaboradores")
        .select("id, setor_id")
        .eq("user_id", user.id)
        .single();

      setUsuario({
        id: user.id,
        nome: perfil?.nome || "Usuário",
        perfil: (perfil?.perfil || "usuario") as PerfilUsuario,
        colaborador_id: colaborador?.id || null,
        setor_id: colaborador?.setor_id || null,
      });

      setCarregandoUsuario(false);
    }

    carregarUsuario();
  }, [supabase]);

  return {
    usuario,
    carregandoUsuario,
    isAdmin: usuario?.perfil === "admin",
    isLider: usuario?.perfil === "lider",
    isUsuario: usuario?.perfil === "usuario",
  };
}