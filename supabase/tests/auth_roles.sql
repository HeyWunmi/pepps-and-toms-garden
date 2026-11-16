-- Run as project owner in a TEST Supabase project after the migration.
-- All fixtures and changes are rolled back. Any ERROR means a failed check.
begin;
create function pg_temp.assert_true(ok boolean, label text) returns void
language plpgsql as $$ begin
  if ok is distinct from true then raise exception 'FAIL: %', label; end if;
end $$;
grant usage on schema pg_temp to authenticated;
grant execute on function pg_temp.assert_true(boolean, text) to authenticated;
insert into auth.users (id, email, raw_user_meta_data) values
 ('11111111-1111-4111-8111-111111111111', 'customer-auth-test@example.invalid', '{"role":"admin"}'),
 ('22222222-2222-4222-8222-222222222222', 'staff-auth-test@example.invalid', '{}');
insert into public.staff_roles (user_id, role) values ('22222222-2222-4222-8222-222222222222', 'admin');

set local role anon;
do $$ begin
  begin perform * from public.profiles; raise exception 'FAIL: anonymous profile access';
  exception when insufficient_privilege then null; end;
  begin perform public.is_admin(); raise exception 'FAIL: anonymous RPC access';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select pg_temp.assert_true(not public.is_admin(), 'metadata cannot grant admin');
select pg_temp.assert_true((select count(*) = 1 from public.profiles), 'customer reads only own profile');
update public.profiles set display_name = 'Test customer' where id = auth.uid();
select pg_temp.assert_true((select display_name = 'Test customer' from public.profiles where id = auth.uid()), 'customer can edit own display name');
update public.profiles set display_name = 'Forbidden' where id = '22222222-2222-4222-8222-222222222222';
do $$ begin
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
select pg_temp.assert_true(public.is_admin(), 'provisioned staff recognised');
select pg_temp.assert_true((select display_name = '' from public.profiles where id = auth.uid()), 'other customer cannot update staff profile');
select pg_temp.assert_true((select count(*) = 1 from public.profiles), 'admin has no blanket customer profile access');
reset role;
delete from public.staff_roles where user_id = '22222222-2222-4222-8222-222222222222';
set local role authenticated;
select pg_temp.assert_true(not public.is_admin(), 'revocation effective with same JWT subject');
reset role;
rollback;
