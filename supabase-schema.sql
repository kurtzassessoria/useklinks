-- ════════════════════════════════════════════════════════════════════════
-- KLINKS · Banco de dados (Supabase) — rode inteiro no SQL Editor.
-- Idempotente: pode rodar de novo sem quebrar nada.
-- ════════════════════════════════════════════════════════════════════════

-- 1) RESTAURANTES ─────────────────────────────────────────────────────────
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid references auth.users(id) on delete set null,
  owner_email text,
  plan text not null default 'free',
  config jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.restaurants add column if not exists owner_email text;
alter table public.restaurants add column if not exists plan text not null default 'free';
alter table public.restaurants add column if not exists plan_until timestamptz;

do $$ begin
  alter table public.restaurants add constraint restaurants_slug_format
    check (slug ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$');
exception when duplicate_object then null; end $$;
-- Normaliza linhas antigas (ex.: 'Free', 'gratis', null) antes da regra.
update public.restaurants set plan = case when lower(trim(coalesce(plan,''))) in ('pro','premium','fundador') then 'pro' else 'free' end
  where plan is null or plan not in ('free','pro');
do $$ begin
  alter table public.restaurants add constraint restaurants_plan_values check (plan in ('free','pro'));
exception when duplicate_object then null; end $$;

-- 1 restaurante por conta (V1)
create unique index if not exists restaurants_owner_uniq on public.restaurants(owner_id) where owner_id is not null;

-- Dono NÃO pode mudar plano, slug, dono ou e-mail pelo navegador.
create or replace function public.klinks_protect_columns() returns trigger
language plpgsql as $$
begin
  if coalesce(current_setting('request.jwt.claims', true)::json->>'role','') <> 'service_role'
     and current_user not in ('postgres','supabase_admin') then
    new.plan := old.plan; new.plan_until := old.plan_until; new.slug := old.slug;
    new.owner_email := old.owner_email;
    if old.owner_id is not null then new.owner_id := old.owner_id; end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists klinks_protect on public.restaurants;
create trigger klinks_protect before update on public.restaurants
  for each row execute function public.klinks_protect_columns();

alter table public.restaurants enable row level security;
drop policy if exists "public read by slug" on public.restaurants;
drop policy if exists "owner writes" on public.restaurants;
drop policy if exists "claim unowned" on public.restaurants;
drop policy if exists "owner reads" on public.restaurants;
drop policy if exists "owner updates" on public.restaurants;
-- A tabela só é visível ao próprio dono (owner_email nunca vaza).
create policy "owner reads" on public.restaurants for select to authenticated using (auth.uid() = owner_id);
create policy "owner updates" on public.restaurants for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Leitura pública: só slug, plano e config publicado.
create or replace view public.public_pages as
  select slug, plan, config, updated_at from public.restaurants;
grant select on public.public_pages to anon, authenticated;

-- 2) FUNÇÕES (RPC) ────────────────────────────────────────────────────────
-- Endereço livre? (não expõe nada além de true/false)
create or replace function public.slug_available(p_slug text) returns boolean
language sql security definer set search_path = public stable as $$
  select p_slug ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$'
     and p_slug not in ('studio','cadastro','entrar','pagina','api','admin','app','login','assets','www','blog','ajuda','planos','precos','termos','privacidade','kurtz','klinks','plaquinha','relatorio')
     and not exists (select 1 from restaurants where slug = p_slug);
$$;
grant execute on function public.slug_available(text) to anon, authenticated;

-- Cadastro self-service: cria o restaurante do usuário logado (plano free).
create or replace function public.create_my_restaurant(p_slug text, p_config jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); em text := auth.jwt()->>'email';
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from restaurants where owner_id = uid) then raise exception 'already_has_restaurant'; end if;
  if not slug_available(p_slug) then raise exception 'slug_taken'; end if;
  insert into restaurants (slug, owner_id, owner_email, plan, config) values (p_slug, uid, em, 'free', coalesce(p_config,'{}'));
  return p_slug;
end $$;
grant execute on function public.create_my_restaurant(text, jsonb) to authenticated;

-- Convite (clientes criados pela Kurtz/n8n com owner_email): assume ao entrar.
create or replace function public.claim_invited() returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); em text := lower(auth.jwt()->>'email'); s text;
begin
  if uid is null then return null; end if;
  if exists (select 1 from restaurants where owner_id = uid) then return null; end if;
  update restaurants set owner_id = uid where owner_id is null and lower(owner_email) = em returning slug into s;
  return s;
end $$;
grant execute on function public.claim_invited() to authenticated;

-- 3) EVENTOS (visitas e cliques) ─────────────────────────────────────────
create table if not exists public.shortcut_clicks (
  id uuid primary key default gen_random_uuid(),
  restaurant_slug text not null,
  event text not null,
  href text, label text, referrer text, user_agent text,
  created_at timestamptz default now()
);
alter table public.shortcut_clicks add column if not exists session_id text;
create index if not exists shortcut_clicks_slug_idx on public.shortcut_clicks (restaurant_slug, created_at desc);

alter table public.shortcut_clicks enable row level security;
drop policy if exists "qualquer visitante grava clique" on public.shortcut_clicks;
drop policy if exists "leitura de cliques" on public.shortcut_clicks;
drop policy if exists "visitante grava evento" on public.shortcut_clicks;
drop policy if exists "dono le eventos" on public.shortcut_clicks;
-- Qualquer visitante grava, mas só para páginas que existem e com campos curtos.
create policy "visitante grava evento" on public.shortcut_clicks for insert to anon, authenticated
  with check (restaurant_slug in (select slug from public.public_pages)
              and length(event) <= 60 and coalesce(length(label),0) <= 200 and coalesce(length(href),0) <= 2000);
-- Só o dono lê os dados do próprio restaurante.
create policy "dono le eventos" on public.shortcut_clicks for select to authenticated
  using (exists (select 1 from public.restaurants r where r.slug = restaurant_slug and r.owner_id = auth.uid()));

-- 3b) CONTATOS (bloco "Cupom por WhatsApp") ──────────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  restaurant_slug text not null,
  name text, phone text not null, source text,
  consent boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists leads_slug_idx on public.leads (restaurant_slug, created_at desc);
alter table public.leads enable row level security;
drop policy if exists "visitante deixa contato" on public.leads;
drop policy if exists "dono le contatos" on public.leads;
drop policy if exists "dono apaga contatos" on public.leads;
-- Visitante só grava com consentimento (LGPD), em página existente e com campos curtos.
create policy "visitante deixa contato" on public.leads for insert to anon, authenticated
  with check (consent = true and restaurant_slug in (select slug from public.public_pages)
              and length(phone) between 10 and 15 and coalesce(length(name),0) <= 60 and coalesce(length(source),0) <= 30);
create policy "dono le contatos" on public.leads for select to authenticated
  using (exists (select 1 from public.restaurants r where r.slug = restaurant_slug and r.owner_id = auth.uid()));
create policy "dono apaga contatos" on public.leads for delete to authenticated
  using (exists (select 1 from public.restaurants r where r.slug = restaurant_slug and r.owner_id = auth.uid()));

-- 4) STORAGE (fotos) ──────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('restaurants','restaurants', true)
  on conflict (id) do update set public = true;
drop policy if exists "restaurants bucket: leitura publica" on storage.objects;
drop policy if exists "restaurants bucket: dono envia" on storage.objects;
drop policy if exists "restaurants bucket: dono atualiza" on storage.objects;
drop policy if exists "restaurants bucket: dono apaga" on storage.objects;
create policy "restaurants bucket: leitura publica" on storage.objects for select using (bucket_id = 'restaurants');
-- Cada dono só escreve na pasta do próprio slug: restaurants/<slug>/...
create policy "restaurants bucket: dono envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'restaurants' and (storage.foldername(name))[1] in (select slug from public.restaurants where owner_id = auth.uid()));
create policy "restaurants bucket: dono atualiza" on storage.objects for update to authenticated
  using (bucket_id = 'restaurants' and (storage.foldername(name))[1] in (select slug from public.restaurants where owner_id = auth.uid()));
create policy "restaurants bucket: dono apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'restaurants' and (storage.foldername(name))[1] in (select slug from public.restaurants where owner_id = auth.uid()));

-- 4b) ADMINISTRADORES (Kurtz) ─────────────────────────────────────────────
-- Quem está nesta lista vê as ferramentas internas (ex.: gerar plaquinha).
create table if not exists public.klinks_admins (email text primary key, created_at timestamptz default now());
alter table public.klinks_admins enable row level security; -- sem policies: ninguém lê pelo navegador
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from klinks_admins where lower(email) = lower(coalesce(auth.jwt()->>'email','')));
$$;
grant execute on function public.is_admin() to authenticated;
-- ⚠️ Troque pelo SEU e-mail de login no KLINKS antes de rodar:
insert into public.klinks_admins (email) values (lower('SEU-EMAIL@gmail.com')) on conflict do nothing;

-- Funções do ADM: criar e editar páginas de clientes sem criar login para eles.
-- O cliente faz o "Primeiro acesso" com o e-mail cadastrado, confirma e a página vira dele.
create or replace function public.admin_list_restaurants() returns table(slug text, owner_email text, claimed boolean, name text, updated_at timestamptz)
language plpgsql security definer set search_path = public stable as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  return query select r.slug, r.owner_email, r.owner_id is not null, r.config->'profile'->>'name', r.updated_at from restaurants r order by r.updated_at desc nulls last;
end $$;
grant execute on function public.admin_list_restaurants() to authenticated;

create or replace function public.admin_create_restaurant(p_slug text, p_email text, p_config jsonb) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  if not slug_available(p_slug) then raise exception 'slug_taken'; end if;
  insert into restaurants (slug, owner_email, plan, config) values (p_slug, nullif(lower(trim(p_email)),''), 'pro', coalesce(p_config,'{}'));
  return p_slug;
end $$;
grant execute on function public.admin_create_restaurant(text, text, jsonb) to authenticated;

create or replace function public.admin_get_restaurant(p_slug text) returns table(slug text, owner_email text, claimed boolean, config jsonb)
language plpgsql security definer set search_path = public stable as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  return query select r.slug, r.owner_email, r.owner_id is not null, r.config from restaurants r where r.slug = p_slug;
end $$;
grant execute on function public.admin_get_restaurant(text) to authenticated;

create or replace function public.admin_save_config(p_slug text, p_config jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  update restaurants set config = p_config - 'plan' where slug = p_slug;
end $$;
grant execute on function public.admin_save_config(text, jsonb) to authenticated;

create or replace function public.admin_set_email(p_slug text, p_email text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  update restaurants set owner_email = nullif(lower(trim(p_email)),'') where slug = p_slug and owner_id is null;
end $$;
grant execute on function public.admin_set_email(text, text) to authenticated;

-- ADM também lê dados e contatos e envia fotos de qualquer cliente.
drop policy if exists "adm le eventos" on public.shortcut_clicks;
create policy "adm le eventos" on public.shortcut_clicks for select to authenticated using (public.is_admin());
drop policy if exists "adm le contatos" on public.leads;
create policy "adm le contatos" on public.leads for select to authenticated using (public.is_admin());
drop policy if exists "adm apaga contatos" on public.leads;
create policy "adm apaga contatos" on public.leads for delete to authenticated using (public.is_admin());
drop policy if exists "restaurants bucket: adm envia" on storage.objects;
create policy "restaurants bucket: adm envia" on storage.objects for insert to authenticated with check (bucket_id = 'restaurants' and public.is_admin());
drop policy if exists "restaurants bucket: adm atualiza" on storage.objects;
create policy "restaurants bucket: adm atualiza" on storage.objects for update to authenticated using (bucket_id = 'restaurants' and public.is_admin());

-- 5) OPERAÇÃO (rode manualmente quando precisar) ─────────────────────────
-- Ativar Pro após pagamento no Cakto:
--   update restaurants set plan = 'pro', plan_until = now() + interval '31 days' where slug = 'pinerolo';
-- Convidar cliente (a Kurtz monta, o dono entra com este e-mail e assume):
--   insert into restaurants (slug, owner_email, config) values ('pinerolo', 'dono@email.com', '{}');
-- Adicionar outro administrador:
--   insert into klinks_admins (email) values ('socio@email.com');
-- Remover:
--   delete from klinks_admins where email = 'socio@email.com';
