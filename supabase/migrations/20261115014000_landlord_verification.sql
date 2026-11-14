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

revoke all on function public.is_verified_landlord() from public, anon;
grant execute on function public.is_verified_landlord() to authenticated;

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self_verified_landlord on public.profiles
for update using (
  id = auth.uid()
  and (role <> 'landlord' or public.is_verified_landlord())
)
with check (
  id = auth.uid()
  and (role <> 'landlord' or public.is_verified_landlord())
);

drop policy if exists properties_insert_owner on public.properties;
create policy properties_insert_verified_owner on public.properties
for insert with check (
  landlord_id = auth.uid()
  and public.is_verified_landlord()
  and public.is_admin() = false
);

drop policy if exists properties_update_owner_or_admin on public.properties;
create policy properties_update_verified_owner_or_admin on public.properties
for update using (
  (landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin()
)
with check (
  (landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin()
);

drop policy if exists properties_delete_owner_or_admin on public.properties;
create policy properties_delete_verified_owner_or_admin on public.properties
for delete using (
  (landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin()
);

drop policy if exists rooms_manage_owner_or_admin on public.rooms;
create policy rooms_manage_verified_owner_or_admin on public.rooms
for all using (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
)
with check (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
);

drop policy if exists requests_update_landlord_admin on public.rental_requests;
create policy requests_update_verified_landlord_admin on public.rental_requests
for update using (
  exists (
    select 1
    from public.rooms r
    join public.properties p on p.id = r.property_id
    where r.id = room_id
      and p.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
)
with check (
  exists (
    select 1
    from public.rooms r
    join public.properties p on p.id = r.property_id
    where r.id = room_id
      and p.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
);

drop policy if exists tenancies_insert_landlord_admin on public.tenancies;
create policy tenancies_insert_verified_landlord_admin on public.tenancies
for insert with check (
  (landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin()
);

drop policy if exists tenancies_update_landlord_admin on public.tenancies;
create policy tenancies_update_verified_landlord_admin on public.tenancies
for update using (
  (landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin()
)
with check (
  (landlord_id = auth.uid() and public.is_verified_landlord()) or public.is_admin()
);

drop policy if exists messages_insert_tenancy_parties on public.tenant_messages;
create policy messages_insert_verified_tenancy_parties on public.tenant_messages
for insert with check (
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

drop policy if exists bills_manage_landlord_admin on public.rent_bills;
create policy bills_manage_verified_landlord_admin on public.rent_bills
for all using (
  exists (
    select 1 from public.properties p
    where p.id = property_id
      and p.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
)
with check (
  exists (
    select 1 from public.properties p
    where p.id = property_id
      and p.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
);

drop policy if exists payments_update_landlord_admin on public.payments;
create policy payments_update_verified_landlord_admin on public.payments
for update using (
  exists (
    select 1 from public.tenancies t
    where t.id = tenancy_id
      and t.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
)
with check (
  exists (
    select 1 from public.tenancies t
    where t.id = tenancy_id
      and t.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
);

drop policy if exists expenses_manage_owner_admin on public.shared_expenses;
create policy expenses_manage_verified_owner_admin on public.shared_expenses
for all using (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
)
with check (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
);

drop policy if exists expense_allocations_manage_landlord_admin on public.expense_allocations;
create policy expense_allocations_manage_verified_landlord_admin on public.expense_allocations
for all using (
  exists (
    select 1
    from public.shared_expenses e
    join public.properties p on p.id = e.property_id
    where e.id = expense_id
      and p.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
)
with check (
  exists (
    select 1
    from public.shared_expenses e
    join public.properties p on p.id = e.property_id
    where e.id = expense_id
      and p.landlord_id = auth.uid()
      and public.is_verified_landlord()
  ) or public.is_admin()
);

drop policy if exists statements_manage_landlord_admin on public.tenant_statements;
create policy statements_manage_verified_landlord_admin on public.tenant_statements
for all using (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
)
with check (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
);

drop policy if exists statement_lines_manage_parent on public.statement_lines;
create policy statement_lines_manage_verified_parent on public.statement_lines
for all using (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (
        (public.owns_property(s.property_id) and public.is_verified_landlord())
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (
        (public.owns_property(s.property_id) and public.is_verified_landlord())
        or public.is_admin()
      )
  )
);

drop policy if exists statement_corrections_manage_parent on public.statement_corrections;
create policy statement_corrections_manage_verified_parent on public.statement_corrections
for all using (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (
        (public.owns_property(s.property_id) and public.is_verified_landlord())
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.tenant_statements s
    where s.id = statement_id
      and (
        (public.owns_property(s.property_id) and public.is_verified_landlord())
        or public.is_admin()
      )
  )
);

drop policy if exists maintenance_update_landlord_admin on public.maintenance_tickets;
create policy maintenance_update_verified_landlord_admin on public.maintenance_tickets
for update using (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
)
with check (
  (public.owns_property(property_id) and public.is_verified_landlord()) or public.is_admin()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-files',
  'verification-files',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists verification_files_read_owner_admin on storage.objects;
create policy verification_files_read_owner_admin on storage.objects
for select to authenticated using (
  bucket_id = 'verification-files'
  and (
    public.is_admin()
    or exists (
      select 1 from public.landlord_verification_applications a
      where a.id::text = (storage.foldername(name))[2]
        and a.landlord_id = auth.uid()
    )
  )
);

drop policy if exists verification_files_insert_owner on storage.objects;
create policy verification_files_insert_owner on storage.objects
for insert to authenticated with check (
  bucket_id = 'verification-files'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.landlord_verification_applications a
    where a.id::text = (storage.foldername(name))[2]
      and a.landlord_id = auth.uid()
      and (
        a.status = 'more_information_requested'
        or (
          a.status = 'pending'
          and not exists (
            select 1 from public.verification_documents d where d.storage_path = name
          )
        )
      )
  )
);

drop policy if exists verification_docs_insert_owner on public.verification_documents;
create policy verification_docs_insert_owner on public.verification_documents
for insert with check (
  document_kind in ('id_front', 'id_back', 'selfie', 'proof_of_address', 'ownership_proof')
  and exists (
    select 1
    from public.landlord_verification_applications a
    where a.id = application_id
      and a.landlord_id = auth.uid()
      and a.status in ('pending', 'more_information_requested')
  )
  and exists (
    select 1 from storage.objects o
    where o.bucket_id = 'verification-files'
      and o.name = storage_path
      and (storage.foldername(o.name))[1] = auth.uid()::text
      and (storage.foldername(o.name))[2] = application_id::text
  )
);

drop policy if exists verification_docs_delete_owner_pending on public.verification_documents;
drop policy if exists verification_docs_delete_owner_info_request on public.verification_documents;
create policy verification_docs_delete_owner_info_request on public.verification_documents
for delete using (
  exists (
    select 1
    from public.landlord_verification_applications a
    where a.id = application_id
      and a.landlord_id = auth.uid()
      and a.status = 'more_information_requested'
  )
);

drop policy if exists verification_files_delete_owner_pending on storage.objects;
create policy verification_files_delete_owner_pending on storage.objects
for delete to authenticated using (
  bucket_id = 'verification-files'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.landlord_verification_applications a
    where a.id::text = (storage.foldername(name))[2]
      and a.landlord_id = auth.uid()
      and (
        a.status = 'more_information_requested'
        or (
          a.status = 'pending'
          and not exists (
            select 1 from public.verification_documents d where d.storage_path = name
          )
        )
      )
  )
);

drop policy if exists verification_delete_owner_pending on public.landlord_verification_applications;
create policy verification_delete_owner_pending on public.landlord_verification_applications
for delete using (
  landlord_id = auth.uid()
  and status in ('pending', 'more_information_requested')
);

create or replace function public.admin_review_landlord_verification(
  p_application_id uuid,
  p_decision text,
  p_reason text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_status public.verification_status;
  v_name text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;
  if p_decision is null
     or p_decision not in ('approved', 'rejected', 'more_information_requested') then
    raise exception 'Unsupported verification decision.';
  end if;
  if p_decision in ('rejected', 'more_information_requested')
     and length(trim(coalesce(p_reason, ''))) < 8 then
    raise exception 'A reason of at least 8 characters is required.';
  end if;
  if p_decision = 'approved' and exists (
    select required.document_kind
    from (values ('id_front'), ('id_back'), ('selfie'), ('proof_of_address'))
      as required(document_kind)
    where not exists (
      select 1
      from public.verification_documents d
      join storage.objects o
        on o.bucket_id = 'verification-files' and o.name = d.storage_path
      where d.application_id = p_application_id
        and d.document_kind = required.document_kind
        and d.status in ('pending', 'accepted')
    )
  ) then
    raise exception 'All required identity documents must be uploaded before approval.';
  end if;

  v_status := p_decision::public.verification_status;
  select full_name into v_name
  from public.landlord_verification_applications
  where id = p_application_id
    and status in ('pending', 'under_review', 'more_information_requested')
  for update;
  if not found then
    raise exception 'The application is missing or has already been decided.';
  end if;

  update public.landlord_verification_applications
  set status = v_status,
      reviewer_id = auth.uid(),
      reviewer_notes = nullif(trim(coalesce(p_reason, '')), ''),
      reviewed_at = case when v_status = 'approved' then now() else null end,
      updated_at = now()
  where id = p_application_id;

  insert into public.admin_audit_logs (
    actor_id, action, target_type, target_id, target_label, reason, metadata
  )
  values (
    auth.uid(),
    'verification.' || p_decision,
    'verification_application',
    p_application_id,
    v_name,
    nullif(trim(coalesce(p_reason, '')), ''),
    jsonb_build_object('decision', p_decision)
  );
end;
$$;

revoke all on function public.admin_review_landlord_verification(uuid, text, text)
  from public, anon;
grant execute on function public.admin_review_landlord_verification(uuid, text, text)
  to authenticated;

create or replace function public.admin_log_verification_document_view(
  p_application_id uuid,
  p_document_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_label text;
  v_name text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;

  select d.document_kind, a.full_name
  into v_label, v_name
  from public.verification_documents d
  join public.landlord_verification_applications a on a.id = d.application_id
  where d.id = p_document_id and a.id = p_application_id;
  if not found then
    raise exception 'The document was not found for this application.';
  end if;

  insert into public.admin_audit_logs (
    actor_id, action, target_type, target_id, target_label, reason, metadata
  )
  values (
    auth.uid(),
    'document.viewed',
    'verification_document',
    p_document_id,
    v_label,
    'Opened during landlord verification review.',
    jsonb_build_object('application_id', p_application_id, 'landlord', v_name)
  );
end;
$$;

revoke all on function public.admin_log_verification_document_view(uuid, uuid)
  from public, anon;
grant execute on function public.admin_log_verification_document_view(uuid, uuid)
  to authenticated;

create or replace function public.resubmit_landlord_verification(
  p_application_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_city text,
  p_address text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.landlord_verification_applications a
    where a.id = p_application_id
      and a.landlord_id = auth.uid()
      and a.status = 'more_information_requested'
  ) then
    raise exception 'This application is not waiting for updated documents.';
  end if;
  if length(trim(coalesce(p_full_name, ''))) = 0
     or length(trim(coalesce(p_email, ''))) = 0
     or length(trim(coalesce(p_phone, ''))) = 0
     or length(trim(coalesce(p_city, ''))) = 0 then
    raise exception 'Complete the required landlord details before resubmitting.';
  end if;

  if exists (
    select required.document_kind
    from (values ('id_front'), ('id_back'), ('selfie'), ('proof_of_address'))
      as required(document_kind)
    where not exists (
      select 1
      from public.verification_documents d
      join storage.objects o
        on o.bucket_id = 'verification-files' and o.name = d.storage_path
      where d.application_id = p_application_id
        and d.document_kind = required.document_kind
        and d.status in ('pending', 'accepted')
    )
  ) then
    raise exception 'All required identity documents must be uploaded before resubmission.';
  end if;

  update public.landlord_verification_applications
  set full_name = trim(p_full_name),
      email = lower(trim(p_email)),
      phone = trim(p_phone),
      city = trim(p_city),
      address = trim(coalesce(p_address, '')),
      status = 'pending',
      reviewer_id = null,
      reviewer_notes = null,
      reviewed_at = null,
      updated_at = now()
  where id = p_application_id;
end;
$$;

revoke all on function public.resubmit_landlord_verification(uuid, text, text, text, text, text)
  from public, anon;
grant execute on function public.resubmit_landlord_verification(uuid, text, text, text, text, text)
  to authenticated;
