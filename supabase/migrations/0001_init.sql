-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists vector;
create extension if not exists pg_trgm;

-- Enums
create type user_role as enum ('user','provider','admin');
create type provider_status as enum ('draft','pending','approved','rejected','suspended');
create type booking_status as enum
  ('requested','accepted','on_the_way','arrived','in_progress','completed','cancelled','rejected','disputed');
create type urgency_level as enum ('emergency','today','scheduled','flexible');

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  full_name text,
  phone text,
  avatar_url text,
  language text default 'en',
  is_blocked boolean default false,
  is_demo boolean default false,
  created_at timestamptz default now()
);

-- Catalog
create table services (
  id serial primary key,
  slug text unique not null,
  name_en text not null,
  name_ur text not null,
  icon text,
  image_url text,
  min_price int,
  max_price int,
  sort_order int default 0,
  is_active boolean default true
);

create table sub_services (
  id serial primary key,
  service_id int references services(id) on delete cascade,
  name_en text not null,
  name_ur text
);

create table areas (
  id serial primary key,
  slug text unique not null,
  name_en text not null,
  name_ur text,
  city text not null check (city in ('Hyderabad','Jamshoro','Kotri')),
  lat double precision,
  lng double precision,
  is_active boolean default true
);

-- Providers
create table providers (
  id uuid primary key references profiles(id) on delete cascade,
  headline text,
  skill_title text,                    -- e.g. 'AC & Electrical Specialist'
  bio text,
  experience_years int default 0,
  status provider_status default 'draft',
  rejection_reason text,
  is_available boolean default false,
  is_verified boolean default false,
  rating_avg numeric(2,1) default 0,
  rating_count int default 0,
  jobs_completed int default 0,
  response_minutes int default 15,
  visit_fee int default 0,
  hourly_rate int,
  total_km_travelled int default 0,
  review_summary text,
  review_summary_count int default 0,
  embedding vector(384),
  created_at timestamptz default now()
);

create table provider_services (
  provider_id uuid references providers(id) on delete cascade,
  service_id int references services(id) on delete cascade,
  starting_price int,
  price_note text,
  primary key (provider_id, service_id)
);

create table provider_areas (
  provider_id uuid references providers(id) on delete cascade,
  area_id int references areas(id) on delete cascade,
  primary key (provider_id, area_id)
);

create table provider_gallery (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

-- Identity documents are deliberately isolated from the publicly searchable provider row.
create table provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  document_type text not null check (document_type in ('cnic_front','cnic_back','certificate','police_certificate')),
  storage_path text not null,
  cnic_last4 text,
  review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique(provider_id, document_type)
);

-- Customers' addresses
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  label text default 'Home',
  area_id int references areas(id),
  full_address text not null,
  lat double precision,
  lng double precision,
  is_default boolean default false
);

-- Bookings
create sequence booking_code_seq start 2041;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique default ('KRG-' || nextval('booking_code_seq')),   -- e.g. KRG-2041
  user_id uuid references profiles(id),
  provider_id uuid references providers(id),
  service_id int references services(id),
  sub_service_id int references sub_services(id),
  address_id uuid references addresses(id),
  description text,
  photos text[] default '{}',
  urgency urgency_level default 'scheduled',
  distance_km numeric(4,1),            -- shown as 'Approx: 3.2 km' on job cards
  scheduled_at timestamptz,
  status booking_status default 'requested',
  estimated_price int,
  final_price int,
  commission int default 0,
  payment_method text default 'cash',
  payment_status text default 'unpaid',
  cancel_reason text,
  created_at timestamptz default now(),
  accepted_at timestamptz,
  completed_at timestamptz
);

create table booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  status booking_status not null,
  note text,
  created_at timestamptz default now()
);

create table booking_extras (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  title text not null,
  amount int not null,
  approved boolean default false
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references bookings(id) on delete cascade,
  user_id uuid references profiles(id),
  provider_id uuid references providers(id),
  rating int check (rating between 1 and 5) not null,
  comment text,
  is_hidden boolean default false,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text,
  image_url text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  type text default 'info',
  is_read boolean default false,
  created_at timestamptz default now()
);

create table complaints (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id),
  raised_by uuid references profiles(id),
  reason text not null,
  status text default 'open' check (status in ('open','in_review','resolved')),
  admin_notes text,
  created_at timestamptz default now()
);

create table search_logs (
  id bigserial primary key,
  user_id uuid,
  query text,
  parsed jsonb,
  results_count int,
  used_ai boolean default false,
  created_at timestamptz default now()
);

create table audit_logs (
  id bigserial primary key,
  admin_id uuid,
  action text,
  target text,
  created_at timestamptz default now()
);

create table settings (
  key text primary key,
  value jsonb
);

create table provider_locations (
  booking_id uuid primary key references bookings(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  heading real,
  updated_at timestamptz not null default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Indexes (speed)
create index on providers (status, is_available, rating_avg desc);
create index on provider_services (service_id);
create index on provider_areas (area_id);
create index on bookings (user_id, status, created_at desc);
create index on bookings (provider_id, status, created_at desc);
create index on messages (booking_id, created_at);
create index on notifications (user_id, is_read, created_at desc);
create index on reviews (provider_id, created_at desc);
create index on search_logs using gin (to_tsvector('simple', query));
create index on profiles using gin (full_name gin_trgm_ops);
create index on provider_documents(provider_id, review_status);
create index on provider_locations(provider_id, updated_at desc);
create index on push_subscriptions(user_id);
create index on addresses(user_id, area_id);
create index on bookings(service_id, status, created_at desc);
create index on bookings(scheduled_at);
create index on booking_events(booking_id, created_at);
create index on booking_extras(booking_id, approved);
create index on complaints(status, created_at desc);
create index on sub_services(service_id);
create index on provider_gallery(provider_id, created_at desc);

-- Helper functions
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Auto-create profile on signup
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          new.phone,
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'user'));
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function handle_new_user();

-- Keep provider rating fresh
create or replace function refresh_provider_rating() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update providers p set
    rating_avg = coalesce((select round(avg(rating)::numeric,1) from reviews where provider_id = p.id and not is_hidden),0),
    rating_count = (select count(*) from reviews where provider_id = p.id and not is_hidden)
  where p.id = coalesce(new.provider_id, old.provider_id);
  return null;
end $$;

create trigger trg_review_rating
after insert or update or delete on reviews
for each row execute function refresh_provider_rating();

-- ============ ROW LEVEL SECURITY ============
alter table profiles          enable row level security;
alter table services          enable row level security;
alter table sub_services      enable row level security;
alter table areas             enable row level security;
alter table providers         enable row level security;
alter table provider_services enable row level security;
alter table provider_areas    enable row level security;
alter table provider_gallery  enable row level security;
alter table provider_documents enable row level security;
alter table addresses         enable row level security;
alter table bookings          enable row level security;
alter table booking_events    enable row level security;
alter table booking_extras    enable row level security;
alter table reviews           enable row level security;
alter table messages          enable row level security;
alter table notifications     enable row level security;
alter table complaints        enable row level security;
alter table search_logs       enable row level security;
alter table audit_logs        enable row level security;
alter table settings          enable row level security;
alter table provider_locations enable row level security;
alter table push_subscriptions enable row level security;

-- Public catalog (read), admin write
create policy "catalog read" on services for select using (true);
create policy "catalog admin" on services for all using (is_admin()) with check (is_admin());
create policy "sub read" on sub_services for select using (true);
create policy "sub admin" on sub_services for all using (is_admin()) with check (is_admin());
create policy "areas read" on areas for select using (true);
create policy "areas admin" on areas for all using (is_admin()) with check (is_admin());

-- Profiles
create policy "own profile read" on profiles for select using (id = auth.uid() or is_admin());
create policy "own profile update" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy "admin profiles" on profiles for all using (is_admin()) with check (is_admin());

-- Providers: approved are public; owner and admin full
create policy "providers public" on providers for select using (status = 'approved' or id = auth.uid() or is_admin());
create policy "providers owner write" on providers for insert with check (id = auth.uid() and status in ('draft','pending') and not is_verified);
create policy "providers owner update" on providers for update using (id = auth.uid()) with check (id = auth.uid() and status in ('draft','pending','rejected') and not is_verified);
create policy "providers admin" on providers for all using (is_admin()) with check (is_admin());

create policy "ps read" on provider_services for select using (exists (select 1 from providers p where p.id = provider_id and p.status = 'approved') or provider_id = auth.uid() or is_admin());
create policy "ps owner" on provider_services for all using (provider_id = auth.uid() or is_admin()) with check (provider_id = auth.uid() or is_admin());
create policy "pa read" on provider_areas for select using (exists (select 1 from providers p where p.id = provider_id and p.status = 'approved') or provider_id = auth.uid() or is_admin());
create policy "pa owner" on provider_areas for all using (provider_id = auth.uid() or is_admin()) with check (provider_id = auth.uid() or is_admin());
create policy "pg read" on provider_gallery for select using (exists (select 1 from providers p where p.id = provider_id and p.status = 'approved') or provider_id = auth.uid() or is_admin());
create policy "pg owner" on provider_gallery for all using (provider_id = auth.uid() or is_admin()) with check (provider_id = auth.uid() or is_admin());
create policy "provider documents private read" on provider_documents for select using (provider_id = auth.uid() or is_admin());
create policy "provider documents owner insert" on provider_documents for insert with check (provider_id = auth.uid() and storage_path like auth.uid()::text || '/%');
create policy "provider documents admin review" on provider_documents for update using (is_admin()) with check (is_admin());

-- Addresses
create policy "addr own" on addresses for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());

-- Bookings
create policy "bookings parties read" on bookings for select
  using (user_id = auth.uid() or provider_id = auth.uid() or is_admin());
create policy "bookings user create" on bookings for insert with check (user_id = auth.uid() and status = 'requested' and exists (select 1 from providers p where p.id = provider_id and p.status = 'approved'));
create policy "bookings parties update" on bookings for update
  using (user_id = auth.uid() or provider_id = auth.uid() or is_admin());

create policy "events read" on booking_events for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "events insert" on booking_events for insert
  with check (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));

create policy "extras parties read" on booking_extras for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "extras provider add" on booking_extras for insert
  with check (approved = false and exists (select 1 from bookings b where b.id = booking_id and b.provider_id = auth.uid() and b.status in ('accepted','on_the_way','arrived','in_progress')));
create policy "extras customer approve" on booking_extras for update
  using (exists (select 1 from bookings b where b.id = booking_id and b.user_id = auth.uid()))
  with check (exists (select 1 from bookings b where b.id = booking_id and b.user_id = auth.uid()));
create policy "extras admin" on booking_extras for all using (is_admin()) with check (is_admin());

-- Reviews
create policy "reviews read" on reviews for select using (not is_hidden or is_admin());
create policy "reviews create" on reviews for insert
  with check (user_id = auth.uid() and exists (select 1 from bookings b where b.id = booking_id and b.user_id = auth.uid() and b.provider_id = reviews.provider_id and b.status = 'completed'));
create policy "reviews admin" on reviews for update using (is_admin());

-- Messages (only booking parties)
create policy "msg read" on messages for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "msg send" on messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from bookings b where b.id = booking_id and b.status in ('accepted','on_the_way','arrived','in_progress','completed') and (b.user_id = auth.uid() or b.provider_id = auth.uid()) and (b.status <> 'completed' or b.completed_at > now() - interval '7 days')));
create policy "msg mark read" on messages for update
  using (sender_id <> auth.uid() and exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid())))
  with check (sender_id <> auth.uid());

-- Notifications
create policy "notif own" on notifications for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());

-- Complaints
create policy "complaints own" on complaints for select using (raised_by = auth.uid() or is_admin());
create policy "complaints create" on complaints for insert with check (raised_by = auth.uid() and exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid())));
create policy "complaints admin" on complaints for update using (is_admin());

-- Logs and settings
create policy "search log insert" on search_logs for insert with check (true);
create policy "search log admin" on search_logs for select using (is_admin());
create policy "audit admin" on audit_logs for all using (is_admin()) with check (is_admin());
create policy "settings read" on settings for select using (true);
create policy "settings admin" on settings for all using (is_admin()) with check (is_admin());

create policy "provider location parties read" on provider_locations for select using
  (exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or b.provider_id = auth.uid() or is_admin())));
create policy "provider location provider insert" on provider_locations for insert with check
  (provider_id = auth.uid() and exists (select 1 from bookings b where b.id = booking_id and b.provider_id = auth.uid() and b.status = 'on_the_way'));
create policy "provider location provider update" on provider_locations for update using (provider_id = auth.uid()) with check (provider_id = auth.uid() and exists (select 1 from bookings b where b.id = booking_id and b.provider_id = auth.uid() and b.status = 'on_the_way'));
create policy "provider location parties delete" on provider_locations for delete using (provider_id = auth.uid() or is_admin());
create policy "push own subscriptions" on push_subscriptions for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());

-- Public, least-data provider cards; identity, phone and exact coordinates are not exposed.
create view public_provider_cards with (security_invoker = false) as
select p.id, pr.full_name, pr.avatar_url, p.headline, p.skill_title, p.bio,
       p.experience_years, p.is_available, p.is_verified, p.rating_avg,
       p.rating_count, p.jobs_completed, p.response_minutes, p.visit_fee
from providers p join profiles pr on pr.id = p.id
where p.status = 'approved';
grant select on public_provider_cards to anon, authenticated;

create view public_provider_search with (security_invoker = false) as
select p.id, pr.full_name, pr.avatar_url, p.headline, p.skill_title, p.bio,
       p.experience_years, p.is_available, p.is_verified, p.rating_avg,
       p.rating_count, p.jobs_completed, p.response_minutes, p.visit_fee,
       coalesce(array_remove(array_agg(distinct s.slug),null),array[]::text[]) as service_slugs,
       coalesce(array_remove(array_agg(distinct a.slug),null),array[]::text[]) as area_slugs,
       coalesce(array_remove(array_agg(distinct a.name_en),null),array[]::text[]) as area_names,
       min(a.city) as city, min(ps.starting_price) as minimum_price
from providers p join profiles pr on pr.id=p.id
left join provider_services ps on ps.provider_id=p.id
left join services s on s.id=ps.service_id and s.is_active
left join provider_areas pa on pa.provider_id=p.id
left join areas a on a.id=pa.area_id and a.is_active
where p.status='approved'
group by p.id,pr.full_name,pr.avatar_url,p.headline,p.skill_title,p.bio,p.experience_years,
         p.is_available,p.is_verified,p.rating_avg,p.rating_count,p.jobs_completed,p.response_minutes,p.visit_fee
;
grant select on public_provider_search to anon, authenticated;

create or replace function validate_booking_transition() returns trigger
language plpgsql security definer set search_path = public as $$
declare actor_role user_role;
begin
  if auth.role() = 'service_role' then return new; end if;
  select role into actor_role from profiles where id = auth.uid();
  if tg_op = 'INSERT' then
    if new.status <> 'requested' then raise exception 'New bookings must start as requested'; end if;
    return new;
  end if;
  if new.status = old.status then return new; end if;
  if is_admin() then return new; end if;
  if old.status = 'requested' and new.status in ('accepted','rejected') and new.provider_id = auth.uid() then
    if old.created_at < now() - interval '10 minutes' then raise exception 'This request has expired'; end if;
  elsif old.status = 'requested' and new.status = 'cancelled' and old.user_id = auth.uid() then
    null;
  elsif old.status = 'accepted' and new.status = 'cancelled' and (old.user_id = auth.uid() or old.provider_id = auth.uid()) then
    null;
  elsif old.status = 'accepted' and new.status = 'on_the_way' and old.provider_id = auth.uid() then
    null;
  elsif old.status = 'on_the_way' and new.status = 'arrived' and old.provider_id = auth.uid() then
    null;
  elsif old.status = 'arrived' and new.status = 'in_progress' and old.provider_id = auth.uid() then
    null;
  elsif old.status = 'in_progress' and new.status = 'completed' and old.provider_id = auth.uid() then
    if coalesce(new.final_price, 0) <= 0 then raise exception 'Enter the final price to complete this job'; end if;
    new.commission := round(new.final_price * 0.10);
    new.completed_at := now();
  elsif old.status in ('requested','accepted','on_the_way','arrived','in_progress') and new.status = 'disputed' and old.user_id = auth.uid() then
    null;
  else
    raise exception 'This booking status change is not allowed';
  end if;
  return new;
end $$;
create trigger trg_booking_transition before insert or update of status on bookings
for each row execute function validate_booking_transition();

create or replace function protect_booking_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' then return new; end if;
  if new.user_id is distinct from old.user_id or new.provider_id is distinct from old.provider_id or
     new.service_id is distinct from old.service_id or new.sub_service_id is distinct from old.sub_service_id or
     new.address_id is distinct from old.address_id or new.created_at is distinct from old.created_at or
     new.code is distinct from old.code or
     new.estimated_price is distinct from old.estimated_price then
    if not is_admin() then raise exception 'Booking ownership and estimate fields are immutable'; end if;
  end if;
  if new.final_price is distinct from old.final_price and not (old.status = 'in_progress' and new.status = 'completed' and old.provider_id = auth.uid()) and not is_admin() then
    raise exception 'Final price can only be entered when completing the job';
  end if;
  if new.commission is distinct from old.commission and not (old.status = 'in_progress' and new.status = 'completed' and old.provider_id = auth.uid() and new.commission = round(new.final_price * 0.10)) and not is_admin() then
    raise exception 'Commission is calculated by the platform';
  end if;
  return new;
end $$;
create trigger trg_protect_booking_fields before update on bookings
for each row execute function protect_booking_fields();

create or replace function record_booking_event() returns trigger
language plpgsql security definer set search_path = public as $$
declare recipient uuid; event_note text;
begin
  if tg_op = 'INSERT' then
    insert into booking_events(booking_id,status,note) values(new.id,new.status,'Booking requested');
    recipient := new.provider_id;
    event_note := 'New service request';
  elsif new.status is distinct from old.status then
    insert into booking_events(booking_id,status,note) values(new.id,new.status,replace(new.status::text,'_',' '));
    recipient := case when auth.role() = 'service_role' then new.user_id when auth.uid() = new.provider_id then new.user_id else new.provider_id end;
    event_note := 'Booking status changed to ' || replace(new.status::text,'_',' ');
  else return new;
  end if;
  if recipient is not null then insert into notifications(user_id,title,body,type) values(recipient,event_note,new.code,'booking'); end if;
  return new;
end $$;
create trigger trg_booking_event after insert or update of status on bookings
for each row execute function record_booking_event();

create or replace function stop_completed_tracking() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('arrived','in_progress','completed','cancelled','rejected','disputed') and new.status is distinct from old.status then
    delete from provider_locations where booking_id = new.id;
  end if;
  return new;
end $$;
create trigger trg_stop_tracking after update of status on bookings
for each row execute function stop_completed_tracking();

-- Private identity and booking photo storage. Avatar and gallery are public.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('gallery','gallery',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('booking-photos','booking-photos',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('documents','documents',false,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf'])
on conflict (id) do nothing;
create policy "avatar public read" on storage.objects for select using (bucket_id in ('avatars','gallery'));
create policy "avatar owner upload" on storage.objects for insert with check (bucket_id in ('avatars','gallery') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar owner update" on storage.objects for update using (bucket_id in ('avatars','gallery') and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id in ('avatars','gallery') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "private docs parties read" on storage.objects for select using (bucket_id = 'documents' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
create policy "private docs owner upload" on storage.objects for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "booking photos parties upload" on storage.objects for insert with check (bucket_id = 'booking-photos' and exists (select 1 from bookings b where b.id::text = (storage.foldername(name))[1] and (b.user_id = auth.uid() or b.provider_id = auth.uid())));
create policy "booking photos parties read" on storage.objects for select using (bucket_id = 'booking-photos' and (is_admin() or exists (select 1 from bookings b where b.id::text = (storage.foldername(name))[1] and (b.user_id = auth.uid() or b.provider_id = auth.uid()))));

-- Realtime
alter publication supabase_realtime add table messages, bookings, notifications, provider_locations;
