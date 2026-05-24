-- ============================================================
-- Migración 001 — Tokens de descarga para productos digitales
-- ============================================================
-- Corre esto en Supabase SQL Editor si ya creaste la tabla `orders`
-- con el schema.sql original (antes de añadir productos digitales).
--
-- Idempotente: se puede correr varias veces sin romper nada.
-- ============================================================

-- 1. Añadir columnas
alter table orders
  add column if not exists download_token uuid unique default uuid_generate_v4(),
  add column if not exists download_count int not null default 0;

-- 2. Asegurar que órdenes antiguas tengan token
--    (el DEFAULT se aplica solo a inserts nuevos; las filas viejas quedan null
--     a menos que Postgres rellene en el ALTER, que sí lo hace desde PG11).
update orders
  set download_token = uuid_generate_v4()
  where download_token is null;

-- 3. Índice para lookup rápido por token desde /api/download/[token]
create index if not exists orders_download_token_idx on orders(download_token);
