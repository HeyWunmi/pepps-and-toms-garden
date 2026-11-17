-- Run the ENTIRE script as project owner in a TEST Supabase SQL Editor query.
-- Requires 202611160001_auth_roles.sql. Do not rerun the migration.
-- All fixtures and changes are rolled back. Any ERROR means a failed check.
-- DO blocks run as the current role (not SECURITY DEFINER). Explicit RAISE
-- checks cannot be disabled via plpgsql.check_asserts. No pg_temp helper/grants
-- are needed: pg_temp is a session alias, not a literal schema name for GRANT.
begin;
set local row_security = on;

-- Ensure role impersonation actually exercises non-privileged API roles.
do $$ begin
  if (select count(*) from pg_roles where rolname in ('anon', 'authenticated')
      and not rolsuper and not rolbypassrls) <> 2 then
    raise exception 'FAIL: anon/authenticated must exist without superuser or BYPASSRLS';
  end if;
end $$;

insert into auth.users (id, email, raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111', 'customer-auth-test@example.invalid', '{"role":"admin"}'),
 ('22222222-2222-4222-8222-222222222222', 'staff-auth-test@example.invalid', '{}');
insert into public.staff_roles (user_id, role) values ('22222222-2222-4222-8222-222222222222', 'admin');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  if current_user <> 'anon' or auth.uid() is not null then
    raise exception 'FAIL: anonymous role/identity setup';
  end if;
  begin perform * from public.profiles; raise exception 'FAIL: anonymous profile access';
  exception when insufficient_privilege then null; end;
  begin perform * from public.staff_roles; raise exception 'FAIL: anonymous staff access';
  exception when insufficient_privilege then null; end;
  begin perform public.is_admin(); raise exception 'FAIL: anonymous RPC access';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
-- Mirror user-editable metadata in both auth.users and the JWT claims.
-- The JWT's actual API role stays authenticated; users cannot sign admin JWTs.
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","user_metadata":{"role":"admin"}}', true);
do $$ declare affected bigint; begin
  if current_user <> 'authenticated' or auth.uid() is distinct from '11111111-1111-4111-8111-111111111111'::uuid then
    raise exception 'FAIL: customer role/identity setup';
  end if;
  if public.is_admin() is distinct from false then
    raise exception 'FAIL: forged user metadata grants admin';
  end if;
  if (select count(*) from public.profiles) <> 1 or
     not exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'FAIL: customer must read exactly their own profile';
  end if;
  update public.profiles set display_name = 'Test customer' where id = auth.uid();
  get diagnostics affected = row_count;
  if affected <> 1 or (select display_name from public.profiles where id = auth.uid()) is distinct from 'Test customer' then
    raise exception 'FAIL: customer cannot edit own display name';
  end if;
  update public.profiles set display_name = 'Forbidden' where id = '22222222-2222-4222-8222-222222222222';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL: customer updated another profile'; end if;

  -- Catch ONLY permission errors. Success, constraint errors, missing tables,
  -- and all other failures must fail the test rather than masquerade as denial.
  begin insert into public.staff_roles (user_id, role) values (auth.uid(), 'admin'); raise exception 'FAIL: self promotion';
  exception when insufficient_privilege then null; end;
  begin update public.staff_roles set role = 'admin'; raise exception 'FAIL: role update';
  exception when insufficient_privilege then null; end;
  begin delete from public.staff_roles; raise exception 'FAIL: role deletion';
  exception when insufficient_privilege then null; end;
  begin perform * from public.staff_roles; raise exception 'FAIL: role enumeration';
  exception when insufficient_privilege then null; end;
  begin update public.profiles set id = '33333333-3333-4333-8333-333333333333'; raise exception 'FAIL: profile reassignment';
  exception when insufficient_privilege then null; end;
  begin insert into public.profiles(id) values(auth.uid()); raise exception 'FAIL: direct profile insertion';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","user_metadata":{}}', true);
do $$ begin
  if current_user <> 'authenticated' or auth.uid() is distinct from '22222222-2222-4222-8222-222222222222'::uuid then
    raise exception 'FAIL: staff role/identity setup';
  end if;
  if public.is_admin() is distinct from true then raise exception 'FAIL: provisioned staff not recognised'; end if;
  if (select display_name from public.profiles where id = auth.uid()) is distinct from '' then
    raise exception 'FAIL: other customer changed staff profile';
  end if;
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'FAIL: admin has blanket customer profile access';
  end if;
  -- Even staff cannot provision staff through browser credentials.
  begin insert into public.staff_roles (user_id, role) values ('11111111-1111-4111-8111-111111111111', 'admin'); raise exception 'FAIL: staff can promote customers';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

do $$ declare affected bigint; begin
  delete from public.staff_roles where user_id = '22222222-2222-4222-8222-222222222222';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'FAIL: owner did not revoke the staff fixture'; end if;
end $$;
set local role authenticated;
-- Do not change either JWT setting: revocation must work with the same claims.
do $$ begin
  if current_user <> 'authenticated' or auth.uid() is distinct from '22222222-2222-4222-8222-222222222222'::uuid then
    raise exception 'FAIL: revocation role/identity setup';
  end if;
  if public.is_admin() is distinct from false then
    raise exception 'FAIL: revocation ineffective with the same JWT subject';
  end if;
end $$;
reset role;
rollback;
