-- ============================================================
-- ARTESANÍAS MELANIE — Schema inicial Supabase
-- ============================================================
-- Cómo usarlo:
-- 1. En el dashboard de Supabase, ve a "SQL Editor"
-- 2. Crea una nueva query y pega TODO este archivo
-- 3. Ejecuta (Run). Verás los mensajes de creación al final.
-- ============================================================

-- Extensión para UUIDs (Supabase la trae habilitada por defecto)
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLAS
-- ============================================================

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  color text not null check (color in ('rose', 'sage', 'lavender')),
  icon text not null check (icon in ('amigurumi', 'pattern', 'notebook')),
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null,
  details text[],
  price int not null check (price >= 0),         -- precio en CLP (sin decimales)
  stock int not null default 0 check (stock >= 0),
  category_id uuid not null references categories(id) on delete restrict,
  category_label text not null,
  color text not null check (color in ('rose', 'sage', 'lavender')),
  type text not null check (type in ('physical', 'digital')),
  badge text,
  images text[],                                  -- URLs de Supabase Storage
  pdf_url text,                                   -- solo para type='digital'
  featured boolean default false,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_category_idx on products(category_id);
create index if not exists products_published_idx on products(published);
create index if not exists products_featured_idx on products(featured) where featured;

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number bigserial unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_rut text,
  shipping_address text,
  shipping_city text,
  shipping_region text,
  notes text,
  subtotal int not null,
  shipping_cost int default 0,
  total int not null,
  status text not null default 'pending' check (status in (
    'pending',           -- creada, esperando pago
    'paid',              -- pagada (webhook MP)
    'preparing',         -- en preparación
    'shipped',           -- enviada
    'delivered',         -- entregada
    'cancelled',         -- cancelada
    'refunded'           -- reembolsada
  )),
  mp_preference_id text,
  mp_payment_id text,
  mp_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_idx on orders(created_at desc);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  product_name text not null,                     -- snapshot por si cambia el producto
  product_slug text not null,
  product_type text not null,
  unit_price int not null,
  quantity int not null check (quantity > 0),
  total int not null,
  created_at timestamptz default now()
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ============================================================
-- FUNCIONES & TRIGGERS
-- ============================================================

-- Mantiene updated_at al día
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- Función para descontar stock al confirmarse el pago
create or replace function decrement_stock_on_paid()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'paid' and (old.status is null or old.status <> 'paid') then
    update products p
       set stock = greatest(0, p.stock - oi.quantity)
      from order_items oi
     where oi.order_id = new.id
       and oi.product_id = p.id
       and p.type = 'physical';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_decrement_stock on orders;
create trigger orders_decrement_stock after update on orders
  for each row execute function decrement_stock_on_paid();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Lectura pública de categorías y productos publicados
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories
  for select using (true);

drop policy if exists "public read published products" on products;
create policy "public read published products" on products
  for select using (published = true);

-- Solo usuarios autenticados (admin) pueden modificar
drop policy if exists "auth write categories" on categories;
create policy "auth write categories" on categories
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "auth write products" on products;
create policy "auth write products" on products
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Las órdenes se crean desde server actions con service-role key;
-- los usuarios anónimos no leen ni escriben directamente.
drop policy if exists "auth read orders" on orders;
create policy "auth read orders" on orders
  for select using (auth.role() = 'authenticated');

drop policy if exists "auth update orders" on orders;
create policy "auth update orders" on orders
  for update using (auth.role() = 'authenticated');

drop policy if exists "auth read order items" on order_items;
create policy "auth read order items" on order_items
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- SEED — datos iniciales
-- ============================================================

insert into categories (slug, name, description, color, icon, sort_order)
values
  ('amigurumis', 'Amigurumis',
   'Personajes tejidos a crochet, suaves y abrazables. Cada uno con su personalidad.',
   'rose', 'amigurumi', 1),
  ('patrones', 'Patrones',
   'Instrucciones paso a paso en PDF para que tú también puedas crear tus propios amigurumis.',
   'sage', 'pattern', 2),
  ('agendas', 'Agendas',
   'Agendas y libretas personalizadas, decoradas a mano. Tu nombre, tus colores, tu estilo.',
   'lavender', 'notebook', 3)
on conflict (slug) do nothing;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Ejecuta esto manualmente en Supabase Dashboard → Storage:
--
-- 1. Crea bucket público "product-images"
--      - Public bucket: YES
--      - File size limit: 5 MB
--      - Allowed MIME: image/jpeg, image/png, image/webp
--
-- 2. Crea bucket privado "product-pdfs"
--      - Public bucket: NO
--      - File size limit: 20 MB
--      - Allowed MIME: application/pdf
--
-- ============================================================
