create table if not exists public.juris_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.enforce_juris_auth_user_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('juris'),
    pg_catalog.hashtext('auth-user-limit')
  );

  select count(*) into account_count from auth.users;
  if account_count >= 3 then
    raise exception 'O limite máximo de 3 contas foi atingido.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_juris_auth_user_limit() from public;

drop trigger if exists enforce_juris_auth_user_limit on auth.users;
create trigger enforce_juris_auth_user_limit
  before insert on auth.users
  for each row execute function public.enforce_juris_auth_user_limit();

alter table public.juris_user_data enable row level security;

grant select, insert, update, delete on public.juris_user_data to authenticated;

drop policy if exists "Users can read their own Juris data" on public.juris_user_data;
create policy "Users can read their own Juris data"
  on public.juris_user_data for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own Juris data" on public.juris_user_data;
create policy "Users can create their own Juris data"
  on public.juris_user_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own Juris data" on public.juris_user_data;
create policy "Users can update their own Juris data"
  on public.juris_user_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own Juris data" on public.juris_user_data;
create policy "Users can delete their own Juris data"
  on public.juris_user_data for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('juris-files', 'juris-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "Users can read their own Juris files" on storage.objects;
create policy "Users can read their own Juris files"
  on storage.objects for select to authenticated
  using (bucket_id = 'juris-files' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users can upload their own Juris files" on storage.objects;
create policy "Users can upload their own Juris files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'juris-files' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users can update their own Juris files" on storage.objects;
create policy "Users can update their own Juris files"
  on storage.objects for update to authenticated
  using (bucket_id = 'juris-files' and (storage.foldername(name))[1] = (select auth.uid()::text))
  with check (bucket_id = 'juris-files' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Users can delete their own Juris files" on storage.objects;
create policy "Users can delete their own Juris files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'juris-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
