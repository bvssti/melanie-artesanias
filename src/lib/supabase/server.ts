// Cliente Supabase para Server Components / Server Actions / Route Handlers.
// Next.js 16: `cookies()` es async.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createServerSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase no está configurado. Copia .env.example a .env.local y agrega tus credenciales (ver SETUP.md)."
    );
  }
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component sin permiso de escritura — ignorar
          }
        },
      },
    }
  );
}

import { createClient } from "@supabase/supabase-js";

// Cliente anónimo SIN cookies — apto para contextos donde `cookies()` no se
// puede llamar (generateStaticParams, generateMetadata en build estático,
// scripts). Sigue respetando RLS, así que solo lee lo que la policy
// "public read" permite. NO sirve para detectar sesión de usuario.
export function createAnonClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

// Cliente con service-role para operaciones administrativas (webhooks, server actions
// que necesiten bypass RLS). NUNCA exponer en el cliente.
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
