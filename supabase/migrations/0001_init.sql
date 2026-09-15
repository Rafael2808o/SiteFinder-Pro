-- SiteFinder Pro — schema inicial: leads por usuário, com RLS.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  name text not null,
  category text not null default '',
  phone text,
  whatsapp text,
  address text not null default '',
  city text not null default '',
  instagram text,
  website text,
  rating numeric,
  review_count integer not null default 0,
  status text not null default 'novo'
    check (status in (
      'novo', 'contato_realizado', 'respondeu', 'interessado',
      'negociacao', 'cliente', 'nao_interessado'
    )),
  notes text not null default '',
  lead_score integer not null default 0,
  lead_score_reason text not null default '',
  latitude double precision,
  longitude double precision,
  map_url text,
  created_at timestamptz not null default now(),
  last_contact_at timestamptz,
  unique (user_id, place_id)
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_status_idx on public.leads (user_id, status);

alter table public.leads enable row level security;

create policy "Usuários leem apenas seus próprios leads"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas seus próprios leads"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam apenas seus próprios leads"
  on public.leads for update
  using (auth.uid() = user_id);

create policy "Usuários excluem apenas seus próprios leads"
  on public.leads for delete
  using (auth.uid() = user_id);
