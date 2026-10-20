-- KLINKS · ADM (rode depois do schema principal). Troque SEU-EMAIL antes.
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

