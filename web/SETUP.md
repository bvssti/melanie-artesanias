# Setup — Artesanías Melanie

Guía rápida para conectar Supabase y Mercado Pago al sitio.

## 1. Supabase (base de datos + auth + storage)

### 1.1 Crear el proyecto

1. Entra a https://supabase.com → **Sign up** (gratis).
2. **New project**:
   - Nombre: `artesanias-melanie`
   - Database password: genera una segura y guárdala (la pide para conectarse a Postgres directo, pero el sitio usa otras keys).
   - Región: **South America (São Paulo)** — la más cercana a Chile.
3. Espera 1–2 min mientras se aprovisiona.

### 1.2 Correr el schema

1. En el menú lateral, abre **SQL Editor**.
2. **+ New query**.
3. Abre el archivo `web/src/lib/supabase/schema.sql` y pega TODO su contenido.
4. **Run**. Verás "Success. No rows returned" o similar.

Esto crea las tablas `categories`, `products`, `orders`, `order_items`, los triggers de stock, y siembra las 3 categorías iniciales.

### 1.3 Crear los buckets de Storage

1. En el menú lateral, abre **Storage**.
2. **New bucket** llamado `product-images`:
   - Public bucket: **YES**
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`
3. **New bucket** llamado `product-pdfs`:
   - Public bucket: **NO**
   - File size limit: 20 MB
   - Allowed MIME types: `application/pdf`

### 1.4 Crear tu usuario admin

1. En el menú lateral, **Authentication → Users**.
2. **Add user → Create new user**.
3. Email + Contraseña (los que usarás para entrar a `/admin`).
4. **Auto Confirm User**: SÍ (para no tener que verificar email).

### 1.5 Copiar las credenciales

1. Menú lateral → **Settings → API**.
2. Anota:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (NO compartir) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Mercado Pago

### 2.1 Crear la aplicación

1. Entra a https://www.mercadopago.cl/developers/panel con tu cuenta de Mercado Pago.
2. **Tus integraciones → Crear aplicación**:
   - Nombre: `Artesanías Melanie`
   - Plataforma de e-commerce: **No, integración propia**
   - Productos a integrar: **Checkout Pro**

### 2.2 Credenciales

Una vez creada, ve a **Credenciales**:

- Para **pruebas (sandbox)** usa los tokens de **Prueba**.
- Para **producción** usa los tokens de **Producción** (necesitan que tu cuenta esté validada).

Anota el **Access Token** → `MP_ACCESS_TOKEN`.

### 2.3 Webhook

1. En tu app, **Webhooks → Configurar notificaciones**.
2. URL del webhook (modo producción):
   `https://TU-DOMINIO.cl/api/mercadopago/webhook`
   Para probar local, usa ngrok o el túnel de Vercel preview.
3. Eventos: marca **Pagos**.
4. Copia el **Clave secreta** → `MP_WEBHOOK_SECRET`.

---

## 3. Configurar el sitio

### 3.1 Variables de entorno

En la carpeta `web/`, copia `.env.example` como `.env.local` y rellena:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

MP_ACCESS_TOKEN=APP_USR-xxxxx-...
MP_WEBHOOK_SECRET=xxxxx
NEXT_PUBLIC_MP_SANDBOX=true

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Conectar las queries reales

Por ahora el sitio usa datos mock de `src/data/products.ts`. Para usar Supabase:

1. Abre `src/app/page.tsx` y reemplaza:
   ```ts
   import { getFeaturedProducts } from "@/data/products";
   // ...
   const featured = getFeaturedProducts().slice(0, 6);
   ```
   por:
   ```ts
   import { fetchFeaturedProducts } from "@/lib/supabase/queries";
   // ...
   const featured = await fetchFeaturedProducts();
   ```

2. Lo mismo en:
   - `src/app/catalogo/page.tsx` → `fetchProducts()`
   - `src/app/catalogo/[categoria]/page.tsx` → `fetchProductsByCategory(slug)`
   - `src/app/producto/[slug]/page.tsx` → `fetchProductBySlug(slug)`

3. Agrega `await` en las llamadas (ahora son async).

### 3.3 Probar

```bash
cd web
npm run dev
```

- Tienda: http://localhost:3000
- Admin: http://localhost:3000/admin/login (entra con el usuario que creaste)

---

## 4. Subir a producción (Vercel)

1. Sube el proyecto a GitHub.
2. https://vercel.com/new → importa el repo.
3. Root directory: `web`
4. Agrega las mismas variables de entorno en Vercel.
5. **Deploy**.
6. Una vez con dominio asignado, actualiza:
   - `NEXT_PUBLIC_APP_URL` en Vercel
   - La URL del webhook en Mercado Pago
   - `NEXT_PUBLIC_MP_SANDBOX=false` cuando uses credenciales de producción

---

## Checklist final

- [ ] Schema SQL corrido en Supabase
- [ ] Buckets de Storage creados
- [ ] Usuario admin creado y confirmado
- [ ] `.env.local` con las 6 variables
- [ ] App de Mercado Pago creada
- [ ] Webhook configurado
- [ ] Queries reales conectadas en las páginas
- [ ] Primer producto creado desde `/admin`
- [ ] Pedido de prueba con Mercado Pago sandbox
