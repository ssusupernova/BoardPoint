do $$
begin
  create type public.app_role as enum ('renter', 'landlord', 'super_admin');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.verification_status as enum (
    'pending',
    'under_review',
    'more_information_requested',
    'approved',
    'rejected'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.maintenance_status as enum (
    'submitted',
    'scheduled',
    'in_progress',
    'completed',
    'rejected'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'renter',
  full_name text not null,
  username text,
  account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'deactivated')),
  phone text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  address text not null,
  region text,
  city text,
  barangay text,
  latitude double precision,
  longitude double precision,
  map_location_set boolean not null default false,
  photos jsonb not null default '[]'::jsonb,
  amenities text[] not null default '{}',
  house_rules text[] not null default '{}',
  contact_name text,
  contact_phone text,
  contact_email text,
  listing_status text not null default 'draft'
    check (listing_status in ('draft', 'published', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  label text not null,
  description text not null default '',
  room_type text not null default 'private_room'
    check (room_type in ('private_room', 'shared_room')),
  rent numeric(12, 2) not null check (rent >= 0),
  status text not null default 'available'
    check (status in ('available', 'occupied', 'maintenance', 'inactive')),
  capacity integer not null default 1 check (capacity > 0),
  furnishings text[] not null default '{}',
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rental_requests (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenancies (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete restrict,
  renter_id uuid not null references public.profiles(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  room_id uuid references public.rooms(id) on delete set null,
  rent numeric(12, 2) not null default 0 check (rent >= 0),
  status text not null default 'active'
    check (status in ('active', 'ended', 'pending')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_messages (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.rent_bills (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  due_date date not null,
  period_start date,
  period_end date,
  status text not null default 'unpaid'
    check (status in ('unpaid', 'paid', 'overdue', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  rent_bill_id uuid references public.rent_bills(id) on delete set null,
  amount numeric(12, 2) not null check (amount >= 0),
  method text,
  reference text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.shared_expenses (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  category text not null,
  description text not null default '',
  amount numeric(12, 2) not null check (amount >= 0),
  incurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.expense_allocations (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.shared_expenses(id) on delete cascade,
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (expense_id, tenancy_id)
);

create table if not exists public.tenant_statements (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenancy_id uuid not null references public.tenancies(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null default 'open'
    check (status in ('open', 'issued', 'closed')),
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists public.statement_lines (
  id uuid primary key default gen_random_uuid(),
  statement_id uuid not null references public.tenant_statements(id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.statement_corrections (
  id uuid primary key default gen_random_uuid(),
  statement_id uuid not null references public.tenant_statements(id) on delete cascade,
  reason text not null,
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  tenancy_id uuid references public.tenancies(id) on delete set null,
  renter_id uuid references public.profiles(id) on delete set null,
  category text not null default 'other',
  details text not null default '',
  photo_paths text[] not null default '{}',
  status public.maintenance_status not null default 'submitted',
  landlord_response text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.renter_preferences (
  renter_id uuid primary key references public.profiles(id) on delete cascade,
  origin_label text not null default '',
  origin_latitude double precision,
  origin_longitude double precision,
  search_radius_km numeric not null default 5
    check (search_radius_km in (1, 2, 3, 5, 10)),
  min_monthly_rent numeric(12, 2) not null default 0,
  max_monthly_rent numeric(12, 2) not null default 0,
  preferred_room_type text not null default 'private_room'
    check (preferred_room_type in ('private_room', 'shared_room')),
  occupants integer not null default 1 check (occupants between 1 and 4),
  move_in_date date not null default current_date,
  must_have text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  preferred_rules text[] not null default '{}',
  updated_at timestamptz not null default now(),
  check (min_monthly_rent >= 0 and max_monthly_rent >= min_monthly_rent),
  check (
    (origin_latitude is null and origin_longitude is null)
    or (
      origin_latitude between -90 and 90
      and origin_longitude between -180 and 180
    )
  )
);

create table if not exists public.landlord_verification_applications (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  address text not null default '',
  status public.verification_status not null default 'pending',
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null
    references public.landlord_verification_applications(id) on delete cascade,
  document_kind text not null
    check (document_kind in ('id_front', 'id_back', 'selfie', 'proof_of_address', 'ownership_proof')),
  storage_path text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  target_label text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists properties_landlord_id_idx
  on public.properties (landlord_id);
create index if not exists rooms_property_id_idx
  on public.rooms (property_id);
create index if not exists rental_requests_renter_id_idx
  on public.rental_requests (renter_id);
create index if not exists tenancies_landlord_id_idx
  on public.tenancies (landlord_id);
create index if not exists tenancies_renter_id_idx
  on public.tenancies (renter_id);
create index if not exists rent_bills_tenancy_id_idx
  on public.rent_bills (tenancy_id);
create index if not exists payments_tenancy_id_idx
  on public.payments (tenancy_id);
create index if not exists landlord_verification_latest_idx
  on public.landlord_verification_applications (landlord_id, submitted_at desc);
create index if not exists verification_documents_application_idx
  on public.verification_documents (application_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'super_admin'
      and p.account_status = 'active'
  );
$$;

create or replace function public.is_verified_landlord()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select a.status = 'approved'
    from public.landlord_verification_applications a
    where a.landlord_id = auth.uid()
    order by a.submitted_at desc
    limit 1
  ), false)
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'landlord'
      and p.account_status = 'active'
  );
$$;

create or replace function public.owns_property(property_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.properties p
    where p.id = property_uuid
      and p.landlord_id = auth.uid()
  );
$$;

create or replace function public.is_tenant_allocated_to_expense(p_expense_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.expense_allocations ea
    join public.tenancies t on t.id = ea.tenancy_id
    where ea.expense_id = p_expense_id
      and t.renter_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_verified_landlord() from public, anon;
revoke all on function public.owns_property(uuid) from public, anon;
revoke all on function public.is_tenant_allocated_to_expense(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_verified_landlord() to authenticated;
grant execute on function public.owns_property(uuid) to authenticated;
grant execute on function public.is_tenant_allocated_to_expense(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.rental_requests enable row level security;
alter table public.tenancies enable row level security;
alter table public.tenant_messages enable row level security;
alter table public.rent_bills enable row level security;
alter table public.payments enable row level security;
alter table public.shared_expenses enable row level security;
alter table public.expense_allocations enable row level security;
alter table public.tenant_statements enable row level security;
alter table public.statement_lines enable row level security;
alter table public.statement_corrections enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.renter_preferences enable row level security;
alter table public.landlord_verification_applications enable row level security;
alter table public.verification_documents enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists properties_select_visible on public.properties;
create policy properties_select_visible on public.properties
for select to authenticated
using (listing_status = 'published' or landlord_id = auth.uid() or public.is_admin());
drop policy if exists properties_insert_owner on public.properties;
create policy properties_insert_owner on public.properties
for insert to authenticated
with check (landlord_id = auth.uid() and public.is_verified_landlord() and not public.is_admin());
drop policy if exists properties_update_owner_or_admin on public.properties;
create policy properties_update_owner_or_admin on public.properties
for update to authenticated
using ((landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin())
with check ((landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin());
drop policy if exists properties_delete_owner_or_admin on public.properties;
create policy properties_delete_owner_or_admin on public.properties
for delete to authenticated
using ((landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin());

drop policy if exists rooms_select_visible on public.rooms;
create policy rooms_select_visible on public.rooms
for select to authenticated
using (
  exists (
    select 1 from public.properties p
    where p.id = property_id
      and (p.listing_status = 'published' or p.landlord_id = auth.uid() or public.is_admin())
  )
);
drop policy if exists rooms_manage_owner_or_admin on public.rooms;
create policy rooms_manage_owner_or_admin on public.rooms
for all to authenticated
using ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin())
with check ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin());

drop policy if exists rental_requests_select_parties on public.rental_requests;
create policy rental_requests_select_parties on public.rental_requests
for select to authenticated
using (
  renter_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.rooms r
    join public.properties p on p.id = r.property_id
    where r.id = room_id and p.landlord_id = auth.uid()
  )
);
drop policy if exists rental_requests_insert_renter on public.rental_requests;
create policy rental_requests_insert_renter on public.rental_requests
for insert to authenticated
with check (
  renter_id = auth.uid()
  and status = 'pending'
  and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'renter'
  )
);
drop policy if exists requests_update_landlord_admin on public.rental_requests;
create policy requests_update_landlord_admin on public.rental_requests
for update to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.rooms r
    join public.properties p on p.id = r.property_id
    where r.id = room_id and p.landlord_id = auth.uid() and public.is_verified_landlord()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.rooms r
    join public.properties p on p.id = r.property_id
    where r.id = room_id and p.landlord_id = auth.uid() and public.is_verified_landlord()
  )
);

drop policy if exists tenancies_select_parties on public.tenancies;
create policy tenancies_select_parties on public.tenancies
for select to authenticated
using (landlord_id = auth.uid() or renter_id = auth.uid() or public.is_admin());
drop policy if exists tenancies_insert_landlord_admin on public.tenancies;
create policy tenancies_insert_landlord_admin on public.tenancies
for insert to authenticated
with check ((landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin());
drop policy if exists tenancies_update_landlord_admin on public.tenancies;
create policy tenancies_update_landlord_admin on public.tenancies
for update to authenticated
using ((landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin())
with check ((landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin());

drop policy if exists messages_select_tenancy_parties on public.tenant_messages;
create policy messages_select_tenancy_parties on public.tenant_messages
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.tenancies t
    where t.id = tenancy_id and (t.renter_id = auth.uid() or t.landlord_id = auth.uid())
  )
);
drop policy if exists messages_insert_tenancy_parties on public.tenant_messages;
create policy messages_insert_tenancy_parties on public.tenant_messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and (
    public.is_admin()
    or exists (
      select 1 from public.tenancies t
      where t.id = tenancy_id and t.renter_id = auth.uid()
    )
    or (
      public.is_verified_landlord()
      and exists (
        select 1 from public.tenancies t
        where t.id = tenancy_id and t.landlord_id = auth.uid()
      )
    )
  )
);

drop policy if exists bills_select_parties on public.rent_bills;
create policy bills_select_parties on public.rent_bills
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.tenancies t
    where t.id = rent_bills.tenancy_id and t.renter_id = auth.uid()
  )
  or exists (
    select 1 from public.properties p
    where p.id = property_id and p.landlord_id = auth.uid()
  )
);
drop policy if exists bills_manage_landlord_admin on public.rent_bills;
create policy bills_manage_landlord_admin on public.rent_bills
for all to authenticated
using (
  exists (
    select 1 from public.properties p
    where p.id = property_id and p.landlord_id = auth.uid() and public.is_verified_landlord()
  ) or public.is_admin()
)
with check (
  exists (
    select 1 from public.properties p
    where p.id = property_id and p.landlord_id = auth.uid() and public.is_verified_landlord()
  ) or public.is_admin()
);

drop policy if exists payments_select_parties on public.payments;
create policy payments_select_parties on public.payments
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.tenancies t
    where t.id = tenancy_id and (t.renter_id = auth.uid() or t.landlord_id = auth.uid())
  )
);
drop policy if exists payments_insert_renter on public.payments;
create policy payments_insert_renter on public.payments
for insert to authenticated
with check (
  status = 'pending'
  and exists (
    select 1 from public.tenancies t where t.id = tenancy_id and t.renter_id = auth.uid()
  )
);
drop policy if exists payments_update_landlord_admin on public.payments;
create policy payments_update_landlord_admin on public.payments
for update to authenticated
using (
  exists (
    select 1 from public.tenancies t
    where t.id = tenancy_id and t.landlord_id = auth.uid() and public.is_verified_landlord()
  ) or public.is_admin()
)
with check (
  exists (
    select 1 from public.tenancies t
    where t.id = tenancy_id and t.landlord_id = auth.uid() and public.is_verified_landlord()
  ) or public.is_admin()
);

drop policy if exists expenses_select_parties on public.shared_expenses;
create policy expenses_select_parties on public.shared_expenses
for select to authenticated
using (
  public.owns_property(property_id)
  or public.is_admin()
  or public.is_tenant_allocated_to_expense(shared_expenses.id)
);
drop policy if exists expenses_manage_owner_admin on public.shared_expenses;
create policy expenses_manage_owner_admin on public.shared_expenses
for all to authenticated
using ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin())
with check ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin());

drop policy if exists expense_allocations_select_parties on public.expense_allocations;
create policy expense_allocations_select_parties on public.expense_allocations
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.tenancies t where t.id = tenancy_id and t.renter_id = auth.uid()
  )
  or exists (
    select 1
    from public.shared_expenses e
    join public.properties p on p.id = e.property_id
    where e.id = expense_id and p.landlord_id = auth.uid()
  )
);
drop policy if exists expense_allocations_manage_landlord_admin on public.expense_allocations;
create policy expense_allocations_manage_landlord_admin on public.expense_allocations
for all to authenticated
using (
  exists (
    select 1 from public.shared_expenses e
    join public.properties p on p.id = e.property_id
    where e.id = expense_id and p.landlord_id = auth.uid() and public.is_verified_landlord()
  ) or public.is_admin()
)
with check (
  exists (
    select 1 from public.shared_expenses e
    join public.properties p on p.id = e.property_id
    where e.id = expense_id and p.landlord_id = auth.uid() and public.is_verified_landlord()
  ) or public.is_admin()
);

drop policy if exists statements_select_parties on public.tenant_statements;
create policy statements_select_parties on public.tenant_statements
for select to authenticated
using (renter_id = auth.uid() or public.owns_property(property_id) or public.is_admin());
drop policy if exists statements_manage_landlord_admin on public.tenant_statements;
create policy statements_manage_landlord_admin on public.tenant_statements
for all to authenticated
using ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin())
with check ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin());

drop policy if exists statement_lines_select_parent on public.statement_lines;
create policy statement_lines_select_parent on public.statement_lines
for select to authenticated
using (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (s.renter_id = auth.uid() or public.owns_property(s.property_id) or public.is_admin())
  )
);
drop policy if exists statement_lines_manage_parent on public.statement_lines;
create policy statement_lines_manage_parent on public.statement_lines
for all to authenticated
using (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (public.owns_property(s.property_id) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (public.owns_property(s.property_id) or public.is_admin())
  )
);

drop policy if exists statement_corrections_select_parent on public.statement_corrections;
create policy statement_corrections_select_parent on public.statement_corrections
for select to authenticated
using (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (s.renter_id = auth.uid() or public.owns_property(s.property_id) or public.is_admin())
  )
);
drop policy if exists statement_corrections_manage_parent on public.statement_corrections;
create policy statement_corrections_manage_parent on public.statement_corrections
for all to authenticated
using (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (public.owns_property(s.property_id) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (public.owns_property(s.property_id) or public.is_admin())
  )
);

drop policy if exists maintenance_select_parties on public.maintenance_tickets;
create policy maintenance_select_parties on public.maintenance_tickets
for select to authenticated
using (
  renter_id = auth.uid()
  or public.owns_property(property_id)
  or public.is_admin()
);
drop policy if exists maintenance_insert_renter on public.maintenance_tickets;
create policy maintenance_insert_renter on public.maintenance_tickets
for insert to authenticated
with check (
  renter_id = auth.uid()
  and status = 'submitted'
  and exists (
    select 1 from public.tenancies t
    where t.id = tenancy_id
      and t.renter_id = auth.uid()
      and t.property_id = maintenance_tickets.property_id
  )
);
drop policy if exists maintenance_update_landlord_admin on public.maintenance_tickets;
create policy maintenance_update_landlord_admin on public.maintenance_tickets
for update to authenticated
using ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin())
with check ((public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin());

drop policy if exists renter_preferences_self on public.renter_preferences;
create policy renter_preferences_self on public.renter_preferences
for all to authenticated
using (renter_id = auth.uid())
with check (
  renter_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'renter')
);

drop policy if exists landlord_verification_select_owner_admin on public.landlord_verification_applications;
create policy landlord_verification_select_owner_admin on public.landlord_verification_applications
for select to authenticated using (landlord_id = auth.uid() or public.is_admin());
drop policy if exists landlord_verification_insert_owner on public.landlord_verification_applications;
create policy landlord_verification_insert_owner on public.landlord_verification_applications
for insert to authenticated
with check (
  landlord_id = auth.uid()
  and status = 'pending'
  and reviewer_id is null
  and reviewer_notes is null
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'landlord' and p.account_status = 'active'
  )
);

drop policy if exists verification_documents_select_owner_admin on public.verification_documents;
create policy verification_documents_select_owner_admin on public.verification_documents
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.landlord_verification_applications a
    where a.id = application_id and a.landlord_id = auth.uid()
  )
);

drop policy if exists admin_audit_logs_select_admin on public.admin_audit_logs;
create policy admin_audit_logs_select_admin on public.admin_audit_logs
for select to authenticated using (public.is_admin());
drop policy if exists admin_audit_logs_insert_admin on public.admin_audit_logs;
create policy admin_audit_logs_insert_admin on public.admin_audit_logs
for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

grant select on public.profiles to authenticated;
grant update (full_name, username, phone, emergency_contact) on public.profiles to authenticated;
grant select, insert, update, delete on
  public.properties,
  public.rooms,
  public.rental_requests,
  public.tenancies,
  public.tenant_messages,
  public.rent_bills,
  public.payments,
  public.shared_expenses,
  public.expense_allocations,
  public.tenant_statements,
  public.statement_lines,
  public.statement_corrections,
  public.maintenance_tickets,
  public.renter_preferences,
  public.landlord_verification_applications,
  public.verification_documents
to authenticated;
grant select, insert on public.admin_audit_logs to authenticated;

with auth_profiles as (
  select
    u.id,
    u.raw_user_meta_data,
    u.email,
    nullif(lower(trim(u.raw_user_meta_data->>'username')), '') as normalized_username,
    row_number() over (
      partition by nullif(lower(trim(u.raw_user_meta_data->>'username')), '')
      order by u.created_at nulls last, u.id
    ) as username_rank
  from auth.users u
)
insert into public.profiles (id, role, full_name, username)
select
  id,
  case
    when raw_user_meta_data->>'role' = 'landlord' then 'landlord'::public.app_role
    else 'renter'::public.app_role
  end,
  coalesce(nullif(trim(raw_user_meta_data->>'full_name'), ''), split_part(email, '@', 1)),
  case when username_rank = 1 then normalized_username else null end
from auth_profiles
on conflict (id) do nothing;
