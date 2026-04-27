# 🚀 Careli Performance — Progresso do Projeto

## 🧱 Stack

- Next.js (App Router)
- Supabase (Database + Storage)
- TailwindCSS
- Vercel (deploy)

---

## ✅ Estrutura

✔ Layout com menu lateral (sistema interno)
✔ Padronização visual aplicada em todas telas
✔ Tema:
- cor principal: #a07c3b
- borda: #eadfce
- inputs arredondados

---

## 🗂️ Banco de Dados

### Tabelas criadas:

- setores
- cargos
  - nome
  - valor_base
- colaboradores
  - nome
  - setor_id
  - cargo_id
- perfis_ocorrencia
- tipos_ocorrencia
  - nome
  - perfil_id
- ocorrencias
  - codigo (sequencial)
  - colaborador_id
  - tipo_ocorrencia_id
  - observacao
  - valor
  - data_ocorrencia
  - evidencia_url
  - evidencia_nome
  - evidencia_tipo
  - created_at

---

## 📦 Storage

✔ Bucket criado: `evidencias`  
✔ Público (public = true)  
✔ Upload funcionando via frontend  

Tipos suportados:
- imagem (png, jpg)
- pdf
- documentos

---

## 🧑‍💼 Telas implementadas

### Configurações

✔ Setores (CRUD)  
✔ Cargos (CRUD, sem vínculo com setor)  
✔ Perfis de ocorrência  
✔ Tipos de ocorrência (sem valor base)  

---

### Operação

✔ Colaboradores (CRUD)
- vínculo com setor
- vínculo com cargo

✔ Lançamento de Ocorrências
- colaborador
- tipo
- data
- observação
- upload de evidência (Storage)
- valor automático
- código sequencial

✔ Filtros implementados:
- ID
- colaborador
- setor
- perfil
- tipo
- data

---

### Relatórios

✔ Dashboard inicial com:
- total de ocorrências
- por setor
- por perfil
- por tipo
- por colaborador

---

## 🎯 Arquitetura definida

✔ Separação de responsabilidades:

- Configuração → define tipos
- Operação → executa lançamentos
- Relatórios → análise

✔ Cargo NÃO pertence a setor  
✔ Colaborador possui setor + cargo  

---

## 🔥 Próximos passos

- Componentização (inputs, cards, tabelas)
- Performance (reduzir re-render / queries)
- Paginação de ocorrências
- Upload com preview (imagem/pdf)
- Sistema de pontuação (positivo/negativo)
- Ranking de colaboradores
- Controle financeiro do impacto das ocorrências
- Permissões (RLS no Supabase)

---

## 📌 Observações

Sistema já está em nível funcional real  
Base pronta para escalar para produto