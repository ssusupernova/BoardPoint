create table if not exists public.renter_favorites (
  renter_id uuid not null references public.profiles(id) on delete cascade,
  room_id text not null,
  created_at timestamptz not null default now(),
  primary key (renter_id, room_id)
);

create table if not exists public.renter_payment_methods (
  renter_id uuid primary key references public.profiles(id) on delete cascade,
  selected_method_id text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.renter_notifications (
  id text not null,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  day text not null,
  timestamp_label text not null,
  title text not null,
  description text not null,
  status_label text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (renter_id, id)
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.renter_rental_requests (
  id text not null,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  room_id text not null,
  room_title text not null,
  property_name text not null,
  address text not null default '',
  monthly_rent numeric(12, 2) not null check (monthly_rent >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined')),
  submitted_at date not null default current_date,
  decided_at date,
  updated_at timestamptz not null default now(),
  primary key (renter_id, id)
);

create table if not exists public.renter_maintenance_tickets (
  id text not null,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  details text not null,
  photo_uri text,
  status text not null default 'Scheduled',
  updated_at timestamptz not null default now(),
  primary key (renter_id, id)
);

alter table public.renter_notifications
  add column if not exists is_read boolean not null default false;

alter table public.renter_rental_requests
  add column if not exists address text not null default '';

create index if not exists renter_favorites_renter_idx
  on public.renter_favorites (renter_id);
create index if not exists renter_notifications_renter_idx
  on public.renter_notifications (renter_id, created_at desc);
create index if not exists renter_rental_requests_renter_idx
  on public.renter_rental_requests (renter_id, submitted_at desc);
create index if not exists renter_maintenance_tickets_renter_idx
  on public.renter_maintenance_tickets (renter_id, updated_at desc);

alter table public.renter_favorites enable row level security;
alter table public.renter_payment_methods enable row level security;
alter table public.renter_notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.renter_rental_requests enable row level security;
alter table public.renter_maintenance_tickets enable row level security;

drop policy if exists renter_favorites_self on public.renter_favorites;
create policy renter_favorites_self on public.renter_favorites
for all to authenticated
using (renter_id = auth.uid())
with check (renter_id = auth.uid());

drop policy if exists renter_payment_methods_self on public.renter_payment_methods;
create policy renter_payment_methods_self on public.renter_payment_methods
for all to authenticated
using (renter_id = auth.uid())
with check (renter_id = auth.uid());

drop policy if exists renter_notifications_self on public.renter_notifications;
create policy renter_notifications_self on public.renter_notifications
for all to authenticated
using (renter_id = auth.uid())
with check (renter_id = auth.uid());

drop policy if exists notification_preferences_self on public.notification_preferences;
create policy notification_preferences_self on public.notification_preferences
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists renter_rental_requests_self on public.renter_rental_requests;
create policy renter_rental_requests_self on public.renter_rental_requests
for all to authenticated
using (renter_id = auth.uid())
with check (renter_id = auth.uid());

drop policy if exists renter_maintenance_tickets_self on public.renter_maintenance_tickets;
create policy renter_maintenance_tickets_self on public.renter_maintenance_tickets
for all to authenticated
using (renter_id = auth.uid())
with check (renter_id = auth.uid());

grant select, insert, update, delete on
  public.renter_favorites,
  public.renter_payment_methods,
  public.renter_notifications,
  public.notification_preferences,
  public.renter_rental_requests,
  public.renter_maintenance_tickets
to authenticated;
