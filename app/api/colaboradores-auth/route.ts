import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PerfilUsuario = "admin" | "lider" | "usuario";

type Payload = {
  id?: string | null;
  user_id?: string | null;
  nome: string;
  email?: string;
  senha?: string;
  setor_id: string;
  cargo_id: string;
  perfil?: PerfilUsuario;
};

export async function GET() {
  const { data: colaboradores, error } = await supabaseAdmin
    .from("colaboradores")
    .select(`
      id,
      nome,
      email,
      user_id,
      setor_id,
      cargo_id,
      setores (
        nome
      ),
      cargos (
        nome,
        valor_base
      )
    `)
    .order("nome", { ascending: true });

  if (error) {
    return NextResponse.json(
      {
        error: "Erro ao carregar colaboradores.",
        details: error.message,
      },
      { status: 500 }
    );
  }

  const userIds = (colaboradores || [])
    .map((c) => c.user_id)
    .filter(Boolean);

  let perfis: any[] = [];

  if (userIds.length > 0) {
    const { data: perfisData } = await supabaseAdmin
      .from("usuarios_perfis")
      .select("user_id, perfil, ativo")
      .in("user_id", userIds);

    perfis = perfisData || [];
  }

  const resultado = (colaboradores || []).map((colaborador) => {
    const perfil = perfis.find((p) => p.user_id === colaborador.user_id);

    return {
      ...colaborador,
      perfil: perfil?.perfil || "",
      ativo: perfil?.ativo ?? false,
    };
  });

  return NextResponse.json(resultado);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Payload;

  if (!body.nome || !body.setor_id || !body.cargo_id) {
    return NextResponse.json(
      { error: "Preencha nome, departamento e cargo." },
      { status: 400 }
    );
  }

  const editando = Boolean(body.id);
  let userId = body.user_id || null;

  const temEmail = Boolean(body.email?.trim());
  const temSenha = Boolean(body.senha?.trim());

  if (temEmail && !userId) {
    if (!temSenha) {
      return NextResponse.json(
        { error: "Informe uma senha para criar o acesso do colaborador." },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: body.email!.trim(),
        password: body.senha!.trim(),
        email_confirm: true,
        user_metadata: {
          nome: body.nome.trim(),
        },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          error: "Erro ao criar usuário de acesso.",
          details: authError?.message,
        },
        { status: 500 }
      );
    }

    userId = authData.user.id;
  }

  if (temEmail && userId) {
    const updatePayload: {
      email: string;
      password?: string;
      user_metadata: { nome: string };
    } = {
      email: body.email!.trim(),
      user_metadata: {
        nome: body.nome.trim(),
      },
    };

    if (temSenha) {
      updatePayload.password = body.senha!.trim();
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, updatePayload);

    if (updateError) {
      return NextResponse.json(
        {
          error: "Erro ao atualizar usuário de acesso.",
          details: updateError.message,
        },
        { status: 500 }
      );
    }
  }

  if (editando) {
    const { error } = await supabaseAdmin
      .from("colaboradores")
      .update({
        nome: body.nome.trim(),
        email: body.email?.trim() || null,
        setor_id: body.setor_id,
        cargo_id: body.cargo_id,
        user_id: userId,
      })
      .eq("id", body.id);

    if (error) {
      return NextResponse.json(
        {
          error: "Erro ao atualizar colaborador.",
          details: error.message,
        },
        { status: 500 }
      );
    }
  } else {
    const { error } = await supabaseAdmin.from("colaboradores").insert([
      {
        nome: body.nome.trim(),
        email: body.email?.trim() || null,
        setor_id: body.setor_id,
        cargo_id: body.cargo_id,
        user_id: userId,
      },
    ]);

    if (error) {
      return NextResponse.json(
        {
          error: "Erro ao cadastrar colaborador.",
          details: error.message,
        },
        { status: 500 }
      );
    }
  }

  if (userId && body.perfil) {
    const { error: perfilError } = await supabaseAdmin
      .from("usuarios_perfis")
      .upsert(
        {
          user_id: userId,
          nome: body.nome.trim(),
          perfil: body.perfil,
          ativo: true,
        },
        {
          onConflict: "user_id",
        }
      );

    if (perfilError) {
      return NextResponse.json(
        {
          error: "Erro ao salvar função do usuário.",
          details: perfilError.message,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}