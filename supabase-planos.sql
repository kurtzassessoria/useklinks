-- ════════════════════════════════════════════════════════════════════════
-- KLINKS · Assinaturas e códigos de acesso
-- Cadastro fechado: só cria página quem tem um código (gerado pelo ADM após o pagamento).
-- Pode rodar quantas vezes quiser.
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.access_codes (
  code text primary key,
  plan text not null check (plan in ('mensal','trimestral','anual')),
  kurtz boolean not null default false,
  note text,
  used_slug text,
  used_at timestamptz,
  created_at timestamptz default now()
);
alter table public.access_codes enable row level security; -- sem policies: só via funções abaixo

create or replace function public.klinks_plan_interval(p text) returns interval
language sql immutable as $$
  select case p when 'anual' then interval '365 days' when 'trimestral' then interval '92 days' else interval '31 days' end;
$$;

-- Confere o código antes do cadastro (só devolve o plano, nada mais).
create or replace function public.code_check(p_code text) returns text
language sql security definer set search_path = public stable as $$
  select plan from access_codes where code = upper(trim(p_code)) and used_at is null;
$$;
grant execute on function public.code_check(text) to anon, authenticated;

-- Cadastro sem código deixa de existir.
drop function if exists public.create_my_restaurant(text, jsonb);
create or replace function public.create_my_restaurant(p_slug text, p_config jsonb, p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); em text := auth.jwt()->>'email'; pl text;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from restaurants where owner_id = uid) then raise exception 'already_has_restaurant'; end if;
  select plan into pl from access_codes where code = upper(trim(p_code)) and used_at is null for update;
  if pl is null then raise exception 'invalid_code'; end if;
  if not slug_available(p_slug) then raise exception 'slug_taken'; end if;
  insert into restaurants (slug, owner_id, owner_email, plan, plan_until, config)
    values (p_slug, uid, em, 'pro', now() + klinks_plan_interval(pl), coalesce(p_config,'{}'));
  update access_codes set used_slug = p_slug, used_at = now() where code = upper(trim(p_code));
  return p_slug;
end $$;
grant execute on function public.create_my_restaurant(text, jsonb, text) to authenticated;

-- ADM: gerar e listar códigos
create or replace function public.admin_new_code(p_plan text, p_kurtz boolean, p_note text) returns text
language plpgsql security definer set search_path = public as $$
declare c text; abc text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  loop
    c := 'KL-';
    for i in 1..8 loop c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1); if i = 4 then c := c || '-'; end if; end loop;
    exit when not exists (select 1 from access_codes where code = c);
  end loop;
  insert into access_codes (code, plan, kurtz, note) values (c, p_plan, coalesce(p_kurtz,false), nullif(trim(p_note),''));
  return c;
end $$;
grant execute on function public.admin_new_code(text, boolean, text) to authenticated;

create or replace function public.admin_list_codes() returns table(code text, plan text, kurtz boolean, note text, used_slug text, used_at timestamptz, created_at timestamptz)
language plpgsql security definer set search_path = public stable as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  return query select a.code, a.plan, a.kurtz, a.note, a.used_slug, a.used_at, a.created_at from access_codes a order by a.created_at desc limit 200;
end $$;
grant execute on function public.admin_list_codes() to authenticated;

create or replace function public.admin_delete_code(p_code text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  delete from access_codes where code = p_code and used_at is null;
end $$;
grant execute on function public.admin_delete_code(text) to authenticated;

-- ADM: renovar assinatura (soma a partir do vencimento, ou de hoje se já venceu)
create or replace function public.admin_extend(p_slug text, p_plan text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare u timestamptz;
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  update restaurants set plan = 'pro', plan_until = greatest(coalesce(plan_until, now()), now()) + klinks_plan_interval(p_plan)
    where slug = p_slug returning plan_until into u;
  return u;
end $$;
grant execute on function public.admin_extend(text, text) to authenticated;

-- Lista do ADM agora mostra o vencimento
drop function if exists public.admin_list_restaurants();
create or replace function public.admin_list_restaurants() returns table(slug text, owner_email text, claimed boolean, name text, updated_at timestamptz, plan_until timestamptz)
language plpgsql security definer set search_path = public stable as $$
begin
  if not is_admin() then raise exception 'not_admin'; end if;
  return query select r.slug, r.owner_email, r.owner_id is not null, r.config->'profile'->>'name', r.updated_at, r.plan_until from restaurants r order by r.updated_at desc nulls last;
end $$;
grant execute on function public.admin_list_restaurants() to authenticated;

-- Endereços reservados (inclui /planos e /obrigado)
create or replace function public.slug_available(p_slug text) returns boolean
language sql security definer set search_path = public stable as $$
  select p_slug ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$'
     and p_slug not in ('studio','cadastro','entrar','pagina','api','admin','app','login','assets','www','blog','ajuda','planos','precos','termos','privacidade','kurtz','klinks','plaquinha','relatorio','obrigado')
     and not exists (select 1 from restaurants where slug = p_slug);
$$;
