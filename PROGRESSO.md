# 🚀 Careli Performance — Progresso do Projeto

## 🧱 Stack

- Next.js 16.2.4 com App Router
- Supabase Database
- Supabase Storage
- TailwindCSS
- Vercel
- GitHub como fonte do deploy

---

## ✅ Status geral

O projeto chegou ao estágio de **MVP funcional publicado em produção**.

URL atual de produção:

- https://careli-performance.vercel.app

O sistema já possui estrutura funcional para cadastro, lançamento, evidência, filtros e dashboard analítico.

---

## ✅ Deploy

✔ Projeto publicado na Vercel  
✔ Repositório conectado ao GitHub  
✔ Deploy automático pela branch `main`  
✔ Variáveis de ambiente configuradas na Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

✔ Tela inicial redirecionando automaticamente para:

- `/relatorios`

---

## 🎨 Layout e identidade visual

Padrão visual consolidado:

- cor principal: `#a07c3b`
- borda: `#eadfce`
- fundo geral: `#f7f3ec`
- cards brancos com borda e sombra leve
- inputs arredondados
- botões primários em dourado
- tabela com cabeçalho em `#f7f3ec`
- sidebar fixa com logo e navegação

Nomenclatura ajustada:

- “Setor” foi substituído por **Departamento** no front
- “Perfis” foi substituído por **Perfil** no front
- “Ocorrências” em configuração representa cadastro de tipos de ocorrência
- “Lançamentos” representa registro operacional das ocorrências

---

## 🗂️ Banco de dados

### `setores`
Usada no banco, mas exibida como **Departamento** no sistema.

Campos principais:
- `id`
- `nome`

### `cargos`
Campos principais:
- `id`
- `nome`
- `valor_base`

### `colaboradores`
Campos principais:
- `id`
- `nome`
- `setor_id`
- `cargo_id`

Relacionamentos esperados:
- `setor_id` → `setores.id`
- `cargo_id` → `cargos.id`

### `perfis_ocorrencia`
Campos principais:
- `id`
- `nome`

### `tipos_ocorrencia`
Campos principais:
- `id`
- `nome`
- `perfil_id`

Relacionamento esperado:
- `perfil_id` → `perfis_ocorrencia.id`

### `ocorrencias`
Campos principais:
- `id`
- `codigo`
- `colaborador_id`
- `tipo_ocorrencia_id`
- `observacao`
- `data_ocorrencia`
- `evidencia_url`
- `evidencia_nome`
- `evidencia_tipo`
- `created_at`

Relacionamentos esperados:
- `colaborador_id` → `colaboradores.id`
- `tipo_ocorrencia_id` → `tipos_ocorrencia.id`

Observações:
- A coluna `valor` foi removida da lógica do lançamento e da tabela visual.
- O sistema usa `created_at` como data automática de registro.
- O sistema usa `data_ocorrencia` como data real da ocorrência.

---

## 📦 Storage

Bucket configurado:

- `evidencias`

Status:
- público
- usado para upload de evidências nos lançamentos
- aceita imagens, PDFs e documentos
- salva URL pública, nome do arquivo e tipo do arquivo

Policies sugeridas:

```sql
create policy "Permitir upload publico evidencias"
on storage.objects
for insert
to public
with check (bucket_id = 'evidencias');

create policy "Permitir leitura publica evidencias"
on storage.objects
for select
to public
using (bucket_id = 'evidencias');
```

---

## 🧑‍💼 Telas implementadas

## Operação

### Colaborador

Rota:
- `/colaboradores`

Status:
- CRUD funcional
- cadastro e edição de colaborador
- vínculo com cargo
- vínculo com departamento
- tabela no padrão visual consolidado
- exibe valor base do cargo na listagem
- ordem da tabela: Nome, Cargo, Departamento, Valor Base, Ações

Observação técnica:
- A tipagem foi ajustada para evitar erro de build na Vercel, pois os relacionamentos do Supabase podem retornar objeto ou array.

---

### Lançamentos

Rota:
- `/ocorrencias`

Status:
- cadastro de ocorrência operacional
- edição de ocorrência
- upload de evidência
- salvamento no Supabase Storage
- salvamento da URL no banco
- campo de data da ocorrência
- data de registro automática via `created_at`
- campo de observação
- botão para visualizar observação em modal
- botão de edição na linha
- filtros funcionais

Filtros:
- ID
- colaborador
- departamento
- perfil
- ocorrência
- data

Tabela:
- ID
- Data registro
- Data ocorrência
- Colaborador
- Departamento
- Ocorrência
- Perfil
- Evidência
- Observação
- Ações

Observação importante:
- O horário do `created_at` vem em UTC do Supabase.
- Falta validar a correção final de timezone em produção com normalização UTC + `America/Sao_Paulo`.

Função recomendada para data/hora:

```tsx
function formatarDataHora(data: string | null) {
  if (!data) return "-";

  const dataNormalizada =
    data.endsWith("Z") || data.includes("-03:00")
      ? data
      : `${data}Z`;

  const date = new Date(dataNormalizada);

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
```

---

## Configurações

### Departamento

Rota:
- `/configuracoes/setores`

Status:
- CRUD funcional
- tabela padronizada
- front exibe **Departamento**
- banco continua usando tabela `setores`

### Cargos

Rota:
- `/configuracoes/cargos`

Status:
- CRUD funcional
- campos: `nome`, `valor_base`
- tabela padronizada
- valor formatado em moeda brasileira

### Perfil

Rota:
- `/configuracoes/perfis-ocorrencia`

Status:
- CRUD funcional
- layout padronizado
- nomenclatura no singular

### Ocorrência

Rota:
- `/configuracoes/ocorrencias`

Status:
- cadastro dos tipos de ocorrência
- vínculo com perfil
- layout padronizado
- tabela com ocorrência, perfil e ações

Observação técnica:
- O join com `perfis_ocorrencia` apresentou erro em uma versão.
- A solução segura atual é carregar `tipos_ocorrencia` e `perfis_ocorrencia` separadamente e cruzar no front.
- Confirmar se a coluna correta da tabela `tipos_ocorrencia` é `perfil_id`.

---

## Relatórios

Rota:
- `/relatorios`

Status:
- dashboard consolidado
- tela inicial do sistema
- filtros iguais ao lançamento
- cards de indicadores
- cards analíticos agrupados
- tabela analítica
- exportação CSV com ícone Excel

Filtros:
- ID
- colaborador
- departamento
- perfil
- ocorrência
- data
- data início
- data fim

Indicadores implementados:
- quantidade de registros
- departamentos com registros
- perfil com registros
- ocorrências registradas
- colaboradores com registros
- com evidência
- sem evidência
- maior recorrência

Agrupamentos:
- registros por departamento
- registros por perfil
- registros por ocorrência
- registros por colaborador

Tabela analítica:
- Código
- Data registro
- Data ocorrência
- Colaborador
- Departamento
- Ocorrência
- Perfil
- Evidência
- Observação

Exportação:
- botão com ícone `logo_excel.png`
- exporta CSV respeitando filtros

---

## 🧭 Navegação

Sidebar configurada com:

### Operação
- Colaboradores
- Lançamentos

### Relatórios
- Dashboard

### Configurações
- Departamento
- Cargos
- Ocorrências
- Perfil

---

## ✅ Problemas resolvidos

- Deploy inicial na Vercel
- Projeto conectando GitHub → Vercel
- Variáveis de ambiente ausentes na Vercel
- Erro de TypeScript em colaboradores por retorno de relacionamento como array
- Erro de join em configuração de ocorrências
- Remoção da coluna valor na lógica de lançamento
- Padronização visual das tabelas
- Redirecionamento da rota `/` para `/relatorios`
- Correção de layout em lançamentos após simplificação indevida
- Inclusão de botão Editar em lançamentos
- Inclusão de modal de observação
- Inclusão de dashboard analítico completo

---

## ⚠️ Pontos de atenção atuais

1. O sistema ainda está público, sem autenticação.
2. Qualquer pessoa com o link pode acessar e alterar dados.
3. Ainda não há logs/auditoria de alterações.
4. Ainda não há controle de permissões por perfil de usuário.
5. Ainda falta domínio personalizado.
6. Timezone precisa ser validado em produção após ajuste final.
7. Ainda não há proteção de rotas.
8. Ainda não há feedback visual profissional para sucesso/erro em todas as telas.
9. Ainda não há paginação nas tabelas.
10. Ainda não há exclusão controlada via interface.

---

## 🔥 Próxima fase

Prioridades recomendadas:

1. Autenticação com Supabase Auth
2. Tela de login
3. Proteção de rotas
4. Controle de sessão
5. Logout
6. Permissões por perfil: Admin, Gestor e Visualizador
7. Logs/auditoria: quem criou, quem editou, quando editou, valores antigos e novos
8. Ajuste final de timezone
9. Paginação nas tabelas
10. Domínio personalizado, sugestão: `performance.careli.com.br`
11. Melhorias de UX: loading states, toast, confirmação antes de excluir, estados vazios
12. Refatoração de código: componentes reutilizáveis, serviços Supabase, helpers de data e exportação
13. Segurança Supabase: RLS e policies por usuário
14. Melhorar dashboard: rankings, filtros persistentes e indicadores por período

---

## 🧩 Prompt recomendado para continuar em novo chat

```txt
Estou desenvolvendo um sistema chamado Careli Performance.

Stack:
- Next.js 16.2.4 com App Router
- Supabase Database
- Supabase Storage
- TailwindCSS
- Vercel
- GitHub

Estado atual:
O MVP já está funcional e publicado na Vercel:
https://careli-performance.vercel.app

O sistema possui:
- sidebar fixa
- layout visual padronizado
- CRUD de Departamento, Cargos, Perfil, Tipos de Ocorrência e Colaboradores
- tela de Lançamentos com upload de evidência, filtros, edição e modal de observação
- tela de Relatórios/Dashboard com filtros, indicadores, agrupamentos, tabela analítica e exportação CSV com ícone Excel
- Supabase Storage com bucket público `evidencias`
- rota inicial `/` redirecionando para `/relatorios`
- variáveis de ambiente da Vercel configuradas:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

Nomenclatura:
- No banco, a tabela `setores` continua existindo, mas no front usamos "Departamento".
- `perfis_ocorrencia` é exibido como "Perfil".
- `tipos_ocorrencia` é exibido como "Ocorrência" em Configurações.
- `/ocorrencias` é a tela de "Lançamentos".

Principais tabelas:
- setores: id, nome
- cargos: id, nome, valor_base
- colaboradores: id, nome, setor_id, cargo_id
- perfis_ocorrencia: id, nome
- tipos_ocorrencia: id, nome, perfil_id
- ocorrencias: id, codigo, colaborador_id, tipo_ocorrencia_id, observacao, data_ocorrencia, evidencia_url, evidencia_nome, evidencia_tipo, created_at

Pontos importantes:
- A coluna `valor` foi removida da lógica de ocorrências.
- `created_at` é a data automática de registro.
- `data_ocorrencia` é a data em que a ocorrência aconteceu.
- O Supabase retorna `created_at` em UTC, então precisamos tratar timezone para `America/Sao_Paulo`.
- O relacionamento de colaboradores no Supabase pode retornar objeto ou array, então a tela de colaboradores usa funções auxiliares para nomeCargo, nomeDepartamento e valorBaseCargo.
- Em Configurações > Ocorrência, a solução mais segura foi carregar `tipos_ocorrencia` e `perfis_ocorrencia` separadamente, evitando join direto.

Quero continuar a partir daqui com foco em:
1. Login com Supabase Auth
2. Proteção de rotas
3. Logout
4. Controle de permissões por perfil: Admin, Gestor e Visualizador
5. Logs/auditoria de criação e edição
6. Ajustar timezone definitivamente
7. Melhorar algumas telas
8. Criar domínio personalizado
9. Preparar o sistema para uso real interno

Regras:
- Sempre entregar código completo.
- Dizer exatamente o arquivo onde alterar.
- Manter o padrão visual atual:
  - cor principal #a07c3b
  - borda #eadfce
  - fundo #f7f3ec
  - cards brancos
  - inputs arredondados
  - tabelas no padrão atual
- Não simplificar demais.
- Priorizar padrão profissional.
```

---

## 📌 Estado final do MVP

O sistema está pronto como MVP funcional, mas ainda não deve ser considerado seguro para uso amplo enquanto não houver autenticação e controle de permissões.
