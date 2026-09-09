-- =============================================================
--  FasoLink — Schéma PostgreSQL (Supabase)
--  Tables : profiles, shops, products, subscriptions, reviews, contact_events
--  À exécuter dans l'éditeur SQL Supabase.
-- =============================================================

create extension if not exists "pgcrypto";

-- Types énumérés --------------------------------------------
do $$ begin
  create type profile_role as enum ('buyer', 'seller');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shop_category as enum
    ('alimentation', 'habillement', 'electronique', 'artisanat', 'services');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shop_status as enum ('pending', 'active', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_status as enum ('unverified', 'pending', 'verified');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_availability as enum
    ('in_stock', 'on_order', 'out_of_stock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_plan as enum ('mensuel', 'trimestriel', 'annuel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum
    ('trialing', 'pending', 'active', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_provider as enum ('orange_money', 'moov_money', 'wave');
exception when duplicate_object then null; end $$;

-- Fonction utilitaire : maj automatique de updated_at --------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =============================================================
--  profiles  (1-1 avec auth.users)
-- =============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        profile_role not null default 'buyer',
  full_name   text not null,
  phone       text,
  city        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Utilisateur FasoLink'),
    coalesce((new.raw_user_meta_data ->> 'role')::profile_role, 'buyer')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
--  shops
-- =============================================================
create table if not exists public.shops (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid not null references public.profiles (id) on delete cascade,
  name                 text not null,
  slug                 text not null unique,
  category             shop_category not null,
  description          text not null default '',
  city                 text not null,
  neighborhood         text,
  latitude             double precision,
  longitude            double precision,
  opening_hours        jsonb,             -- { "1": {"open":"08:00","close":"19:00"}, ... }
  whatsapp             text not null,
  logo_url             text,
  cover_url            text,
  gallery              text[] not null default '{}',
  status               shop_status not null default 'pending',
  verification_status  verification_status not null default 'unverified',
  is_featured          boolean not null default false,
  rating               numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count         integer not null default 0,
  whatsapp_clicks      integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists shops_category_idx on public.shops (category);
create index if not exists shops_city_idx     on public.shops (city);
create index if not exists shops_status_idx   on public.shops (status);
create index if not exists shops_owner_idx    on public.shops (owner_id);
create index if not exists shops_geo_idx      on public.shops (latitude, longitude);

drop trigger if exists trg_shops_updated on public.shops;
create trigger trg_shops_updated before update on public.shops
  for each row execute function public.set_updated_at();

-- =============================================================
--  products
-- =============================================================
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references public.shops (id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(12,2) not null check (price >= 0),
  currency      text not null default 'XOF',
  image_url     text,
  availability  product_availability not null default 'in_stock',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_shop_idx on public.products (shop_id);

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- =============================================================
--  subscriptions
-- =============================================================
create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  shop_id        uuid not null references public.shops (id) on delete cascade,
  plan           subscription_plan not null,
  status         subscription_status not null default 'pending',
  provider       payment_provider,
  gateway        text,                       -- 'CinetPay' | 'PayDunya'
  amount         numeric(12,2) not null check (amount >= 0),
  phone          text,
  reference      text unique,
  trial_ends_at  timestamptz,
  started_at     timestamptz,
  expires_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists subscriptions_shop_idx   on public.subscriptions (shop_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- =============================================================
--  reviews  (avis authentifiés — dépôt après contact vérifié)
-- =============================================================
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid not null references public.shops (id) on delete cascade,
  author_id    uuid references public.profiles (id) on delete set null,
  author_name  text not null,
  rating       integer not null check (rating between 1 and 5),
  comment      text not null,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists reviews_shop_idx on public.reviews (shop_id);

-- Recalcule la note moyenne de la boutique à chaque changement d'avis.
create or replace function public.refresh_shop_rating()
returns trigger language plpgsql as $$
declare
  v_shop uuid := coalesce(new.shop_id, old.shop_id);
begin
  update public.shops s set
    rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where shop_id = v_shop), 0),
    rating_count = (select count(*) from public.reviews where shop_id = v_shop)
  where s.id = v_shop;
  return null;
end $$;

drop trigger if exists trg_reviews_rating on public.reviews;
create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_shop_rating();

-- =============================================================
--  contact_events  (clics « Contacter sur WhatsApp »)
-- =============================================================
create table if not exists public.contact_events (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops (id) on delete cascade,
  product_id  uuid references public.products (id) on delete set null,
  channel     text not null default 'whatsapp',
  created_at  timestamptz not null default now()
);

create index if not exists contact_events_shop_idx on public.contact_events (shop_id, created_at);

-- RPC appelée côté client : journalise le contact + incrémente le compteur.
create or replace function public.track_contact(
  p_shop_id uuid,
  p_product_id uuid default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.contact_events (shop_id, product_id) values (p_shop_id, p_product_id);
  update public.shops set whatsapp_clicks = whatsapp_clicks + 1 where id = p_shop_id;
end $$;

grant execute on function public.track_contact(uuid, uuid) to anon, authenticated;

-- =============================================================
--  Row Level Security
--  NB : le formulaire vendeur ouvre une session Supabase ANONYME
--  (Auth → Providers → « Anonymous sign-ins » à activer). auth.uid()
--  vaut alors l'id de l'utilisateur anonyme et alimente les policies
--  ci-dessous (owner_id, subscriptions, storage). Le trigger
--  handle_new_user crée automatiquement le profil correspondant.
-- =============================================================
alter table public.profiles       enable row level security;
alter table public.shops          enable row level security;
alter table public.products       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.reviews        enable row level security;
alter table public.contact_events enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- shops
create policy "shops_public_read" on public.shops
  for select using (status = 'active' or owner_id = auth.uid());
create policy "shops_owner_insert" on public.shops
  for insert with check (owner_id = auth.uid());
create policy "shops_owner_update" on public.shops
  for update using (owner_id = auth.uid());
create policy "shops_owner_delete" on public.shops
  for delete using (owner_id = auth.uid());

-- products
create policy "products_public_read" on public.products
  for select using (
    exists (
      select 1 from public.shops s
      where s.id = products.shop_id
        and (s.status = 'active' or s.owner_id = auth.uid())
    )
  );
create policy "products_owner_write" on public.products
  for all using (
    exists (select 1 from public.shops s where s.id = products.shop_id and s.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.shops s where s.id = products.shop_id and s.owner_id = auth.uid())
  );

-- subscriptions
create policy "subscriptions_owner_all" on public.subscriptions
  for all using (
    exists (select 1 from public.shops s where s.id = subscriptions.shop_id and s.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.shops s where s.id = subscriptions.shop_id and s.owner_id = auth.uid())
  );

-- reviews : lecture publique ; écriture par un utilisateur connecté
-- ayant au moins un contact_event enregistré pour cette boutique.
create policy "reviews_public_read" on public.reviews
  for select using (true);
create policy "reviews_verified_insert" on public.reviews
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.contact_events e
      where e.shop_id = reviews.shop_id
    )
  );
create policy "reviews_author_update" on public.reviews
  for update using (auth.uid() = author_id);

-- contact_events : insertion libre (journalisation), lecture réservée au propriétaire.
create policy "contact_events_insert_any" on public.contact_events
  for insert with check (true);
create policy "contact_events_owner_read" on public.contact_events
  for select using (
    exists (select 1 from public.shops s where s.id = contact_events.shop_id and s.owner_id = auth.uid())
  );

-- =============================================================
--  Storage : bucket public pour logos & galeries
-- =============================================================
insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true)
on conflict (id) do nothing;

create policy "shop_assets_public_read" on storage.objects
  for select using (bucket_id = 'shop-assets');
create policy "shop_assets_auth_write" on storage.objects
  for insert with check (bucket_id = 'shop-assets' and auth.role() = 'authenticated');
create policy "shop_assets_auth_update" on storage.objects
  for update using (bucket_id = 'shop-assets' and auth.role() = 'authenticated');
