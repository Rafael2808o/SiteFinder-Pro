-- Empresas novas via CNPJ (Receita Federal) — dado público, sem RLS por
-- usuário. Populada por script local (service role), nunca escrita pelo
-- cliente. Leitura pública porque o dado já é público por natureza (CNPJ
-- aberto é informação pública da Receita Federal).

create table if not exists public.cnpj_empresas_novas (
  cnpj text primary key,
  razao_social text not null default '',
  nome_fantasia text not null default '',
  cnae_codigo text not null default '',
  cnae_descricao text not null default '',
  municipio_codigo text not null default '',
  municipio_nome text not null default '',
  uf text not null default '',
  bairro text not null default '',
  logradouro text not null default '',
  numero text not null default '',
  cep text not null default '',
  telefone text,
  data_inicio_atividade date not null,
  situacao_cadastral text not null default '02',
  atualizado_em timestamptz not null default now()
);

create index if not exists cnpj_empresas_novas_municipio_idx
  on public.cnpj_empresas_novas (municipio_codigo, data_inicio_atividade desc);
create index if not exists cnpj_empresas_novas_cnae_idx
  on public.cnpj_empresas_novas (cnae_codigo);
create index if not exists cnpj_empresas_novas_data_idx
  on public.cnpj_empresas_novas (data_inicio_atividade desc);

alter table public.cnpj_empresas_novas enable row level security;

create policy "Leitura pública de empresas novas"
  on public.cnpj_empresas_novas for select
  using (true);

-- Sem policy de insert/update/delete: só a service role (usada pelo script
-- de ETL local, nunca pelo navegador) escreve nesta tabela.
