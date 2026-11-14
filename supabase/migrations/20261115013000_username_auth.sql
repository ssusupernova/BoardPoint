update public.profiles
set username = lower(trim(username))
where username is not null;

create unique index if not exists profiles_username_ci_unique
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    nullif(lower(trim(new.raw_user_meta_data->>'username')), ''),
    case
      when new.raw_user_meta_data->>'role' = 'landlord' then 'landlord'::public.app_role
      else 'renter'::public.app_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create table if not exists public.username_login_rate_limits (
  bucket_hash text primary key check (bucket_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  attempts integer not null check (attempts > 0)
);

create index if not exists username_login_rate_limits_window_idx
  on public.username_login_rate_limits (window_started_at);

revoke all on public.username_login_rate_limits from public, anon, authenticated;

create or replace function public.consume_username_login_rate_limit(
  p_subject_hash text,
  p_source_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_subject_attempts integer;
  v_source_attempts integer;
begin
  if p_subject_hash !~ '^[0-9a-f]{64}$'
     or p_source_hash !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  insert into public.username_login_rate_limits as limits (
    bucket_hash, window_started_at, attempts
  )
  values (p_subject_hash, v_now, 1)
  on conflict (bucket_hash) do update
  set attempts = case
        when limits.window_started_at <= v_now - interval '15 minutes' then 1
        else limits.attempts + 1
      end,
      window_started_at = case
        when limits.window_started_at <= v_now - interval '15 minutes' then v_now
        else limits.window_started_at
      end
  returning attempts into v_subject_attempts;

  insert into public.username_login_rate_limits as limits (
    bucket_hash, window_started_at, attempts
  )
  values (p_source_hash, v_now, 1)
  on conflict (bucket_hash) do update
  set attempts = case
        when limits.window_started_at <= v_now - interval '15 minutes' then 1
        else limits.attempts + 1
      end,
      window_started_at = case
        when limits.window_started_at <= v_now - interval '15 minutes' then v_now
        else limits.window_started_at
      end
  returning attempts into v_source_attempts;

  delete from public.username_login_rate_limits
  where window_started_at < v_now - interval '1 day';

  return v_subject_attempts <= 5 and v_source_attempts <= 30;
end;
$$;

revoke all on function public.consume_username_login_rate_limit(text, text)
  from public, anon, authenticated;
grant execute on function public.consume_username_login_rate_limit(text, text)
  to service_role;
