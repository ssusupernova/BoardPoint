create table if not exists public.landlord_workspace_snapshots (
  landlord_id uuid primary key references public.profiles(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.landlord_workspace_snapshots enable row level security;
revoke all on table public.landlord_workspace_snapshots from public, anon, authenticated;
grant select, insert, update on table public.landlord_workspace_snapshots to authenticated;

drop policy if exists landlord_workspace_snapshots_read on public.landlord_workspace_snapshots;
create policy landlord_workspace_snapshots_read on public.landlord_workspace_snapshots
for select to authenticated using (
  landlord_id = (select auth.uid())
);

drop policy if exists landlord_workspace_snapshots_insert on public.landlord_workspace_snapshots;
create policy landlord_workspace_snapshots_insert on public.landlord_workspace_snapshots
for insert to authenticated with check (
  landlord_id = (select auth.uid())
  and public.is_verified_landlord()
);

drop policy if exists landlord_workspace_snapshots_update on public.landlord_workspace_snapshots;
create policy landlord_workspace_snapshots_update on public.landlord_workspace_snapshots
for update to authenticated using (
  landlord_id = (select auth.uid())
  and public.is_verified_landlord()
)
with check (
  landlord_id = (select auth.uid())
  and public.is_verified_landlord()
);

create or replace function public.save_landlord_workspace(
  p_payload jsonb,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_revision bigint;
begin
  if auth.uid() is null or not public.is_verified_landlord() then
    raise exception 'Verified landlord access is required.';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Workspace payload must be a JSON object.';
  end if;

  insert into public.landlord_workspace_snapshots as workspace (
    landlord_id,
    payload,
    revision,
    updated_at
  )
  values (
    auth.uid(),
    p_payload,
    1,
    now()
  )
  on conflict (landlord_id) do update
  set payload = excluded.payload,
      revision = workspace.revision + 1,
      updated_at = now()
  where workspace.revision = p_expected_revision
  returning workspace.revision into v_revision;

  if v_revision is null then
    raise exception 'Workspace changed on another device. Reload before saving again.';
  end if;

  return v_revision;
end;
$$;

revoke all on function public.save_landlord_workspace(jsonb, bigint) from public, anon;
grant execute on function public.save_landlord_workspace(jsonb, bigint) to authenticated;

create table if not exists public.admin_workspace_snapshots (
  workspace_key text primary key default 'primary' check (workspace_key = 'primary'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.admin_workspace_snapshots enable row level security;
revoke all on table public.admin_workspace_snapshots from public, anon, authenticated;
grant select, insert, update on table public.admin_workspace_snapshots to authenticated;

drop policy if exists admin_workspace_snapshots_read on public.admin_workspace_snapshots;
create policy admin_workspace_snapshots_read on public.admin_workspace_snapshots
for select to authenticated using (public.is_admin());

drop policy if exists admin_workspace_snapshots_insert on public.admin_workspace_snapshots;
create policy admin_workspace_snapshots_insert on public.admin_workspace_snapshots
for insert to authenticated with check (public.is_admin());

drop policy if exists admin_workspace_snapshots_update on public.admin_workspace_snapshots;
create policy admin_workspace_snapshots_update on public.admin_workspace_snapshots
for update to authenticated using (public.is_admin())
with check (public.is_admin());

create or replace function public.save_admin_workspace(
  p_payload jsonb,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_revision bigint;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Workspace payload must be a JSON object.';
  end if;

  insert into public.admin_workspace_snapshots as workspace (
    workspace_key,
    payload,
    revision,
    updated_at
  )
  values (
    'primary',
    p_payload,
    1,
    now()
  )
  on conflict (workspace_key) do update
  set payload = excluded.payload,
      revision = workspace.revision + 1,
      updated_at = now()
  where workspace.revision = p_expected_revision
  returning workspace.revision into v_revision;

  if v_revision is null then
    raise exception 'Admin workspace changed on another device. Reload before saving again.';
  end if;

  return v_revision;
end;
$$;

revoke all on function public.save_admin_workspace(jsonb, bigint) from public, anon;
grant execute on function public.save_admin_workspace(jsonb, bigint) to authenticated;
