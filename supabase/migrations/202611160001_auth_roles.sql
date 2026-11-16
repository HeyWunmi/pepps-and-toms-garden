-- Apply manually through the Supabase SQL editor as the project owner.
-- No application credentials or initial admin are embedded in this migration.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
create policy profiles_read_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table public.staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now()
);
alter table public.staff_roles enable row level security;
-- Deliberately no browser grants or policies. Only a trusted database owner
-- provisions/revokes staff membership. User metadata is never trusted.
revoke all on public.staff_roles from public, anon, authenticated;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create function public.create_customer_profile() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke all on function public.create_customer_profile() from public, anon, authenticated;
create trigger create_customer_profile after insert on auth.users
  for each row execute function public.create_customer_profile();
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

commit;
